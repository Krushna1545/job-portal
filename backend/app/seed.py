"""
Seed script to populate the database with sample data.
Run: python -m app.seed
"""
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from .models import *
from .models.user import User, UserRole
from .models.job_seeker import JobSeeker, Education, Experience, Certification, Project
from .models.recruiter import Recruiter, Company
from .models.skill import Skill, UserSkill, JobSkill
from .models.job import Job
from .models.application import Application
from .models.notification import Notification
from .core.security import get_password_hash
from datetime import datetime, timedelta


def seed_database():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already seeded.")
            return
        
        print("Seeding database...")
        
        # ===== ADMIN =====
        admin = User(
            email="admin@jobportal.com",
            hashed_password=get_password_hash("Admin@123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        db.flush()
        
        # ===== COMPANIES =====
        companies_data = [
            {
                "name": "TechCorp Solutions",
                "description": "Leading technology company specializing in enterprise software solutions.",
                "industry": "Information Technology",
                "company_size": "1000-5000",
                "founded_year": "2010",
                "website": "https://techcorp.example.com",
                "location": "San Francisco, CA",
                "is_verified": True
            },
            {
                "name": "DataDriven Inc",
                "description": "Data analytics and AI company transforming businesses through insights.",
                "industry": "Data Analytics",
                "company_size": "100-500",
                "founded_year": "2015",
                "website": "https://datadriven.example.com",
                "location": "New York, NY",
                "is_verified": True
            },
            {
                "name": "CloudBase Systems",
                "description": "Cloud infrastructure and DevOps solutions provider.",
                "industry": "Cloud Computing",
                "company_size": "500-1000",
                "founded_year": "2012",
                "website": "https://cloudbase.example.com",
                "location": "Austin, TX",
                "is_verified": True
            },
            {
                "name": "FinTech Labs",
                "description": "Innovative financial technology startup building next-gen banking solutions.",
                "industry": "Financial Technology",
                "company_size": "50-100",
                "founded_year": "2019",
                "website": "https://fintechlabs.example.com",
                "location": "Chicago, IL",
                "is_verified": True
            },
            {
                "name": "HealthTech Innovations",
                "description": "Healthcare technology company improving patient outcomes through AI.",
                "industry": "Healthcare Technology",
                "company_size": "200-500",
                "founded_year": "2017",
                "website": "https://healthtech.example.com",
                "location": "Boston, MA",
                "is_verified": True
            }
        ]
        
        companies = []
        for c_data in companies_data:
            company = Company(**c_data)
            db.add(company)
            companies.append(company)
        db.flush()
        
        # ===== RECRUITERS =====
        recruiters_data = [
            {
                "email": "recruiter@techcorp.com",
                "first_name": "Sarah",
                "last_name": "Johnson",
                "job_title": "Senior HR Manager",
                "company_idx": 0
            },
            {
                "email": "recruiter@datadriven.com",
                "first_name": "Mike",
                "last_name": "Williams",
                "job_title": "Talent Acquisition Specialist",
                "company_idx": 1
            },
            {
                "email": "recruiter@cloudbase.com",
                "first_name": "Lisa",
                "last_name": "Chen",
                "job_title": "Technical Recruiter",
                "company_idx": 2
            }
        ]
        
        recruiters = []
        for r_data in recruiters_data:
            user = User(
                email=r_data["email"],
                hashed_password=get_password_hash("Recruiter@123"),
                role=UserRole.RECRUITER,
                is_active=True
            )
            db.add(user)
            db.flush()
            
            recruiter = Recruiter(
                user_id=user.id,
                company_id=companies[r_data["company_idx"]].id,
                first_name=r_data["first_name"],
                last_name=r_data["last_name"],
                job_title=r_data["job_title"]
            )
            db.add(recruiter)
            recruiters.append(recruiter)
        db.flush()
        
        # ===== SKILLS =====
        skills_list = [
            "Python", "JavaScript", "TypeScript", "React", "Vue.js", "Angular",
            "Node.js", "FastAPI", "Django", "Flask", "Express.js",
            "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
            "AWS", "Azure", "GCP", "Docker", "Kubernetes",
            "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
            "Data Analysis", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch",
            "Git", "GitHub", "CI/CD", "Agile", "Scrum",
            "HTML", "CSS", "Tailwind CSS", "SQL", "Java", "Go", "Rust"
        ]
        
        skill_objects = {}
        for skill_name in skills_list:
            skill = Skill(name=skill_name, category="Technical")
            db.add(skill)
            skill_objects[skill_name] = skill
        db.flush()
        
        # ===== JOBS =====
        jobs_data = [
            {
                "title": "Senior Python Developer",
                "description": "We are looking for an experienced Python developer to join our backend team. You will design and implement scalable APIs, work with databases, and collaborate with cross-functional teams.",
                "requirements": "5+ years of Python experience\nStrong knowledge of FastAPI or Django\nExperience with PostgreSQL\nGit proficiency",
                "responsibilities": "Design and develop RESTful APIs\nOptimize database queries\nCode review and mentoring\nCollaborate with frontend teams",
                "location": "San Francisco, CA",
                "job_type": "full-time",
                "work_mode": "hybrid",
                "salary_min": 120000,
                "salary_max": 160000,
                "experience_min": 5,
                "experience_max": 10,
                "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS", "Git"],
                "recruiter_idx": 0,
                "company_idx": 0
            },
            {
                "title": "Full Stack React Developer",
                "description": "Join our product team to build beautiful, responsive web applications. You'll work with React on the frontend and Node.js on the backend.",
                "requirements": "3+ years of React experience\nFamiliarity with TypeScript\nExperience with REST APIs",
                "responsibilities": "Build and maintain web applications\nImplement UI components\nAPI integration\nWrite unit tests",
                "location": "New York, NY",
                "job_type": "full-time",
                "work_mode": "remote",
                "salary_min": 90000,
                "salary_max": 130000,
                "experience_min": 3,
                "experience_max": 7,
                "skills": ["React", "TypeScript", "Node.js", "JavaScript", "PostgreSQL", "Git"],
                "recruiter_idx": 1,
                "company_idx": 1
            },
            {
                "title": "Machine Learning Engineer",
                "description": "We are building cutting-edge ML models for our data platform. Join us to work on real-world AI applications that impact millions of users.",
                "requirements": "3+ years ML experience\nPython and ML frameworks\nStrong math background",
                "responsibilities": "Develop ML models\nData pipeline development\nModel deployment and monitoring\nResearch new approaches",
                "location": "Austin, TX",
                "job_type": "full-time",
                "work_mode": "onsite",
                "salary_min": 130000,
                "salary_max": 180000,
                "experience_min": 3,
                "experience_max": 8,
                "skills": ["Python", "Machine Learning", "TensorFlow", "PyTorch", "Scikit-learn", "SQL", "AWS"],
                "recruiter_idx": 2,
                "company_idx": 2
            },
            {
                "title": "DevOps Engineer",
                "description": "We need a skilled DevOps engineer to improve our cloud infrastructure, CI/CD pipelines, and deployment processes.",
                "requirements": "3+ years DevOps experience\nKubernetes and Docker expertise\nCloud platform experience",
                "responsibilities": "Manage cloud infrastructure\nBuild CI/CD pipelines\nAutomate deployments\nMonitor system performance",
                "location": "Chicago, IL",
                "job_type": "full-time",
                "work_mode": "hybrid",
                "salary_min": 110000,
                "salary_max": 150000,
                "experience_min": 3,
                "experience_max": 8,
                "skills": ["Docker", "Kubernetes", "AWS", "CI/CD", "Python", "Git"],
                "recruiter_idx": 0,
                "company_idx": 0
            },
            {
                "title": "Data Scientist",
                "description": "Join our analytics team to extract insights from large datasets and build predictive models to drive business decisions.",
                "requirements": "2+ years data science experience\nStrong statistics background\nPython or R proficiency",
                "responsibilities": "Analyze large datasets\nBuild predictive models\nCreate visualizations\nPresent findings to stakeholders",
                "location": "Boston, MA",
                "job_type": "full-time",
                "work_mode": "remote",
                "salary_min": 100000,
                "salary_max": 140000,
                "experience_min": 2,
                "experience_max": 6,
                "skills": ["Python", "Data Analysis", "Machine Learning", "SQL", "Pandas", "NumPy"],
                "recruiter_idx": 1,
                "company_idx": 1
            },
            {
                "title": "Frontend React Developer",
                "description": "Build modern, user-friendly interfaces for our web platform. Strong focus on performance and UX.",
                "requirements": "2+ years React experience\nCSS/Tailwind knowledge\nAPI integration experience",
                "responsibilities": "Develop UI components\nEnsure cross-browser compatibility\nOptimize page performance\nCollaborate with designers",
                "location": "San Francisco, CA",
                "job_type": "full-time",
                "work_mode": "remote",
                "salary_min": 85000,
                "salary_max": 115000,
                "experience_min": 2,
                "experience_max": 5,
                "skills": ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind CSS"],
                "recruiter_idx": 2,
                "company_idx": 2
            },
            {
                "title": "Backend Node.js Developer",
                "description": "Looking for a talented backend developer with Node.js expertise to build scalable microservices.",
                "requirements": "3+ years Node.js experience\nDatabase knowledge\nAPI design experience",
                "responsibilities": "Design microservices\nDatabase optimization\nAPI development\nPerformance tuning",
                "location": "Austin, TX",
                "job_type": "full-time",
                "work_mode": "hybrid",
                "salary_min": 95000,
                "salary_max": 125000,
                "experience_min": 3,
                "experience_max": 7,
                "skills": ["Node.js", "JavaScript", "MongoDB", "PostgreSQL", "Redis", "Docker"],
                "recruiter_idx": 0,
                "company_idx": 3
            },
            {
                "title": "Junior Python Developer",
                "description": "Great opportunity for a junior developer to grow with our team. We value learning and provide excellent mentorship.",
                "requirements": "1+ year Python experience\nBasic database knowledge\nEagerness to learn",
                "responsibilities": "Develop Python scripts\nAPI integration\nBug fixes\nDocumentation",
                "location": "Remote",
                "job_type": "full-time",
                "work_mode": "remote",
                "salary_min": 55000,
                "salary_max": 75000,
                "experience_min": 0,
                "experience_max": 2,
                "skills": ["Python", "SQL", "Git", "HTML"],
                "recruiter_idx": 1,
                "company_idx": 4
            },
            {
                "title": "Cloud Architect",
                "description": "Lead the design and implementation of our cloud architecture strategy across AWS and Azure.",
                "requirements": "7+ years cloud experience\nMulti-cloud expertise\nArchitecture design experience",
                "responsibilities": "Design cloud architecture\nCost optimization\nSecurity compliance\nTeam leadership",
                "location": "New York, NY",
                "job_type": "full-time",
                "work_mode": "hybrid",
                "salary_min": 150000,
                "salary_max": 200000,
                "experience_min": 7,
                "experience_max": 15,
                "skills": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Python"],
                "recruiter_idx": 2,
                "company_idx": 2
            },
            {
                "title": "Data Engineer",
                "description": "Build and maintain our data infrastructure, ETL pipelines, and data warehouse.",
                "requirements": "3+ years data engineering experience\nETL pipeline experience\nCloud data services",
                "responsibilities": "Build ETL pipelines\nData warehouse management\nData quality monitoring\nCollaborate with data scientists",
                "location": "Chicago, IL",
                "job_type": "full-time",
                "work_mode": "hybrid",
                "salary_min": 105000,
                "salary_max": 140000,
                "experience_min": 3,
                "experience_max": 7,
                "skills": ["Python", "SQL", "AWS", "PostgreSQL", "Data Analysis", "Pandas"],
                "recruiter_idx": 0,
                "company_idx": 3
            }
        ]
        
        db.flush()
        for idx, recruiter in enumerate(recruiters):
            db.refresh(recruiter)
        
        for j_data in jobs_data:
            job = Job(
                recruiter_id=recruiters[j_data["recruiter_idx"]].id,
                company_id=companies[j_data["company_idx"]].id,
                title=j_data["title"],
                description=j_data["description"],
                requirements=j_data.get("requirements"),
                responsibilities=j_data.get("responsibilities"),
                location=j_data["location"],
                job_type=j_data["job_type"],
                work_mode=j_data["work_mode"],
                salary_min=j_data["salary_min"],
                salary_max=j_data["salary_max"],
                experience_min=j_data["experience_min"],
                experience_max=j_data.get("experience_max"),
                status="active",
                is_featured=j_data.get("is_featured", False),
                applications_count=0,
                views_count=0
            )
            db.add(job)
            db.flush()
            
            for skill_name in j_data["skills"]:
                if skill_name in skill_objects:
                    job_skill = JobSkill(job_id=job.id, skill_id=skill_objects[skill_name].id)
                    db.add(job_skill)
        
        # Mark some jobs as featured
        first_jobs = db.query(Job).limit(3).all()
        for j in first_jobs:
            j.is_featured = True
        
        # ===== JOB SEEKERS =====
        seekers_data = [
            {
                "email": "john.doe@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "phone": "+1-555-0101",
                "location": "San Francisco, CA",
                "bio": "Full-stack developer with 5 years of experience in Python and React. Passionate about building scalable applications.",
                "desired_role": "Senior Software Engineer",
                "years_of_experience": 5,
                "skills": ["Python", "React", "PostgreSQL", "Docker", "AWS"]
            },
            {
                "email": "jane.smith@example.com",
                "first_name": "Jane",
                "last_name": "Smith",
                "phone": "+1-555-0102",
                "location": "New York, NY",
                "bio": "Data scientist with expertise in machine learning and statistical analysis. Love turning data into insights.",
                "desired_role": "Data Scientist",
                "years_of_experience": 3,
                "skills": ["Python", "Machine Learning", "SQL", "TensorFlow", "Data Analysis"]
            },
            {
                "email": "alex.dev@example.com",
                "first_name": "Alex",
                "last_name": "Chen",
                "phone": "+1-555-0103",
                "location": "Austin, TX",
                "bio": "DevOps engineer specializing in cloud infrastructure and CI/CD pipelines.",
                "desired_role": "DevOps Engineer",
                "years_of_experience": 4,
                "skills": ["Docker", "Kubernetes", "AWS", "Python", "CI/CD"]
            }
        ]
        
        for s_data in seekers_data:
            user = User(
                email=s_data["email"],
                hashed_password=get_password_hash("Seeker@123"),
                role=UserRole.JOB_SEEKER,
                is_active=True
            )
            db.add(user)
            db.flush()
            
            seeker = JobSeeker(
                user_id=user.id,
                first_name=s_data["first_name"],
                last_name=s_data["last_name"],
                phone=s_data["phone"],
                location=s_data["location"],
                bio=s_data["bio"],
                desired_role=s_data["desired_role"],
                years_of_experience=s_data["years_of_experience"],
                profile_completion=75
            )
            db.add(seeker)
            db.flush()
            
            # Add education
            edu = Education(
                job_seeker_id=seeker.id,
                degree="Bachelor of Science",
                institution="State University",
                field_of_study="Computer Science",
                start_year="2015",
                end_year="2019",
                grade="3.7 GPA"
            )
            db.add(edu)
            
            # Add experience
            exp = Experience(
                job_seeker_id=seeker.id,
                job_title=s_data["desired_role"],
                company="Previous Company Inc.",
                location=s_data["location"],
                start_date="2020-01",
                is_current="true",
                description="Working on various projects and delivering high-quality software solutions."
            )
            db.add(exp)
            
            # Add skills
            for skill_name in s_data["skills"]:
                if skill_name in skill_objects:
                    user_skill = UserSkill(
                        job_seeker_id=seeker.id,
                        skill_id=skill_objects[skill_name].id,
                        proficiency="expert",
                        years_of_experience=3
                    )
                    db.add(user_skill)
        
        db.commit()
        print("✅ Database seeded successfully!")
        print("\nTest Accounts:")
        print("─" * 40)
        print("Admin:     admin@jobportal.com    / Admin@123")
        print("Recruiter: recruiter@techcorp.com  / Recruiter@123")
        print("Recruiter: recruiter@datadriven.com / Recruiter@123")
        print("Job Seeker: john.doe@example.com  / Seeker@123")
        print("Job Seeker: jane.smith@example.com / Seeker@123")
        print("─" * 40)
        
    except Exception as e:
        print(f"❌ Seeding error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
