from typing import List, Optional
from pydantic import BaseModel

class SkillMatchRequest(BaseModel):
    resume_id: Optional[str] = None
    resume_skills: Optional[List[str]] = None
    job_id: Optional[str] = None
    job_skills: Optional[List[str]] = None
    resume_text: Optional[str] = None
    job_text: Optional[str] = None

class SkillMatchResponse(BaseModel):
    match_id: str
    match_percentage: float
    semantic_similarity: float
    matched_skills: List[str]
    missing_skills: List[str]
    readiness_status: str  # Ready, High Potential, Needs Preparation
    recommendations: List[str]
    suggested_interview_topics: List[str]
