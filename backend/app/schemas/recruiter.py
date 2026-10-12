from pydantic import BaseModel
from typing import Optional


class CompanyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    founded_year: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    founded_year: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None


class CompanyResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    founded_year: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    is_verified: bool

    class Config:
        from_attributes = True


class RecruiterProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    linkedin_url: Optional[str] = None


class RecruiterProfileResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    phone: Optional[str] = None
    job_title: Optional[str] = None
    avatar_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    company: Optional[CompanyResponse] = None

    class Config:
        from_attributes = True
