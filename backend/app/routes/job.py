import uuid
import re
from fastapi import APIRouter, Depends
from app.schemas.job import JobAnalyzeRequest, JobAnalyzeResponse
from app.services.skill_extractor import extract_skills_from_text
from app.database.supabase_client import db_save_job
from app.utils.security import get_current_user_optional

router = APIRouter(prefix="/job", tags=["Job Description"])

@router.post("/analyze", response_model=JobAnalyzeResponse)
def analyze_job_description(
    req: JobAnalyzeRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    job_id = str(uuid.uuid4())
    skills = extract_skills_from_text(req.job_description)

    # Detect experience level from text
    jd_lower = req.job_description.lower()
    if any(k in jd_lower for k in ["lead", "principal", "architect", "staff", "10+ years", "8+ years"]):
        exp_level = "Senior / Lead (5+ years)"
    elif any(k in jd_lower for k in ["senior", "5+ years", "4+ years", "3+ years"]):
        exp_level = "Mid-Senior (3-5 years)"
    elif any(k in jd_lower for k in ["entry", "fresher", "intern", "junior", "0-1 year", "graduate"]):
        exp_level = "Entry Level / Junior (0-2 years)"
    else:
        exp_level = "Intermediate (2-4 years)"

    # Extract bullet points / responsibilities
    responsibilities = []
    for line in req.job_description.split("\n"):
        line_clean = line.strip(" -*•")
        if len(line_clean) > 25 and not line_clean.endswith(":"):
            responsibilities.append(line_clean)
            if len(responsibilities) >= 5:
                break

    job_record = {
        "id": job_id,
        "user_id": current_user.get("id") if current_user else None,
        "job_title": req.job_title,
        "company_name": req.company_name or "Target Company",
        "raw_text": req.job_description,
        "extracted_skills": skills,
        "experience_required": exp_level
    }
    db_save_job(job_record)

    return JobAnalyzeResponse(
        job_id=job_id,
        job_title=req.job_title,
        company_name=req.company_name or "Target Company",
        required_skills=skills,
        experience_level=exp_level,
        key_responsibilities=responsibilities,
        message=f"Job description analyzed. Extracted {len(skills)} required skills."
    )
