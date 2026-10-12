import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.job_seeker import JobSeeker
from ..models.resume import Resume
from ..core.dependencies import get_current_user
from ..services.resume_service import extract_text_from_resume, save_resume_file
from ..config import settings

router = APIRouter(prefix="/api/resume", tags=["Resume"])

ALLOWED_TYPES = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
ALLOWED_EXTENSIONS = {".pdf", ".docx"}


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    if not seeker:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Validate file
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed")
    
    content = await file.read()
    
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{ext}"
    upload_dir = os.path.join(settings.UPLOAD_DIR, "resumes")
    
    file_path = save_resume_file(content, unique_filename, upload_dir)
    
    # Extract text
    file_type = "pdf" if ext == ".pdf" else "docx"
    extracted_text = extract_text_from_resume(content, file_type)
    
    # Set all existing as non-primary
    db.query(Resume).filter(Resume.job_seeker_id == seeker.id).update({"is_primary": False})
    
    resume = Resume(
        job_seeker_id=seeker.id,
        filename=unique_filename,
        original_filename=file.filename,
        file_path=file_path,
        file_size=len(content),
        file_type=file_type,
        is_primary=True,
        extracted_text=extracted_text
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    
    return {
        "message": "Resume uploaded successfully",
        "resume_id": resume.id,
        "filename": file.filename,
        "extracted_text_length": len(extracted_text)
    }


@router.get("")
def get_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    if not seeker:
        return []
    
    resumes = db.query(Resume).filter(Resume.job_seeker_id == seeker.id).order_by(
        Resume.created_at.desc()
    ).all()
    
    return [
        {
            "id": r.id,
            "filename": r.original_filename or r.filename,
            "file_type": r.file_type,
            "file_size": r.file_size,
            "is_primary": r.is_primary,
            "has_text": bool(r.extracted_text),
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in resumes
    ]


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    resume = db.query(Resume).filter(
        Resume.id == resume_id, Resume.job_seeker_id == seeker.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Delete file
    if resume.file_path and os.path.exists(resume.file_path):
        os.remove(resume.file_path)
    
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted"}


@router.get("/download/{resume_id}")
def download_resume(
    resume_id: int,
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if not resume.file_path or not os.path.exists(resume.file_path):
        raise HTTPException(status_code=404, detail="Resume file not found")
    
    return FileResponse(
        path=resume.file_path,
        filename=resume.original_filename or resume.filename,
        media_type="application/octet-stream"
    )
