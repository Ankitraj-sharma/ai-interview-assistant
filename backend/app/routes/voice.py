from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File
from app.services.speech_service import analyze_speech_metrics, transcribe_audio_gemini

router = APIRouter(prefix="/voice", tags=["Voice & Communication"])

class VoiceAnalysisRequest(BaseModel):
    transcript: str
    duration_seconds: float = 30.0

@router.post("/analyze-metrics")
def analyze_metrics(req: VoiceAnalysisRequest):
    return analyze_speech_metrics(req.transcript, req.duration_seconds)

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    mime_type = file.content_type or "audio/webm"
    transcription = transcribe_audio_gemini(audio_bytes, mime_type)
    return {
        "transcription": transcription,
        "success": bool(transcription)
    }
