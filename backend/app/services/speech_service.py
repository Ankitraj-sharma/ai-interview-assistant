import re
from typing import Dict, Any

FILLER_WORDS = [
    "um", "uh", "er", "ah", "like", "you know", "basically", 
    "actually", "sort of", "kind of", "i mean", "right?"
]

def analyze_speech_metrics(transcript: str, duration_seconds: float = 30.0) -> Dict[str, Any]:
    """
    Computes communication and speech metrics based on transcript and speaking duration.
    """
    if not transcript:
        return {
            "wpm": 0,
            "filler_words_count": 0,
            "filler_words_detected": [],
            "speaking_speed": "N/A",
            "clarity_score": 0.0
        }

    words = transcript.strip().split()
    word_count = len(words)

    # Duration normalization
    duration_min = max(duration_seconds / 60.0, 0.1)
    wpm = round(word_count / duration_min, 1)

    # Detect filler words
    transcript_lower = transcript.lower()
    found_fillers = []
    total_fillers = 0

    for filler in FILLER_WORDS:
        pattern = r'\b' + re.escape(filler) + r'\b'
        matches = re.findall(pattern, transcript_lower)
        if matches:
            found_fillers.append({"word": filler, "count": len(matches)})
            total_fillers += len(matches)

    # Assess speaking pace
    if wpm < 110:
        pace = "Slow"
    elif 110 <= wpm <= 165:
        pace = "Optimal"
    elif 165 < wpm <= 190:
        pace = "Slightly Fast"
    else:
        pace = "Too Fast"

    # Communication clarity score (penalizes excessive filler words or extreme speed)
    clarity = 85.0
    if total_fillers > 5:
        clarity -= min(25.0, total_fillers * 2.5)
    if pace == "Too Fast" or pace == "Slow":
        clarity -= 10.0

    return {
        "wpm": wpm,
        "duration_seconds": round(duration_seconds, 1),
        "filler_words_count": total_fillers,
        "filler_words_detected": found_fillers,
        "speaking_speed": pace,
        "clarity_score": max(40.0, round(clarity, 1))
    }
