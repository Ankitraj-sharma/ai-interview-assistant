from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ParsedResumeData(BaseModel):
    id: Optional[str] = None
    filename: str
    skills: List[str]
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    contact: Dict[str, Optional[str]] = {}
    total_words: int = 0
    raw_text: str = ""

class ResumeUploadResponse(BaseModel):
    success: bool
    resume_id: str
    data: ParsedResumeData
    message: str
