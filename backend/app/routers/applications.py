from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from ..database import get_db
from ..models.user import User, UserRole
from ..models.application import Application
from ..models.job import Job
from ..models.job_seeker import JobSeeker
from ..models.recruiter import Recruiter
from ..models.notification import Notification
from ..models.interview import Interview
from ..schemas.application import ApplicationCreate, ApplicationStatusUpdate, InterviewCreate
from ..core.dependencies import get_current_user

router = APIRouter(prefix="/api/applications", tags=["Applications"])


def serialize_application(app: Application) -> dict:
    result = {
        "id": app.id,
        "job_id": app.job_id,
        "job_seeker_id": app.job_seeker_id,
        "status": app.status,
        "cover_letter": app.cover_letter,
        "match_score": app.match_score,
        "recruiter_notes": app.recruiter_notes,
        "applied_at": app.applied_at.isoformat() if app.applied_at else None,
        "updated_at": app.updated_at.isoformat() if app.updated_at else None
    }
    
    if app.job:
        result["job"] = {
            "id": app.job.id,
            "title": app.job.title,
            "location": app.job.location,
            "job_type": app.job.job_type,
            "work_mode": app.job.work_mode,
            "salary_min": app.job.salary_min,
            "salary_max": app.job.salary_max,
            "company": {
                "id": app.job.company.id,
                "name": app.job.company.name,
                "logo_url": app.job.company.logo_url
            } if app.job.company else None
        }
    
    if app.job_seeker:
        result["job_seeker"] = {
            "id": app.job_seeker.id,
            "first_name": app.job_seeker.first_name,
            "last_name": app.job_seeker.last_name,
            "avatar_url": app.job_seeker.avatar_url,
            "email": app.job_seeker.user.email if app.job_seeker.user else None
        }
    
    if app.interview:
        result["interview"] = {
            "id": app.interview.id,
            "interview_date": app.interview.interview_date.isoformat() if app.interview.interview_date else None,
            "interview_type": app.interview.interview_type,
            "status": app.interview.status,
            "meeting_link": app.interview.meeting_link
        }
    
    return result


@router.post("")
def apply_for_job(
    app_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=403, detail="Only job seekers can apply")
    
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    if not seeker:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Check if already applied
    existing = db.query(Application).filter(
        Application.job_seeker_id == seeker.id,
        Application.job_id == app_data.job_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied for this job")
    
    job = db.query(Job).filter(Job.id == app_data.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    application = Application(
        job_seeker_id=seeker.id,
        job_id=app_data.job_id,
        resume_id=app_data.resume_id,
        cover_letter=app_data.cover_letter,
        status="applied"
    )
    db.add(application)
    
    # Update applications count
    job.applications_count = (job.applications_count or 0) + 1
    
    # Create notification for recruiter
    if job.recruiter and job.recruiter.user_id:
        notif = Notification(
            user_id=job.recruiter.user_id,
            title="New Application",
            message=f"{seeker.first_name} {seeker.last_name} applied for {job.title}",
            type="new_application",
            link=f"/recruiter/applicants"
        )
        db.add(notif)
    
    db.commit()
    return {"message": "Application submitted successfully"}


@router.get("")
def get_applications(
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.JOB_SEEKER:
        seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
        if not seeker:
            return []
        
        query = db.query(Application).options(
            joinedload(Application.job).joinedload(Job.company),
            joinedload(Application.interview)
        ).filter(Application.job_seeker_id == seeker.id)
        
        if status:
            query = query.filter(Application.status == status)
        
        apps = query.order_by(Application.applied_at.desc()).all()
        return [serialize_application(app) for app in apps]
    
    elif current_user.role == UserRole.RECRUITER:
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
        
        query = db.query(Application).options(
            joinedload(Application.job),
            joinedload(Application.job_seeker).joinedload(JobSeeker.user),
            joinedload(Application.interview)
        ).join(Job).filter(Job.recruiter_id == recruiter.id)
        
        if status:
            query = query.filter(Application.status == status)
        
        apps = query.order_by(Application.applied_at.desc()).all()
        return [serialize_application(app) for app in apps]
    
    return []


@router.get("/{app_id}")
def get_application(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).options(
        joinedload(Application.job).joinedload(Job.company),
        joinedload(Application.job_seeker).joinedload(JobSeeker.user),
        joinedload(Application.interview)
    ).filter(Application.id == app_id).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return serialize_application(app)


@router.put("/{app_id}/status")
def update_application_status(
    app_id: int,
    status_data: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can update status")
    
    app = db.query(Application).options(
        joinedload(Application.job),
        joinedload(Application.job_seeker).joinedload(JobSeeker.user)
    ).filter(Application.id == app_id).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app.status = status_data.status
    if status_data.recruiter_notes:
        app.recruiter_notes = status_data.recruiter_notes
    
    # Notify job seeker
    if app.job_seeker and app.job_seeker.user_id:
        status_messages = {
            "under_review": "Your application is under review",
            "shortlisted": "Congratulations! You've been shortlisted",
            "interview": "You've been selected for an interview",
            "selected": "Congratulations! You've been selected",
            "rejected": "Your application status has been updated"
        }
        msg = status_messages.get(status_data.status, "Your application status has been updated")
        notif = Notification(
            user_id=app.job_seeker.user_id,
            title="Application Update",
            message=f"{msg} for {app.job.title if app.job else 'the position'}",
            type="application_update"
        )
        db.add(notif)
    
    db.commit()
    return {"message": "Status updated successfully"}


@router.post("/interview")
def schedule_interview(
    interview_data: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can schedule interviews")
    
    app = db.query(Application).options(
        joinedload(Application.job_seeker).joinedload(JobSeeker.user)
    ).filter(Application.id == interview_data.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check if interview already exists
    existing = db.query(Interview).filter(Interview.application_id == interview_data.application_id).first()
    if existing:
        # Update existing
        existing.interview_date = interview_data.interview_date
        existing.interview_type = interview_data.interview_type
        existing.location = interview_data.location
        existing.meeting_link = interview_data.meeting_link
        existing.notes = interview_data.notes
    else:
        interview = Interview(
            application_id=interview_data.application_id,
            interview_date=interview_data.interview_date,
            interview_type=interview_data.interview_type,
            location=interview_data.location,
            meeting_link=interview_data.meeting_link,
            duration_minutes=interview_data.duration_minutes,
            notes=interview_data.notes
        )
        db.add(interview)
    
    app.status = "interview"
    
    # Notify job seeker
    if app.job_seeker and app.job_seeker.user_id:
        notif = Notification(
            user_id=app.job_seeker.user_id,
            title="Interview Scheduled",
            message=f"An interview has been scheduled for you on {interview_data.interview_date.strftime('%B %d, %Y')}",
            type="interview"
        )
        db.add(notif)
    
    db.commit()
    return {"message": "Interview scheduled successfully"}
