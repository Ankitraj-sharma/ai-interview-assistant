from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ScoreHistoryItem(BaseModel):
    attempt: int
    date: str
    overall_score: float
    technical_score: float
    communication_score: float

class WeakAreaItem(BaseModel):
    skill: str
    score: float
    recommendation: str

class DashboardStatsResponse(BaseModel):
    user_name: str
    target_role: str
    total_interviews: int
    average_score: float
    highest_score: float
    latest_resume_match: Optional[float] = 0.0
    radar_scores: Dict[str, float]
    score_history: List[ScoreHistoryItem]
    weak_areas: List[WeakAreaItem]
    recommended_topics: List[str]
