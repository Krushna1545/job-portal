from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ApplicationCreate(BaseModel):
    job_id: int
    resume_id: Optional[int] = None
    cover_letter: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: str
    recruiter_notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    job_seeker_id: int
    status: str
    cover_letter: Optional[str] = None
    match_score: Optional[float] = None
    recruiter_notes: Optional[str] = None
    applied_at: datetime
    updated_at: Optional[datetime] = None
    job: Optional[dict] = None
    job_seeker: Optional[dict] = None

    class Config:
        from_attributes = True


class InterviewCreate(BaseModel):
    application_id: int
    interview_date: datetime
    interview_type: str
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    duration_minutes: Optional[int] = 60
    notes: Optional[str] = None


class InterviewResponse(BaseModel):
    id: int
    application_id: int
    interview_date: datetime
    interview_type: str
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
