from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Optional, List
from ..database import get_db
from ..models.user import User, UserRole
from ..models.job_seeker import JobSeeker
from ..models.job import Job
from ..models.resume import Resume
from ..models.skill import UserSkill, JobSkill
from ..models.ai_analysis import AIAnalysis
from ..core.dependencies import get_current_user
from ..services.ai_service import (
    calculate_resume_score,
    calculate_job_match,
    get_skill_gap_analysis,
    get_job_recommendations,
    analyze_job_description,
    extract_skills_from_text
)

router = APIRouter(prefix="/api/ai", tags=["AI"])


class JobMatchRequest(BaseModel):
    job_id: int


class SkillGapRequest(BaseModel):
    job_id: int


class JDAnalysisRequest(BaseModel):
    description: str


@router.post("/resume-score")
def analyze_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).options(
        joinedload(JobSeeker.education),
        joinedload(JobSeeker.experience),
        joinedload(JobSeeker.certifications),
        joinedload(JobSeeker.projects),
        joinedload(JobSeeker.skills).joinedload(UserSkill.skill),
        joinedload(JobSeeker.resumes)
    ).filter(JobSeeker.user_id == current_user.id).first()
    
    if not seeker:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Get primary resume text
    primary_resume = next((r for r in seeker.resumes if r.is_primary), None)
    resume_text = primary_resume.extracted_text if primary_resume else ""
    
    # Get user skills
    user_skills = [us.skill.name for us in seeker.skills if us.skill]
    
    # Extract additional skills from resume text
    if resume_text:
        extracted_skills = extract_skills_from_text(resume_text)
        all_skills = list(set(user_skills + extracted_skills))
    else:
        all_skills = user_skills
    
    result = calculate_resume_score(
        text=resume_text,
        skills=all_skills,
        has_education=len(seeker.education) > 0,
        has_experience=len(seeker.experience) > 0,
        has_projects=len(seeker.projects) > 0,
        has_certifications=len(seeker.certifications) > 0
    )
    
    # Save analysis
    analysis = AIAnalysis(
        job_seeker_id=seeker.id,
        resume_id=primary_resume.id if primary_resume else None,
        analysis_type="resume_score",
        score=result["total_score"],
        extracted_skills=all_skills,
        recommendations=result["suggestions"],
        raw_result=result
    )
    db.add(analysis)
    db.commit()
    
    return {
        "score": result["total_score"],
        "grade": result["grade"],
        "breakdown": result["breakdown"],
        "suggestions": result["suggestions"],
        "extracted_skills": all_skills[:20]
    }


@router.post("/job-match")
def get_job_match(
    request: JobMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).options(
        joinedload(JobSeeker.skills).joinedload(UserSkill.skill)
    ).filter(JobSeeker.user_id == current_user.id).first()
    
    if not seeker:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    job = db.query(Job).options(
        joinedload(Job.skills).joinedload(JobSkill.skill)
    ).filter(Job.id == request.job_id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    user_skills = [us.skill.name for us in seeker.skills if us.skill]
    job_skills = [js.skill.name for js in job.skills if js.skill]
    
    result = calculate_job_match(
        user_skills=user_skills,
        job_skills=job_skills,
        user_experience=seeker.years_of_experience or 0,
        job_experience_min=job.experience_min or 0,
        user_location=seeker.location,
        job_location=job.location,
        job_work_mode=job.work_mode
    )
    
    return result


@router.get("/recommendations")
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).options(
        joinedload(JobSeeker.skills).joinedload(UserSkill.skill)
    ).filter(JobSeeker.user_id == current_user.id).first()
    
    if not seeker:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    user_skills = [us.skill.name for us in seeker.skills if us.skill]
    
    # Get active jobs
    jobs = db.query(Job).options(
        joinedload(Job.skills).joinedload(JobSkill.skill),
        joinedload(Job.company)
    ).filter(Job.status == "active").limit(50).all()
    
    jobs_data = []
    for job in jobs:
        job_skills = [js.skill.name for js in job.skills if js.skill]
        jobs_data.append({
            "id": job.id,
            "title": job.title,
            "location": job.location,
            "job_type": job.job_type,
            "work_mode": job.work_mode,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "experience_min": job.experience_min,
            "skills": job_skills,
            "company": {
                "id": job.company.id,
                "name": job.company.name,
                "logo_url": job.company.logo_url
            } if job.company else None,
            "created_at": job.created_at.isoformat() if job.created_at else None
        })
    
    recommendations = get_job_recommendations(
        user_skills=user_skills,
        user_experience=seeker.years_of_experience or 0,
        jobs_data=jobs_data
    )
    
    return {"recommendations": recommendations}


@router.post("/skill-gap")
def analyze_skill_gap(
    request: SkillGapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).options(
        joinedload(JobSeeker.skills).joinedload(UserSkill.skill)
    ).filter(JobSeeker.user_id == current_user.id).first()
    
    if not seeker:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    job = db.query(Job).options(
        joinedload(Job.skills).joinedload(JobSkill.skill)
    ).filter(Job.id == request.job_id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    user_skills = [us.skill.name for us in seeker.skills if us.skill]
    job_skills = [js.skill.name for js in job.skills if js.skill]
    
    result = get_skill_gap_analysis(user_skills, job_skills)
    
    # Save analysis
    analysis = AIAnalysis(
        job_seeker_id=seeker.id,
        job_id=job.id,
        analysis_type="skill_gap",
        score=result["match_percentage"],
        extracted_skills=user_skills,
        missing_skills=result["missing_skills"],
        recommendations=list(result["learning_recommendations"].values()),
        raw_result=result
    )
    db.add(analysis)
    db.commit()
    
    return result


@router.post("/analyze-jd")
def analyze_job_description_endpoint(
    request: JDAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = analyze_job_description(request.description)
    return result
