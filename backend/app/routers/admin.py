from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from ..database import get_db
from ..models.user import User, UserRole
from ..models.job_seeker import JobSeeker
from ..models.recruiter import Recruiter
from ..models.job import Job
from ..models.application import Application
from ..core.dependencies import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/dashboard")
def get_admin_dashboard(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_seekers = db.query(User).filter(User.role == UserRole.JOB_SEEKER).count()
    total_recruiters = db.query(User).filter(User.role == UserRole.RECRUITER).count()
    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.status == "active").count()
    total_applications = db.query(Application).count()
    
    # Recent users
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(10).all()
    
    return {
        "stats": {
            "total_users": total_users,
            "job_seekers": total_seekers,
            "recruiters": total_recruiters,
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "total_applications": total_applications
        },
        "recent_users": [
            {
                "id": u.id,
                "email": u.email,
                "role": u.role.value,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None
            }
            for u in recent_users
        ]
    }


@router.get("/users")
def get_all_users(
    role: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    
    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page-1)*per_page).limit(per_page).all()
    
    result = []
    for u in users:
        user_data = {
            "id": u.id,
            "email": u.email,
            "role": u.role.value,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        if u.job_seeker_profile:
            user_data["name"] = f"{u.job_seeker_profile.first_name} {u.job_seeker_profile.last_name}"
        elif u.recruiter_profile:
            user_data["name"] = f"{u.recruiter_profile.first_name} {u.recruiter_profile.last_name}"
        result.append(user_data)
    
    return {"users": result, "total": total, "page": page, "per_page": per_page}


@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}", "is_active": user.is_active}


@router.get("/jobs")
def get_all_jobs(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Job).options(joinedload(Job.company))
    if status:
        query = query.filter(Job.status == status)
    
    total = query.count()
    jobs = query.order_by(Job.created_at.desc()).offset((page-1)*per_page).limit(per_page).all()
    
    return {
        "jobs": [
            {
                "id": j.id,
                "title": j.title,
                "status": j.status,
                "company_name": j.company.name if j.company else "N/A",
                "location": j.location,
                "applications_count": j.applications_count,
                "created_at": j.created_at.isoformat() if j.created_at else None
            }
            for j in jobs
        ],
        "total": total
    }


@router.delete("/jobs/{job_id}")
def admin_delete_job(
    job_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}


@router.get("/applications")
def get_all_applications(
    page: int = Query(1, ge=1),
    per_page: int = Query(20),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Application).options(
        joinedload(Application.job),
        joinedload(Application.job_seeker)
    )
    total = query.count()
    apps = query.order_by(Application.applied_at.desc()).offset((page-1)*per_page).limit(per_page).all()
    
    return {
        "applications": [
            {
                "id": a.id,
                "status": a.status,
                "job_title": a.job.title if a.job else "",
                "candidate": f"{a.job_seeker.first_name} {a.job_seeker.last_name}" if a.job_seeker else "",
                "applied_at": a.applied_at.isoformat() if a.applied_at else None
            }
            for a in apps
        ],
        "total": total
    }
