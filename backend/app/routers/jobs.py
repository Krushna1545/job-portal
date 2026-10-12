from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from typing import Optional, List
from ..database import get_db
from ..models.user import User, UserRole
from ..models.job import Job
from ..models.recruiter import Recruiter
from ..models.skill import Skill, JobSkill, UserSkill
from ..models.application import Application
from ..models.saved_job import SavedJob
from ..models.job_seeker import JobSeeker
from ..schemas.job import JobCreate, JobUpdate, JobResponse
from ..core.dependencies import get_current_user, get_current_recruiter

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


def get_job_response(job: Job, current_user: Optional[User] = None, db: Session = None) -> dict:
    """Convert job model to response dict."""
    skills = []
    for js in job.skills:
        skills.append({
            "id": js.skill_id,
            "name": js.skill.name if js.skill else "",
            "is_required": js.is_required
        })
    
    company = None
    if job.company:
        company = {
            "id": job.company.id,
            "name": job.company.name,
            "logo_url": job.company.logo_url,
            "location": job.company.location,
            "industry": job.company.industry
        }
    
    result = {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "responsibilities": job.responsibilities,
        "location": job.location,
        "job_type": job.job_type,
        "work_mode": job.work_mode,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "salary_currency": job.salary_currency,
        "experience_min": job.experience_min,
        "experience_max": job.experience_max,
        "education_required": job.education_required,
        "status": job.status,
        "is_featured": job.is_featured,
        "views_count": job.views_count,
        "applications_count": job.applications_count,
        "skills": skills,
        "company": company,
        "created_at": job.created_at.isoformat() if job.created_at else None,
        "match_score": None,
        "is_saved": False,
        "has_applied": False
    }
    
    if current_user and db and current_user.role == UserRole.JOB_SEEKER:
        seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
        if seeker:
            # Check if saved
            saved = db.query(SavedJob).filter(
                SavedJob.job_seeker_id == seeker.id,
                SavedJob.job_id == job.id
            ).first()
            result["is_saved"] = saved is not None
            
            # Check if applied
            applied = db.query(Application).filter(
                Application.job_seeker_id == seeker.id,
                Application.job_id == job.id
            ).first()
            result["has_applied"] = applied is not None
    
    return result


@router.get("")
def get_jobs(
    keyword: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    work_mode: Optional[str] = Query(None),
    salary_min: Optional[float] = Query(None),
    salary_max: Optional[float] = Query(None),
    experience_min: Optional[float] = Query(None),
    experience_max: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Job).options(
        joinedload(Job.skills).joinedload(JobSkill.skill),
        joinedload(Job.company)
    ).filter(Job.status == "active")
    
    if keyword:
        query = query.filter(
            or_(
                Job.title.ilike(f"%{keyword}%"),
                Job.description.ilike(f"%{keyword}%")
            )
        )
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if job_type:
        query = query.filter(Job.job_type == job_type)
    if work_mode:
        query = query.filter(Job.work_mode == work_mode)
    if salary_min:
        query = query.filter(Job.salary_min >= salary_min)
    if salary_max:
        query = query.filter(Job.salary_max <= salary_max)
    if experience_min is not None:
        query = query.filter(Job.experience_min >= experience_min)
    if experience_max is not None:
        query = query.filter(Job.experience_max <= experience_max)
    
    total = query.count()
    jobs = query.order_by(Job.is_featured.desc(), Job.created_at.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()
    
    return {
        "jobs": [get_job_response(job) for job in jobs],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page
    }


@router.get("/public")
def get_jobs_public(
    keyword: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    work_mode: Optional[str] = Query(None),
    salary_min: Optional[float] = Query(None),
    salary_max: Optional[float] = Query(None),
    experience_min: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Job).options(
        joinedload(Job.skills).joinedload(JobSkill.skill),
        joinedload(Job.company)
    ).filter(Job.status == "active")
    
    if keyword:
        query = query.filter(
            or_(Job.title.ilike(f"%{keyword}%"), Job.description.ilike(f"%{keyword}%"))
        )
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if job_type:
        query = query.filter(Job.job_type == job_type)
    if work_mode:
        query = query.filter(Job.work_mode == work_mode)
    if salary_min:
        query = query.filter(Job.salary_min >= salary_min)
    if experience_min is not None:
        query = query.filter(Job.experience_min >= experience_min)
    
    total = query.count()
    jobs = query.order_by(Job.is_featured.desc(), Job.created_at.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()
    
    return {
        "jobs": [get_job_response(job) for job in jobs],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page
    }


@router.get("/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).options(
        joinedload(Job.skills).joinedload(JobSkill.skill),
        joinedload(Job.company)
    ).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Increment view count
    job.views_count = (job.views_count or 0) + 1
    db.commit()
    
    return get_job_response(job)


@router.post("")
def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    
    job = Job(
        recruiter_id=recruiter.id,
        company_id=recruiter.company_id,
        title=job_data.title,
        description=job_data.description,
        requirements=job_data.requirements,
        responsibilities=job_data.responsibilities,
        location=job_data.location,
        job_type=job_data.job_type,
        work_mode=job_data.work_mode,
        salary_min=job_data.salary_min,
        salary_max=job_data.salary_max,
        salary_currency=job_data.salary_currency,
        experience_min=job_data.experience_min,
        experience_max=job_data.experience_max,
        education_required=job_data.education_required,
        deadline=job_data.deadline,
        status="active"
    )
    db.add(job)
    db.flush()
    
    # Add skills
    for skill_name in (job_data.skills or []):
        skill = db.query(Skill).filter(Skill.name.ilike(skill_name)).first()
        if not skill:
            skill = Skill(name=skill_name.strip())
            db.add(skill)
            db.flush()
        job_skill = JobSkill(job_id=job.id, skill_id=skill.id)
        db.add(job_skill)
    
    db.commit()
    db.refresh(job)
    
    return {"message": "Job created successfully", "job_id": job.id}


@router.put("/{job_id}")
def update_job(
    job_id: int,
    job_data: JobUpdate,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    job = db.query(Job).filter(Job.id == job_id, Job.recruiter_id == recruiter.id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or unauthorized")
    
    update_data = job_data.model_dump(exclude_unset=True, exclude={"skills"})
    for field, value in update_data.items():
        setattr(job, field, value)
    
    if job_data.skills is not None:
        # Delete existing skills
        db.query(JobSkill).filter(JobSkill.job_id == job_id).delete()
        for skill_name in job_data.skills:
            skill = db.query(Skill).filter(Skill.name.ilike(skill_name)).first()
            if not skill:
                skill = Skill(name=skill_name.strip())
                db.add(skill)
                db.flush()
            job_skill = JobSkill(job_id=job.id, skill_id=skill.id)
            db.add(job_skill)
    
    db.commit()
    return {"message": "Job updated successfully"}


@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    job = db.query(Job).filter(Job.id == job_id, Job.recruiter_id == recruiter.id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or unauthorized")
    
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}
