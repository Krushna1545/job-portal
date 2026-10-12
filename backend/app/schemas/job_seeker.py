from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class EducationBase(BaseModel):
    degree: str
    institution: str
    field_of_study: Optional[str] = None
    start_year: Optional[str] = None
    end_year: Optional[str] = None
    grade: Optional[str] = None
    description: Optional[str] = None


class EducationCreate(EducationBase):
    pass


class EducationResponse(EducationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ExperienceBase(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[str] = "false"
    description: Optional[str] = None


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceResponse(ExperienceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CertificationBase(BaseModel):
    name: str
    issuer: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None


class CertificationCreate(CertificationBase):
    pass


class CertificationResponse(CertificationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    tech_stack: Optional[str] = None
    project_url: Optional[str] = None
    github_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SkillInput(BaseModel):
    name: str
    proficiency: Optional[str] = "intermediate"
    years_of_experience: Optional[int] = 0


class JobSeekerProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    desired_role: Optional[str] = None
    desired_salary: Optional[str] = None
    job_type_preference: Optional[str] = None
    remote_preference: Optional[str] = None
    years_of_experience: Optional[float] = None


class JobSeekerProfileResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    desired_role: Optional[str] = None
    desired_salary: Optional[str] = None
    job_type_preference: Optional[str] = None
    remote_preference: Optional[str] = None
    years_of_experience: Optional[float] = None
    profile_completion: Optional[int] = None
    education: List[EducationResponse] = []
    experience: List[ExperienceResponse] = []
    certifications: List[CertificationResponse] = []
    projects: List[ProjectResponse] = []
    skills: List[dict] = []
    created_at: datetime

    class Config:
        from_attributes = True
