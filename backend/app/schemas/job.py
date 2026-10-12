from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class JobCreate(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = "full-time"
    work_mode: Optional[str] = "onsite"
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: Optional[str] = "USD"
    experience_min: Optional[float] = 0
    experience_max: Optional[float] = None
    education_required: Optional[str] = None
    deadline: Optional[datetime] = None
    skills: Optional[List[str]] = []


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    work_mode: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    experience_min: Optional[float] = None
    experience_max: Optional[float] = None
    education_required: Optional[str] = None
    status: Optional[str] = None
    skills: Optional[List[str]] = None


class JobSkillResponse(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    is_required: str

    class Config:
        from_attributes = True


class CompanyBasic(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None
    location: Optional[str] = None
    industry: Optional[str] = None

    class Config:
        from_attributes = True


class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    work_mode: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: Optional[str] = None
    experience_min: Optional[float] = None
    experience_max: Optional[float] = None
    education_required: Optional[str] = None
    status: Optional[str] = None
    is_featured: Optional[bool] = None
    views_count: Optional[int] = None
    applications_count: Optional[int] = None
    skills: List[dict] = []
    company: Optional[CompanyBasic] = None
    match_score: Optional[float] = None
    is_saved: Optional[bool] = None
    has_applied: Optional[bool] = None
    created_at: datetime

    class Config:
        from_attributes = True


class JobFilter(BaseModel):
    keyword: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    work_mode: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    experience_min: Optional[float] = None
    experience_max: Optional[float] = None
    skills: Optional[List[str]] = None
    page: int = 1
    per_page: int = 20
