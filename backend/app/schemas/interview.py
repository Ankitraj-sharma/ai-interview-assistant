from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class StartInterviewRequest(BaseModel):
    role: str
    difficulty: str = "Intermediate"  # Beginner, Intermediate, Advanced
    num_questions: int = 5
    resume_id: Optional[str] = None
    job_id: Optional[str] = None
    missing_skills: Optional[List[str]] = None

class InterviewQuestionSchema(BaseModel):
    id: str
    session_id: str
    question_order: int
    question_text: str
    category: str
    difficulty: str
    expected_keywords: List[str] = []

class StartInterviewResponse(BaseModel):
    session_id: str
    role: str
    difficulty: str
    total_questions: int
    questions: List[InterviewQuestionSchema]

class SubmitAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    user_answer: str
    audio_url: Optional[str] = None
    speaking_metrics: Optional[Dict[str, Any]] = None

class EvaluationResponse(BaseModel):
    answer_id: str
    overall_score: float
    technical_score: float
    communication_score: float
    relevance_score: float
    completeness_score: float
    strengths: List[str]
    weaknesses: List[str]
    feedback: str
    suggested_model_answer: Optional[str] = None
    follow_up_question: Optional[str] = None

class FinishInterviewResponse(BaseModel):
    session_id: str
    overall_score: float
    technical_score: float
    communication_score: float
    relevance_score: float
    completeness_score: float
    summary_feedback: str
    weak_areas: List[str]
    recommendations: List[str]
    completed_at: str
