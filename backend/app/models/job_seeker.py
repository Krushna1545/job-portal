from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class JobSeeker(Base):
    __tablename__ = "job_seekers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    location = Column(String(200))
    bio = Column(Text)
    avatar_url = Column(String(500))
    linkedin_url = Column(String(500))
    github_url = Column(String(500))
    portfolio_url = Column(String(500))
    desired_role = Column(String(200))
    desired_salary = Column(String(100))
    job_type_preference = Column(String(50))  # full-time, part-time, contract
    remote_preference = Column(String(50))  # remote, onsite, hybrid
    years_of_experience = Column(Float, default=0)
    profile_completion = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="job_seeker_profile")
    education = relationship("Education", back_populates="job_seeker", cascade="all, delete-orphan")
    experience = relationship("Experience", back_populates="job_seeker", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="job_seeker", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="job_seeker", cascade="all, delete-orphan")
    skills = relationship("UserSkill", back_populates="job_seeker", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="job_seeker", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job_seeker")
    saved_jobs = relationship("SavedJob", back_populates="job_seeker")
    ai_analyses = relationship("AIAnalysis", back_populates="job_seeker")


class Education(Base):
    __tablename__ = "education"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"))
    degree = Column(String(200), nullable=False)
    institution = Column(String(300), nullable=False)
    field_of_study = Column(String(200))
    start_year = Column(String(10))
    end_year = Column(String(10))
    grade = Column(String(50))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job_seeker = relationship("JobSeeker", back_populates="education")


class Experience(Base):
    __tablename__ = "experience"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"))
    job_title = Column(String(200), nullable=False)
    company = Column(String(300), nullable=False)
    location = Column(String(200))
    start_date = Column(String(20))
    end_date = Column(String(20))
    is_current = Column(String(10), default="false")
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job_seeker = relationship("JobSeeker", back_populates="experience")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"))
    name = Column(String(300), nullable=False)
    issuer = Column(String(300))
    issue_date = Column(String(20))
    expiry_date = Column(String(20))
    credential_id = Column(String(200))
    credential_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job_seeker = relationship("JobSeeker", back_populates="certifications")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"))
    name = Column(String(300), nullable=False)
    description = Column(Text)
    tech_stack = Column(String(500))
    project_url = Column(String(500))
    github_url = Column(String(500))
    start_date = Column(String(20))
    end_date = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job_seeker = relationship("JobSeeker", back_populates="projects")
