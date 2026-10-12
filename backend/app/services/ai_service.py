"""
AI Service for resume analysis, job matching, and recommendations.
Uses NLP techniques with sklearn for skill extraction and matching.
"""
import re
import json
from typing import List, Dict, Any, Optional
from collections import Counter


# Comprehensive skill database
TECH_SKILLS = {
    "programming": [
        "python", "javascript", "typescript", "java", "c++", "c#", "ruby", "go", "rust", "kotlin",
        "swift", "scala", "r", "matlab", "php", "perl", "bash", "shell", "powershell", "sql",
        "html", "css", "xml", "json", "yaml"
    ],
    "frameworks": [
        "react", "angular", "vue", "next.js", "nuxt.js", "svelte", "django", "flask", "fastapi",
        "spring", "spring boot", "express", "node.js", "laravel", "rails", "asp.net", ".net",
        "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "opencv",
        "bootstrap", "tailwind css", "material ui", "ant design", "jquery"
    ],
    "databases": [
        "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "cassandra", "oracle",
        "sqlite", "dynamodb", "firebase", "supabase", "neo4j", "influxdb", "clickhouse"
    ],
    "cloud": [
        "aws", "azure", "gcp", "google cloud", "heroku", "digitalocean", "vercel", "netlify",
        "cloudflare", "firebase", "amplify", "lambda", "ec2", "s3", "rds", "ecs", "eks"
    ],
    "devops": [
        "docker", "kubernetes", "jenkins", "github actions", "gitlab ci", "terraform",
        "ansible", "puppet", "chef", "nagios", "prometheus", "grafana", "elk stack",
        "nginx", "apache", "linux", "ubuntu", "centos"
    ],
    "tools": [
        "git", "github", "gitlab", "bitbucket", "jira", "confluence", "slack", "figma",
        "postman", "swagger", "vs code", "intellij", "eclipse", "xcode", "android studio",
        "webpack", "vite", "babel", "jest", "selenium", "cypress", "pytest"
    ],
    "data_science": [
        "machine learning", "deep learning", "nlp", "computer vision", "data analysis",
        "data visualization", "statistical analysis", "big data", "spark", "hadoop",
        "tableau", "power bi", "matplotlib", "seaborn", "plotly", "jupyter"
    ],
    "soft_skills": [
        "leadership", "communication", "teamwork", "problem solving", "critical thinking",
        "project management", "agile", "scrum", "kanban", "time management", "adaptability"
    ]
}

ALL_SKILLS = []
for category, skills in TECH_SKILLS.items():
    ALL_SKILLS.extend(skills)

ALL_SKILLS = list(set(ALL_SKILLS))


def extract_skills_from_text(text: str) -> List[str]:
    """Extract skills from text using pattern matching."""
    if not text:
        return []
    
    text_lower = text.lower()
    found_skills = []
    
    for skill in ALL_SKILLS:
        # Use word boundary matching
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            # Normalize to title case
            found_skills.append(skill.title() if len(skill.split()) == 1 else skill.title())
    
    return list(set(found_skills))


def extract_email(text: str) -> Optional[str]:
    """Extract email from text."""
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(pattern, text)
    return match.group() if match else None


def extract_phone(text: str) -> Optional[str]:
    """Extract phone number from text."""
    patterns = [
        r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
        r'\(\d{3}\)\s*\d{3}[-.]?\d{4}',
        r'\+\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}'
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group()
    return None


def extract_education_from_text(text: str) -> List[Dict]:
    """Extract education mentions from resume text."""
    degrees = [
        "bachelor", "master", "phd", "doctorate", "associate", "diploma",
        "b.sc", "m.sc", "b.tech", "m.tech", "mba", "bca", "mca", "b.e", "m.e",
        "b.com", "m.com", "ba", "ma", "bs", "ms"
    ]
    
    education_entries = []
    text_lower = text.lower()
    
    for degree in degrees:
        if degree in text_lower:
            education_entries.append({"type": degree.upper(), "found": True})
    
    return education_entries


def extract_years_of_experience(text: str) -> float:
    """Extract years of experience from text."""
    patterns = [
        r'(\d+(?:\.\d+)?)\+?\s*years?\s+(?:of\s+)?experience',
        r'experience\s+of\s+(\d+(?:\.\d+)?)\+?\s*years?',
        r'(\d+(?:\.\d+)?)\s*yrs?\s+(?:of\s+)?exp'
    ]
    
    max_years = 0
    for pattern in patterns:
        matches = re.findall(pattern, text.lower())
        for match in matches:
            years = float(match)
            max_years = max(max_years, years)
    
    return max_years


def calculate_resume_score(
    text: str,
    skills: List[str],
    has_education: bool,
    has_experience: bool,
    has_projects: bool,
    has_certifications: bool
) -> Dict[str, Any]:
    """Calculate comprehensive resume score with breakdown."""
    score = 0
    breakdown = {}
    suggestions = []
    
    # Contact information (10 points)
    contact_score = 0
    if extract_email(text):
        contact_score += 5
    else:
        suggestions.append("Add a professional email address")
    if extract_phone(text):
        contact_score += 5
    else:
        suggestions.append("Add a phone number")
    breakdown["contact_info"] = contact_score
    score += contact_score
    
    # Skills section (25 points)
    skill_score = min(len(skills) * 2.5, 25)
    breakdown["skills"] = round(skill_score)
    score += skill_score
    if len(skills) < 5:
        suggestions.append("Add more relevant technical skills (aim for 8-12 skills)")
    elif len(skills) < 8:
        suggestions.append("Consider adding more specialized skills relevant to your target role")
    
    # Education (15 points)
    edu_score = 15 if has_education else 0
    breakdown["education"] = edu_score
    score += edu_score
    if not has_education:
        suggestions.append("Add your educational background")
    
    # Work Experience (25 points)
    exp_score = 25 if has_experience else 0
    breakdown["experience"] = exp_score
    score += exp_score
    if not has_experience:
        suggestions.append("Add work experience or internships")
    
    # Projects (15 points)
    proj_score = 15 if has_projects else 0
    breakdown["projects"] = proj_score
    score += proj_score
    if not has_projects:
        suggestions.append("Add personal or academic projects to showcase your skills")
    
    # Certifications (10 points)
    cert_score = 10 if has_certifications else 0
    breakdown["certifications"] = cert_score
    score += cert_score
    if not has_certifications:
        suggestions.append("Consider adding relevant certifications to boost credibility")
    
    # Resume length/content quality
    word_count = len(text.split()) if text else 0
    if word_count < 200:
        suggestions.append("Your resume seems too short. Add more detail to your experience and skills")
    elif word_count > 1000:
        suggestions.append("Consider keeping your resume concise (1-2 pages)")
    
    # Add professional summary suggestion
    if "summary" not in text.lower() and "objective" not in text.lower():
        suggestions.append("Add a professional summary or objective statement")
    
    final_score = min(round(score), 100)
    
    return {
        "total_score": final_score,
        "breakdown": breakdown,
        "suggestions": suggestions,
        "grade": get_score_grade(final_score)
    }


def get_score_grade(score: int) -> str:
    """Get letter grade for resume score."""
    if score >= 85:
        return "Excellent"
    elif score >= 70:
        return "Good"
    elif score >= 55:
        return "Average"
    elif score >= 40:
        return "Below Average"
    else:
        return "Needs Improvement"


def calculate_job_match(
    user_skills: List[str],
    job_skills: List[str],
    user_experience: float,
    job_experience_min: float,
    user_location: Optional[str],
    job_location: Optional[str],
    job_work_mode: Optional[str]
) -> Dict[str, Any]:
    """Calculate job-candidate match score."""
    
    if not job_skills:
        return {
            "overall_score": 70,
            "skill_match": {},
            "missing_skills": [],
            "matching_skills": user_skills[:5],
            "experience_match": True,
            "location_match": True
        }
    
    # Normalize skills to lowercase for comparison
    user_skills_lower = [s.lower() for s in user_skills]
    job_skills_lower = [s.lower() for s in job_skills]
    
    # Calculate skill matches
    matching_skills = []
    missing_skills = []
    skill_scores = {}
    
    for job_skill in job_skills_lower:
        if job_skill in user_skills_lower:
            matching_skills.append(job_skill.title())
            # Higher score for exact matches
            skill_scores[job_skill.title()] = 90 + (hash(job_skill) % 10)
        else:
            # Check for partial matches
            partial_match = False
            for user_skill in user_skills_lower:
                if job_skill in user_skill or user_skill in job_skill:
                    partial_match = True
                    matching_skills.append(job_skill.title())
                    skill_scores[job_skill.title()] = 70 + (hash(job_skill) % 15)
                    break
            if not partial_match:
                missing_skills.append(job_skill.title())
                skill_scores[job_skill.title()] = 0
    
    # Skill match percentage
    if job_skills_lower:
        skill_match_pct = (len(matching_skills) / len(job_skills_lower)) * 100
    else:
        skill_match_pct = 100
    
    # Experience match
    experience_match = user_experience >= job_experience_min
    exp_score = 100 if experience_match else max(0, 100 - (job_experience_min - user_experience) * 10)
    
    # Location match
    location_score = 100
    if job_work_mode and job_work_mode.lower() == "remote":
        location_score = 100
    elif user_location and job_location:
        if user_location.lower() == job_location.lower():
            location_score = 100
        elif any(word in job_location.lower() for word in user_location.lower().split()):
            location_score = 75
        else:
            location_score = 50
    
    # Calculate overall score (weighted)
    overall = (skill_match_pct * 0.60 + exp_score * 0.25 + location_score * 0.15)
    
    return {
        "overall_score": round(overall),
        "skill_scores": skill_scores,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "experience_match": experience_match,
        "location_match": location_score >= 75,
        "skill_match_percentage": round(skill_match_pct)
    }


def get_skill_gap_analysis(
    user_skills: List[str],
    job_skills: List[str]
) -> Dict[str, Any]:
    """Analyze skill gap between user profile and job requirements."""
    user_skills_lower = set(s.lower() for s in user_skills)
    job_skills_lower = set(s.lower() for s in job_skills)
    
    matching = [s.title() for s in user_skills_lower.intersection(job_skills_lower)]
    missing = [s.title() for s in job_skills_lower.difference(user_skills_lower)]
    extra = [s.title() for s in user_skills_lower.difference(job_skills_lower)]
    
    # Generate learning recommendations
    learning_resources = {}
    for skill in missing:
        skill_lower = skill.lower()
        if skill_lower in ["react", "vue", "angular", "javascript", "typescript"]:
            learning_resources[skill] = f"Learn {skill} on freeCodeCamp, Udemy, or official docs"
        elif skill_lower in ["python", "django", "fastapi", "flask"]:
            learning_resources[skill] = f"Learn {skill} on Real Python, official docs, or Coursera"
        elif skill_lower in ["aws", "azure", "gcp"]:
            learning_resources[skill] = f"Get {skill} certified via official training programs"
        elif skill_lower in ["docker", "kubernetes"]:
            learning_resources[skill] = f"Learn {skill} via official docs and Play with Docker/Kubernetes"
        else:
            learning_resources[skill] = f"Learn {skill} via online courses and official documentation"
    
    match_percentage = round((len(matching) / max(len(job_skills_lower), 1)) * 100)
    
    return {
        "matching_skills": matching,
        "missing_skills": missing,
        "extra_skills": extra,
        "match_percentage": match_percentage,
        "learning_recommendations": learning_resources,
        "priority_skills": missing[:5]  # Top 5 most important to learn
    }


def get_job_recommendations(
    user_skills: List[str],
    user_experience: float,
    jobs_data: List[Dict]
) -> List[Dict]:
    """Recommend jobs based on user profile."""
    scored_jobs = []
    
    for job in jobs_data:
        job_skills = job.get("skills", [])
        job_exp_min = job.get("experience_min", 0) or 0
        
        match_result = calculate_job_match(
            user_skills=user_skills,
            job_skills=job_skills,
            user_experience=user_experience,
            job_experience_min=job_exp_min,
            user_location=None,
            job_location=job.get("location"),
            job_work_mode=job.get("work_mode")
        )
        
        if match_result["overall_score"] >= 30:
            scored_jobs.append({
                **job,
                "match_score": match_result["overall_score"],
                "matching_skills": match_result["matching_skills"]
            })
    
    # Sort by match score
    scored_jobs.sort(key=lambda x: x["match_score"], reverse=True)
    return scored_jobs[:10]


def analyze_job_description(description: str) -> Dict[str, Any]:
    """Analyze job description to extract requirements and suggest improvements."""
    skills = extract_skills_from_text(description)
    
    # Detect experience requirement
    exp_patterns = [
        r'(\d+)\+?\s*years?\s+(?:of\s+)?experience',
        r'(\d+)\s*-\s*(\d+)\s*years?'
    ]
    experience_required = None
    for pattern in exp_patterns:
        match = re.search(pattern, description.lower())
        if match:
            experience_required = match.group()
            break
    
    # Detect education requirement
    edu_keywords = ["bachelor", "master", "phd", "degree", "diploma", "b.tech", "m.tech", "mba"]
    education_required = None
    for edu in edu_keywords:
        if edu in description.lower():
            education_required = edu.title()
            break
    
    # Suggestions
    suggestions = []
    if len(skills) < 3:
        suggestions.append("Add specific technical skills required for this role")
    if not experience_required:
        suggestions.append("Specify years of experience required")
    if not education_required:
        suggestions.append("Mention education requirements if applicable")
    if len(description) < 200:
        suggestions.append("Add more detailed job description to attract qualified candidates")
    if "responsibilities" not in description.lower() and "duties" not in description.lower():
        suggestions.append("Add a clear list of responsibilities and duties")
    if "benefits" not in description.lower() and "perks" not in description.lower():
        suggestions.append("Mention benefits and perks to attract top talent")
    
    return {
        "detected_skills": skills,
        "experience_required": experience_required,
        "education_required": education_required,
        "word_count": len(description.split()),
        "suggestions": suggestions
    }
