from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..database import get_db
from ..models.user import User, UserRole
from ..models.job_seeker import JobSeeker, Education, Experience, Certification, Project
from ..models.recruiter import Recruiter, Company
from ..models.skill import Skill, UserSkill
from ..schemas.job_seeker import (
    JobSeekerProfileUpdate, JobSeekerProfileResponse,
    EducationCreate, ExperienceCreate, CertificationCreate, ProjectCreate, SkillInput
)
from ..schemas.recruiter import RecruiterProfileUpdate, CompanyCreate, CompanyUpdate
from ..core.dependencies import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Profile"])


def calculate_completion(seeker: JobSeeker, db: Session) -> int:
    score = 10  # Base for registration
    if seeker.first_name and seeker.last_name:
        score += 10
    if seeker.phone:
        score += 5
    if seeker.location:
        score += 5
    if seeker.bio:
        score += 10
    if seeker.avatar_url:
        score += 5
    if seeker.education:
        score += 15
    if seeker.experience:
        score += 15
    if seeker.skills:
        score += 15
    if seeker.resumes:
        score += 10
    return min(score, 100)


@router.get("")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == UserRole.JOB_SEEKER:
        seeker = db.query(JobSeeker).options(
            joinedload(JobSeeker.education),
            joinedload(JobSeeker.experience),
            joinedload(JobSeeker.certifications),
            joinedload(JobSeeker.projects),
            joinedload(JobSeeker.skills).joinedload(UserSkill.skill),
            joinedload(JobSeeker.resumes)
        ).filter(JobSeeker.user_id == current_user.id).first()
        
        if not seeker:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        skills_data = [
            {
                "id": us.id,
                "skill_id": us.skill_id,
                "name": us.skill.name if us.skill else "",
                "proficiency": us.proficiency,
                "years_of_experience": us.years_of_experience
            }
            for us in seeker.skills
        ]
        
        resumes_data = [
            {
                "id": r.id,
                "filename": r.original_filename or r.filename,
                "is_primary": r.is_primary,
                "file_type": r.file_type,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in seeker.resumes
        ]
        
        return {
            "id": seeker.id,
            "user_id": seeker.user_id,
            "email": current_user.email,
            "first_name": seeker.first_name,
            "last_name": seeker.last_name,
            "phone": seeker.phone,
            "location": seeker.location,
            "bio": seeker.bio,
            "avatar_url": seeker.avatar_url,
            "linkedin_url": seeker.linkedin_url,
            "github_url": seeker.github_url,
            "portfolio_url": seeker.portfolio_url,
            "desired_role": seeker.desired_role,
            "desired_salary": seeker.desired_salary,
            "job_type_preference": seeker.job_type_preference,
            "remote_preference": seeker.remote_preference,
            "years_of_experience": seeker.years_of_experience,
            "profile_completion": calculate_completion(seeker, db),
            "education": [
                {
                    "id": e.id, "degree": e.degree, "institution": e.institution,
                    "field_of_study": e.field_of_study, "start_year": e.start_year,
                    "end_year": e.end_year, "grade": e.grade, "description": e.description
                } for e in seeker.education
            ],
            "experience": [
                {
                    "id": ex.id, "job_title": ex.job_title, "company": ex.company,
                    "location": ex.location, "start_date": ex.start_date,
                    "end_date": ex.end_date, "is_current": ex.is_current, "description": ex.description
                } for ex in seeker.experience
            ],
            "certifications": [
                {
                    "id": c.id, "name": c.name, "issuer": c.issuer,
                    "issue_date": c.issue_date, "expiry_date": c.expiry_date,
                    "credential_id": c.credential_id, "credential_url": c.credential_url
                } for c in seeker.certifications
            ],
            "projects": [
                {
                    "id": p.id, "name": p.name, "description": p.description,
                    "tech_stack": p.tech_stack, "project_url": p.project_url,
                    "github_url": p.github_url, "start_date": p.start_date, "end_date": p.end_date
                } for p in seeker.projects
            ],
            "skills": skills_data,
            "resumes": resumes_data,
            "created_at": seeker.created_at.isoformat() if seeker.created_at else None
        }
    
    elif current_user.role == UserRole.RECRUITER:
        recruiter = db.query(Recruiter).options(
            joinedload(Recruiter.company)
        ).filter(Recruiter.user_id == current_user.id).first()
        
        if not recruiter:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        company_data = None
        if recruiter.company:
            company_data = {
                "id": recruiter.company.id,
                "name": recruiter.company.name,
                "description": recruiter.company.description,
                "industry": recruiter.company.industry,
                "company_size": recruiter.company.company_size,
                "website": recruiter.company.website,
                "logo_url": recruiter.company.logo_url,
                "location": recruiter.company.location,
                "is_verified": recruiter.company.is_verified
            }
        
        return {
            "id": recruiter.id,
            "user_id": recruiter.user_id,
            "email": current_user.email,
            "first_name": recruiter.first_name,
            "last_name": recruiter.last_name,
            "phone": recruiter.phone,
            "job_title": recruiter.job_title,
            "avatar_url": recruiter.avatar_url,
            "linkedin_url": recruiter.linkedin_url,
            "company": company_data,
            "created_at": recruiter.created_at.isoformat() if recruiter.created_at else None
        }
    
    return {"id": current_user.id, "email": current_user.email, "role": current_user.role.value}


@router.put("")
def update_profile(
    profile_data: JobSeekerProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.JOB_SEEKER:
        seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
        if not seeker:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        update_data = profile_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(seeker, field, value)
        
        seeker.profile_completion = calculate_completion(seeker, db)
        db.commit()
        return {"message": "Profile updated successfully"}
    
    raise HTTPException(status_code=400, detail="Use recruiter profile endpoint")


@router.put("/recruiter")
def update_recruiter_profile(
    profile_data: RecruiterProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(recruiter, field, value)
    db.commit()
    return {"message": "Profile updated successfully"}


# Education endpoints
@router.post("/education")
def add_education(
    edu_data: EducationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    if not seeker:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    edu = Education(job_seeker_id=seeker.id, **edu_data.model_dump())
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return {"message": "Education added", "id": edu.id}


@router.put("/education/{edu_id}")
def update_education(
    edu_id: int,
    edu_data: EducationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    edu = db.query(Education).filter(Education.id == edu_id, Education.job_seeker_id == seeker.id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education not found")
    
    for field, value in edu_data.model_dump().items():
        setattr(edu, field, value)
    db.commit()
    return {"message": "Education updated"}


@router.delete("/education/{edu_id}")
def delete_education(
    edu_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    edu = db.query(Education).filter(Education.id == edu_id, Education.job_seeker_id == seeker.id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education not found")
    db.delete(edu)
    db.commit()
    return {"message": "Education deleted"}


# Experience endpoints
@router.post("/experience")
def add_experience(
    exp_data: ExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    exp = Experience(job_seeker_id=seeker.id, **exp_data.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return {"message": "Experience added", "id": exp.id}


@router.put("/experience/{exp_id}")
def update_experience(
    exp_id: int,
    exp_data: ExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    exp = db.query(Experience).filter(Experience.id == exp_id, Experience.job_seeker_id == seeker.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    for field, value in exp_data.model_dump().items():
        setattr(exp, field, value)
    db.commit()
    return {"message": "Experience updated"}


@router.delete("/experience/{exp_id}")
def delete_experience(
    exp_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    exp = db.query(Experience).filter(Experience.id == exp_id, Experience.job_seeker_id == seeker.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(exp)
    db.commit()
    return {"message": "Experience deleted"}


# Skills endpoints
@router.post("/skills")
def add_skill(
    skill_data: SkillInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    
    skill = db.query(Skill).filter(Skill.name.ilike(skill_data.name)).first()
    if not skill:
        skill = Skill(name=skill_data.name.strip())
        db.add(skill)
        db.flush()
    
    existing = db.query(UserSkill).filter(
        UserSkill.job_seeker_id == seeker.id,
        UserSkill.skill_id == skill.id
    ).first()
    if existing:
        return {"message": "Skill already added"}
    
    user_skill = UserSkill(
        job_seeker_id=seeker.id,
        skill_id=skill.id,
        proficiency=skill_data.proficiency,
        years_of_experience=skill_data.years_of_experience
    )
    db.add(user_skill)
    db.commit()
    return {"message": "Skill added", "skill_id": skill.id}


@router.delete("/skills/{skill_id}")
def delete_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    user_skill = db.query(UserSkill).filter(
        UserSkill.id == skill_id,
        UserSkill.job_seeker_id == seeker.id
    ).first()
    if not user_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(user_skill)
    db.commit()
    return {"message": "Skill removed"}


# Certifications
@router.post("/certifications")
def add_certification(
    cert_data: CertificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    cert = Certification(job_seeker_id=seeker.id, **cert_data.model_dump())
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return {"message": "Certification added", "id": cert.id}


@router.delete("/certifications/{cert_id}")
def delete_certification(
    cert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    cert = db.query(Certification).filter(
        Certification.id == cert_id, Certification.job_seeker_id == seeker.id
    ).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(cert)
    db.commit()
    return {"message": "Certification deleted"}


# Projects
@router.post("/projects")
def add_project(
    proj_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    project = Project(job_seeker_id=seeker.id, **proj_data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return {"message": "Project added", "id": project.id}


@router.delete("/projects/{proj_id}")
def delete_project(
    proj_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
    proj = db.query(Project).filter(
        Project.id == proj_id, Project.job_seeker_id == seeker.id
    ).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(proj)
    db.commit()
    return {"message": "Project deleted"}


# Company profile for recruiters
@router.post("/company")
def create_company(
    company_data: CompanyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    
    company = Company(**company_data.model_dump())
    db.add(company)
    db.flush()
    recruiter.company_id = company.id
    db.commit()
    return {"message": "Company created", "company_id": company.id}


@router.put("/company")
def update_company(
    company_data: CompanyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    if not recruiter or not recruiter.company_id:
        raise HTTPException(status_code=404, detail="Company not found")
    
    company = db.query(Company).filter(Company.id == recruiter.company_id).first()
    update_data = company_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
    db.commit()
    return {"message": "Company updated"}
