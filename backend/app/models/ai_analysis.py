from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class AIAnalysis(Base):
    __tablename__ = "ai_analysis"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"))
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    analysis_type = Column(String(100))  # resume_score, job_match, skill_gap, recommendation
    score = Column(Float)
    extracted_skills = Column(JSON)
    missing_skills = Column(JSON)
    recommendations = Column(JSON)
    raw_result = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job_seeker = relationship("JobSeeker", back_populates="ai_analyses")
    resume = relationship("Resume", back_populates="ai_analyses")
