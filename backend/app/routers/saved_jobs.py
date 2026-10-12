from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models.user import User, UserRole
from ..models.job_seeker import JobSeeker
from ..models.saved_job import SavedJob
from ..models.job import Job
from ..models.skill import JobSkill
from ..core.dependencies import get_current_user

router = APIRouter(prefix="/api/saved-jobs", tags=["Saved Jobs"])


@router.post("/{job_id}")
def save_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=403, detail="Only job seekers can save jobs")
    
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    
    existing = db.query(SavedJob).filter(
        SavedJob.job_seeker_id == seeker.id,
        SavedJob.job_id == job_id
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Job removed from saved", "saved": False}
    
    saved = SavedJob(job_seeker_id=seeker.id, job_id=job_id)
    db.add(saved)
    db.commit()
    return {"message": "Job saved successfully", "saved": True}


@router.get("")
def get_saved_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    if not seeker:
        return []
    
    saved = db.query(SavedJob).options(
        joinedload(SavedJob.job).joinedload(Job.company),
        joinedload(SavedJob.job).joinedload(Job.skills).joinedload(JobSkill.skill)
    ).filter(SavedJob.job_seeker_id == seeker.id).order_by(SavedJob.saved_at.desc()).all()
    
    result = []
    for s in saved:
        job = s.job
        if job:
            skills = [{"name": js.skill.name} for js in job.skills if js.skill]
            result.append({
                "saved_id": s.id,
                "saved_at": s.saved_at.isoformat() if s.saved_at else None,
                "job": {
                    "id": job.id,
                    "title": job.title,
                    "location": job.location,
                    "job_type": job.job_type,
                    "work_mode": job.work_mode,
                    "salary_min": job.salary_min,
                    "salary_max": job.salary_max,
                    "skills": skills,
                    "company": {
                        "name": job.company.name,
                        "logo_url": job.company.logo_url
                    } if job.company else None,
                    "created_at": job.created_at.isoformat() if job.created_at else None
                }
            })
    
    return result
