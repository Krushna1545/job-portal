from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"))
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"))
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)
    cover_letter = Column(Text)
    status = Column(String(50), default="applied")
    # Status: applied, under_review, shortlisted, interview, selected, rejected
    match_score = Column(Float)
    recruiter_notes = Column(Text)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    job_seeker = relationship("JobSeeker", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    resume = relationship("Resume")
    interview = relationship("Interview", back_populates="application", uselist=False)
