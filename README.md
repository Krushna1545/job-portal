# 🚀 AI-Based Job Portal

A complete full-stack AI-powered job portal with smart resume analysis, job matching, and personalized career recommendations.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + Tailwind CSS |
| Backend | Python + FastAPI |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT + bcrypt |
| AI | Python NLP + skill extraction |

---

## 📁 Project Structure

```
job portal/
├── frontend/          # React.js Vite app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/    # Home, Jobs, Login, Register
│   │   │   ├── seeker/    # Job seeker dashboard pages
│   │   │   ├── recruiter/ # Recruiter dashboard pages
│   │   │   └── admin/     # Admin dashboard pages
│   │   ├── components/    # Shared UI components
│   │   ├── context/       # AuthContext
│   │   └── api/           # Axios config
│   └── package.json
│
└── backend/           # FastAPI Python app
    ├── app/
    │   ├── models/    # SQLAlchemy database models
    │   ├── routers/   # API route handlers
    │   ├── schemas/   # Pydantic schemas
    │   ├── services/  # AI + resume services
    │   └── core/      # Auth + security
    ├── main.py
    ├── requirements.txt
    └── .env
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+ (tested with 3.14)
- Node.js 18+
- PostgreSQL (optional — SQLite used by default)

---

### Backend Setup

```bash
cd backend

# 1. Create virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Mac/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Start the server
python -m uvicorn main:app --reload --port 8000
# Or with Python 3.14 specifically:
py -3.14 -m uvicorn main:app --reload --port 8000
```

The database tables are created automatically on first startup.
Sample data (jobs, users, companies) is seeded automatically.

**API Documentation:** http://localhost:8000/docs

---

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

**App URL:** http://localhost:5173

---

## 🔐 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@jobportal.com | Admin@123 |
| Recruiter | recruiter@techcorp.com | Recruiter@123 |
| Recruiter | recruiter@datadriven.com | Recruiter@123 |
| Job Seeker | john.doe@example.com | Seeker@123 |
| Job Seeker | jane.smith@example.com | Seeker@123 |

---

## 🗄️ PostgreSQL Setup (Production)

```sql
-- Create database
CREATE DATABASE jobportal;
CREATE USER jobportal_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE jobportal TO jobportal_user;
```

Update `.env`:
```
DATABASE_URL=postgresql://jobportal_user:your_password@localhost:5432/jobportal
```

---

## ✨ Features

### Job Seeker
- Create and edit profile (skills, education, experience, certifications)
- Upload resume (PDF/DOCX)
- AI resume score (0-100) with improvement suggestions
- AI skill gap analysis
- AI job recommendations
- Search and filter jobs
- Apply with cover letter
- Track application status
- Save/bookmark jobs
- Notifications

### Recruiter
- Company profile management
- Post, edit, delete jobs
- View all applicants
- AI candidate matching scores
- Update application status
- Schedule interviews
- Download candidate resumes

### Admin
- Platform statistics dashboard
- Manage all users (activate/deactivate)
- Manage all jobs (view/delete)
- View all applications

### AI Features
- **Resume Analyzer**: Extracts skills, scores resume 0-100, suggests improvements
- **Job Match**: Compares candidate skills vs job requirements, shows match %
- **Skill Gap**: Shows which skills are missing, recommends learning resources
- **Job Recommendations**: Personalized jobs based on your profile
- **JD Analyzer**: Analyzes job descriptions, suggests improvements

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/jobs/public | Browse jobs (public) |
| GET | /api/jobs/{id} | Get job details |
| POST | /api/jobs | Create job (recruiter) |
| POST | /api/applications | Apply for job |
| GET | /api/applications | Get applications |
| POST | /api/resume/upload | Upload resume |
| POST | /api/ai/resume-score | AI resume analysis |
| POST | /api/ai/job-match | Job match score |
| GET | /api/ai/recommendations | Job recommendations |
| POST | /api/ai/skill-gap | Skill gap analysis |
| GET | /api/profile | Get profile |
| PUT | /api/profile | Update profile |

Full API docs: http://localhost:8000/docs

---

## 🏗️ Architecture

```
Frontend (React) ←→ API Proxy (Vite) ←→ Backend (FastAPI) ←→ Database (SQLite/PostgreSQL)
                                                      ↕
                                               AI Service (Python NLP)
```

The Vite dev server proxies all `/api` requests to the FastAPI backend at port 8000, so no CORS issues during development.
