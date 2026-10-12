from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from ..database import get_db
from ..models.user import User, UserRole
from ..models.recruiter import Recruiter
from ..models.job import Job
from ..models.application import Application
from ..models.job_seeker import JobSeeker
from ..models.skill import UserSkill, JobSkill
from ..models.interview import Interview
from ..core.dependencies import get_current_recruiter
from ..services.ai_service import calculate_job_match

router = APIRouter(prefix="/api/recruiter", tags=["Recruiter"])


@router.get("/dashboard")
def get_dashboard(
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    
    total_jobs = db.query(Job).filter(Job.recruiter_id == recruiter.id).count()
    active_jobs = db.query(Job).filter(Job.recruiter_id == recruiter.id, Job.status == "active").count()
    
    job_ids = [j.id for j in db.query(Job.id).filter(Job.recruiter_id == recruiter.id).all()]
    
    total_applications = db.query(Application).filter(Application.job_id.in_(job_ids)).count() if job_ids else 0
    shortlisted = db.query(Application).filter(
        Application.job_id.in_(job_ids), Application.status == "shortlisted"
    ).count() if job_ids else 0
    interviews = db.query(Application).filter(
        Application.job_id.in_(job_ids), Application.status == "interview"
    ).count() if job_ids else 0
    selected = db.query(Application).filter(
        Application.job_id.in_(job_ids), Application.status == "selected"
    ).count() if job_ids else 0
    
    # Recent applications
    recent_apps = db.query(Application).options(
        joinedload(Application.job),
        joinedload(Application.job_seeker)
    ).filter(Application.job_id.in_(job_ids)).order_by(
        Application.applied_at.desc()
    ).limit(5).all() if job_ids else []
    
    recent_data = []
    for app in recent_apps:
        recent_data.append({
            "id": app.id,
            "status": app.status,
            "applied_at": app.applied_at.isoformat() if app.applied_at else None,
            "job_title": app.job.title if app.job else "",
            "candidate_name": f"{app.job_seeker.first_name} {app.job_seeker.last_name}" if app.job_seeker else ""
        })
    
    return {
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "total_applications": total_applications,
        "shortlisted": shortlisted,
        "interviews": interviews,
        "selected": selected,
        "recent_applications": recent_data
    }


@router.get("/jobs")
def get_my_jobs(
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    jobs = db.query(Job).options(
        joinedload(Job.skills).joinedload(JobSkill.skill),
        joinedload(Job.company)
    ).filter(Job.recruiter_id == recruiter.id).order_by(Job.created_at.desc()).all()
    
    result = []
    for job in jobs:
        skills = [{"name": js.skill.name} for js in job.skills if js.skill]
        result.append({
            "id": job.id,
            "title": job.title,
            "location": job.location,
            "job_type": job.job_type,
            "work_mode": job.work_mode,
            "status": job.status,
            "applications_count": job.applications_count,
            "views_count": job.views_count,
            "skills": skills,
            "created_at": job.created_at.isoformat() if job.created_at else None
        })
    
    return result


@router.get("/applicants")
def get_applicants(
    job_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    job_ids = [j.id for j in db.query(Job.id).filter(Job.recruiter_id == recruiter.id).all()]
    
    if not job_ids:
        return []
    
    query = db.query(Application).options(
        joinedload(Application.job),
        joinedload(Application.job_seeker).joinedload(JobSeeker.skills).joinedload(UserSkill.skill),
        joinedload(Application.job_seeker).joinedload(JobSeeker.user),
        joinedload(Application.resume),
        joinedload(Application.interview)
    ).filter(Application.job_id.in_(job_ids))
    
    if job_id:
        query = query.filter(Application.job_id == job_id)
    if status:
        query = query.filter(Application.status == status)
    
    apps = query.order_by(Application.applied_at.desc()).all()
    
    result = []
    for app in apps:
        seeker = app.job_seeker
        user_skills = [us.skill.name for us in seeker.skills if us.skill] if seeker else []
        
        # Calculate match if job has skills
        match_score = app.match_score
        if not match_score and app.job and seeker:
            job_skills_query = db.query(JobSkill).options(
                joinedload(JobSkill.skill)
            ).filter(JobSkill.job_id == app.job_id).all()
            job_skills = [js.skill.name for js in job_skills_query if js.skill]
            
            if job_skills:
                match_result = calculate_job_match(
                    user_skills=user_skills,
                    job_skills=job_skills,
                    user_experience=seeker.years_of_experience or 0,
                    job_experience_min=app.job.experience_min or 0,
                    user_location=seeker.location,
                    job_location=app.job.location,
                    job_work_mode=app.job.work_mode
                )
                match_score = match_result["overall_score"]
        
        result.append({
            "id": app.id,
            "status": app.status,
            "match_score": match_score,
            "cover_letter": app.cover_letter,
            "recruiter_notes": app.recruiter_notes,
            "applied_at": app.applied_at.isoformat() if app.applied_at else None,
            "job": {
                "id": app.job.id,
                "title": app.job.title
            } if app.job else None,
            "candidate": {
                "id": seeker.id,
                "first_name": seeker.first_name,
                "last_name": seeker.last_name,
                "email": seeker.user.email if seeker.user else "",
                "location": seeker.location,
                "years_of_experience": seeker.years_of_experience,
                "avatar_url": seeker.avatar_url,
                "skills": user_skills,
                "profile_completion": seeker.profile_completion
            } if seeker else None,
            "has_resume": app.resume is not None,
            "resume_id": app.resume_id,
            "interview": {
                "id": app.interview.id,
                "interview_date": app.interview.interview_date.isoformat() if app.interview and app.interview.interview_date else None,
                "interview_type": app.interview.interview_type if app.interview else None,
                "status": app.interview.status if app.interview else None
            } if app.interview else None
        })
    
    return result


@router.get("/candidates/{seeker_id}")
def get_candidate_profile(
    seeker_id: int,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).options(
        joinedload(JobSeeker.education),
        joinedload(JobSeeker.experience),
        joinedload(JobSeeker.certifications),
        joinedload(JobSeeker.projects),
        joinedload(JobSeeker.skills).joinedload(UserSkill.skill),
        joinedload(JobSeeker.user),
        joinedload(JobSeeker.resumes)
    ).filter(JobSeeker.id == seeker_id).first()
    
    if not seeker:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    return {
        "id": seeker.id,
        "first_name": seeker.first_name,
        "last_name": seeker.last_name,
        "email": seeker.user.email if seeker.user else "",
        "phone": seeker.phone,
        "location": seeker.location,
        "bio": seeker.bio,
        "avatar_url": seeker.avatar_url,
        "linkedin_url": seeker.linkedin_url,
        "github_url": seeker.github_url,
        "desired_role": seeker.desired_role,
        "years_of_experience": seeker.years_of_experience,
        "profile_completion": seeker.profile_completion,
        "skills": [
            {"name": us.skill.name, "proficiency": us.proficiency}
            for us in seeker.skills if us.skill
        ],
        "education": [
            {
                "degree": e.degree, "institution": e.institution,
                "field_of_study": e.field_of_study, "start_year": e.start_year, "end_year": e.end_year
            } for e in seeker.education
        ],
        "experience": [
            {
                "job_title": ex.job_title, "company": ex.company,
                "start_date": ex.start_date, "end_date": ex.end_date,
                "is_current": ex.is_current, "description": ex.description
            } for ex in seeker.experience
        ],
        "certifications": [{"name": c.name, "issuer": c.issuer} for c in seeker.certifications],
        "projects": [
            {
                "name": p.name, "description": p.description,
                "tech_stack": p.tech_stack, "project_url": p.project_url
            } for p in seeker.projects
        ],
        "resumes": [
            {"id": r.id, "filename": r.original_filename, "is_primary": r.is_primary}
            for r in seeker.resumes
        ]
    }
