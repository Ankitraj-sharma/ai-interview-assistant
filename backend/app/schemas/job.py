from typing import List, Optional
from pydantic import BaseModel

class JobAnalyzeRequest(BaseModel):
    job_title: str
    company_name: Optional[str] = "Target Company"
    job_description: str

class JobAnalyzeResponse(BaseModel):
    job_id: str
    job_title: str
    company_name: str
    required_skills: List[str]
    experience_level: str
    key_responsibilities: List[str] = []
    message: str
