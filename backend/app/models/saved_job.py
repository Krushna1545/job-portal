from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"))
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"))
    saved_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("job_seeker_id", "job_id"),)

    job_seeker = relationship("JobSeeker", back_populates="saved_jobs")
    job = relationship("Job", back_populates="saved_by")
