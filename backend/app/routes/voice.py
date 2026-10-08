from pydantic import BaseModel
from fastapi import APIRouter
from app.services.speech_service import analyze_speech_metrics

router = APIRouter(prefix="/voice", tags=["Voice & Communication"])

class VoiceAnalysisRequest(BaseModel):
    transcript: str
    duration_seconds: float = 30.0

@router.post("/analyze-metrics")
def analyze_metrics(req: VoiceAnalysisRequest):
    return analyze_speech_metrics(req.transcript, req.duration_seconds)
