from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id", ondelete="CASCADE"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    title = Column(String(300), nullable=False, index=True)
    description = Column(Text, nullable=False)
    requirements = Column(Text)
    responsibilities = Column(Text)
    location = Column(String(200))
    job_type = Column(String(50))  # full-time, part-time, contract, internship
    work_mode = Column(String(50))  # remote, onsite, hybrid
    salary_min = Column(Float)
    salary_max = Column(Float)
    salary_currency = Column(String(10), default="USD")
    experience_min = Column(Float, default=0)
    experience_max = Column(Float)
    education_required = Column(String(200))
    status = Column(String(50), default="active")  # active, closed, draft
    is_featured = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    applications_count = Column(Integer, default=0)
    deadline = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    recruiter = relationship("Recruiter", back_populates="jobs")
    company = relationship("Company", back_populates="jobs")
    skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job")
    saved_by = relationship("SavedJob", back_populates="job")
