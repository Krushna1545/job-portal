from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(100))  # Programming, Framework, Tool, Soft Skill
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user_skills = relationship("UserSkill", back_populates="skill")
    job_skills = relationship("JobSkill", back_populates="skill")


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    proficiency = Column(String(50), default="intermediate")  # beginner, intermediate, expert
    years_of_experience = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job_seeker = relationship("JobSeeker", back_populates="skills")
    skill = relationship("Skill", back_populates="user_skills")


class JobSkill(Base):
    __tablename__ = "job_skills"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    is_required = Column(String(10), default="true")  # required or preferred

    job = relationship("Job", back_populates="skills")
    skill = relationship("Skill", back_populates="job_skills")
