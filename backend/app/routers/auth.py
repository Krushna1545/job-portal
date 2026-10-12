from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User, UserRole
from ..models.job_seeker import JobSeeker
from ..models.recruiter import Recruiter
from ..schemas.user import UserCreate, UserLogin, UserResponse, Token
from ..core.security import get_password_hash, verify_password, create_access_token
from ..core.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_pw = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed_pw,
        role=user_data.role,
        is_active=True
    )
    db.add(user)
    db.flush()
    
    if user_data.role == UserRole.JOB_SEEKER:
        profile = JobSeeker(
            user_id=user.id,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            profile_completion=10
        )
        db.add(profile)
    elif user_data.role == UserRole.RECRUITER:
        profile = Recruiter(
            user_id=user.id,
            first_name=user_data.first_name,
            last_name=user_data.last_name
        )
        db.add(profile)
    
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is deactivated"
        )
    
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile_data = {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }
    
    if current_user.role == UserRole.JOB_SEEKER:
        seeker = db.query(JobSeeker).filter(JobSeeker.user_id == current_user.id).first()
        if seeker:
            profile_data["profile"] = {
                "id": seeker.id,
                "first_name": seeker.first_name,
                "last_name": seeker.last_name,
                "profile_completion": seeker.profile_completion,
                "avatar_url": seeker.avatar_url
            }
    elif current_user.role == UserRole.RECRUITER:
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
        if recruiter:
            profile_data["profile"] = {
                "id": recruiter.id,
                "first_name": recruiter.first_name,
                "last_name": recruiter.last_name,
                "company_id": recruiter.company_id,
                "avatar_url": recruiter.avatar_url
            }
    
    return profile_data
