import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.config import settings
from app.routers import auth, jobs, profile, applications, resume, ai, recruiter, saved_jobs, notifications, admin

# Create all tables
Base.metadata.create_all(bind=engine)

# Create upload directories
os.makedirs(os.path.join(settings.UPLOAD_DIR, "resumes"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "avatars"), exist_ok=True)

app = FastAPI(
    title="AI Job Portal API",
    description="A comprehensive AI-powered job portal API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(profile.router)
app.include_router(applications.router)
app.include_router(resume.router)
app.include_router(ai.router)
app.include_router(recruiter.router)
app.include_router(saved_jobs.router)
app.include_router(notifications.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "message": "AI Job Portal API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}


# Seed database on startup
@app.on_event("startup")
async def startup_event():
    try:
        from app.seed import seed_database
        seed_database()
    except Exception as e:
        print(f"Seed warning: {e}")
