import json
import logging
from typing import List, Dict, Any, Optional
from app.config import settings
from app.services.question_retriever import retrieve_relevant_questions

logger = logging.getLogger(__name__)

def generate_interview_questions(
    role: str,
    difficulty: str = "Intermediate",
    num_questions: int = 5,
    resume_skills: Optional[List[str]] = None,
    job_skills: Optional[List[str]] = None,
    missing_skills: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Generates interview questions using Gemini 3.8 Flash LLM with fallback to RAG dataset.
    """
    if settings.GEMINI_API_KEY and "your_gemini" not in settings.GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            prompt = f"""You are a Principal Tech Interviewer and Hiring Manager.
Create exactly {num_questions} realistic, challenging interview questions for the following candidate:

Target Role: {role}
Difficulty Level: {difficulty}
Candidate Resume Skills: {', '.join(resume_skills or [])}
Job Required Skills: {', '.join(job_skills or [])}
Candidate Missing / Gap Skills: {', '.join(missing_skills or [])}

Mix of questions required:
- 60% Technical & Deep-Dive (including testing gap skills and candidate's claimed skills)
- 20% Real-world scenario/debugging problem
- 20% Behavioral / Architecture

Respond ONLY with valid JSON in this exact structure without markdown backticks:
[
  {{
    "question": "Question text here",
    "category": "Technical",
    "difficulty": "{difficulty}",
    "expected_keywords": ["keyword1", "keyword2", "keyword3"],
    "hints": "Helpful guidance or what the interviewer is looking for"
  }}
]
"""
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )

            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

            data = json.loads(text)
            if isinstance(data, list) and len(data) > 0:
                return data[:num_questions]
        except Exception as e:
            logger.warning(f"Gemini question generation error: {e}. Falling back to RAG Question Retriever.")

    # Fallback to Curated Question Bank / RAG
    return retrieve_relevant_questions(
        role=role,
        difficulty=difficulty,
        limit=num_questions,
        focus_skills=missing_skills or job_skills
    )

def generate_followup_question(
    original_question: str,
    user_answer: str,
    role: str = "Software Engineer"
) -> Optional[str]:
    """Generates an intelligent dynamic follow-up question based on user answer"""
    if settings.GEMINI_API_KEY and "your_gemini" not in settings.GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            prompt = f"""You are an elite technical interviewer conducting an interview for {role}.
Original Question: "{original_question}"
Candidate's Answer: "{user_answer}"

Generate a short, incisive, realistic follow-up question (1 sentence) probing an edge case, trade-off, or asking for deeper clarification on what they just claimed.
Return ONLY the question text."""
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            return response.text.strip().replace('"', '')
        except Exception as e:
            logger.warning(f"Follow-up generation error: {e}")

    # Fallback follow-ups
    fallbacks = [
        "What trade-offs did you consider in this approach, and how would it scale under 10x traffic?",
        "How would you handle failure scenarios or errors in that exact implementation?",
        "Can you walk me through an edge case where this solution might break down?",
        "What specific metrics or telemetry would you monitor in production to verify this works properly?"
    ]
    import random
    return random.choice(fallbacks)
