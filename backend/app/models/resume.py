from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"))
    filename = Column(String(500), nullable=False)
    original_filename = Column(String(500))
    file_path = Column(String(1000))
    file_size = Column(Integer)
    file_type = Column(String(50))  # pdf, docx
    is_primary = Column(Boolean, default=False)
    extracted_text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job_seeker = relationship("JobSeeker", back_populates="resumes")
    ai_analyses = relationship("AIAnalysis", back_populates="resume")
