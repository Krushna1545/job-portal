from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), unique=True)
    interview_date = Column(DateTime(timezone=True))
    interview_type = Column(String(100))  # phone, video, onsite, technical
    location = Column(String(500))
    meeting_link = Column(String(1000))
    duration_minutes = Column(Integer, default=60)
    notes = Column(Text)
    status = Column(String(50), default="scheduled")  # scheduled, completed, cancelled
    feedback = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    application = relationship("Application", back_populates="interview")
