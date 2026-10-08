import uuid
from fastapi import APIRouter, Depends
from app.schemas.match import SkillMatchRequest, SkillMatchResponse
from app.services.skill_matcher import match_skills
from app.database.supabase_client import (
    db_save_match, 
    db_get_resume,
    db_get_match
)
from app.utils.security import get_current_user_optional

router = APIRouter(prefix="/match", tags=["Skill Matching"])

@router.post("/analyze", response_model=SkillMatchResponse)
def analyze_skill_match(
    req: SkillMatchRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    resume_skills = req.resume_skills or []
    job_skills = req.job_skills or []
    resume_text = req.resume_text or ""
    job_text = req.job_text or ""

    # Fetch from DB if resume_id was provided
    if req.resume_id and not resume_skills:
        res = db_get_resume(req.resume_id)
        if res:
            resume_skills = res.get("extracted_skills", [])
            resume_text = res.get("parsed_text", "")

    # Perform analysis
    result = match_skills(
        resume_skills=resume_skills,
        job_skills=job_skills,
        resume_text=resume_text,
        job_text=job_text
    )

    match_id = str(uuid.uuid4())
    match_record = {
        "id": match_id,
        "user_id": current_user.get("id") if current_user else None,
        "resume_id": req.resume_id,
        "job_id": req.job_id,
        "match_percentage": result["match_percentage"],
        "semantic_similarity": result["semantic_similarity"],
        "matched_skills": result["matched_skills"],
        "missing_skills": result["missing_skills"],
        "recommendations": result["recommendations"]
    }
    db_save_match(match_record)

    return SkillMatchResponse(
        match_id=match_id,
        match_percentage=result["match_percentage"],
        semantic_similarity=result["semantic_similarity"],
        matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"],
        readiness_status=result["readiness_status"],
        recommendations=result["recommendations"],
        suggested_interview_topics=result["suggested_interview_topics"]
    )
