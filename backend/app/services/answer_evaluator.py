import json
import logging
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

def evaluate_answer_gemini(
    question: str,
    user_answer: str,
    category: str,
    expected_keywords: List[str]
) -> Dict[str, Any]:
    """Uses Gemini 3.8 Flash to evaluate user's answer"""
    from google import genai
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = f"""You are a Senior Tech Interviewer and Staff Engineer evaluating a candidate's interview answer.

Question: "{question}"
Category: {category}
Expected concepts/keywords: {', '.join(expected_keywords)}
Candidate's Answer: "{user_answer}"

Evaluate the candidate's answer rigorously on these 4 dimensions (0 to 100 each):
1. technical_score: Accuracy of tech concepts, terminology, correctness.
2. relevance_score: Direct alignment with what was asked, no rambling.
3. completeness_score: Thoroughness, edge cases, trade-offs explained.
4. communication_score: Clarity, structure, articulation.

Also compute:
overall_score = weighted average (technical 35%, relevance 25%, completeness 25%, communication 15%).

Provide 2-3 specific strengths, 2-3 weaknesses/areas of improvement, constructive summary feedback, and a brief ideal model answer.

Respond ONLY with valid JSON with this exact structure without markdown backticks:
{{
  "technical_score": 85.0,
  "relevance_score": 90.0,
  "completeness_score": 78.0,
  "communication_score": 82.0,
  "overall_score": 84.0,
  "strengths": ["Clear explanation of concept", "Mentioned correct technical terms"],
  "weaknesses": ["Could have detailed real-world edge cases", "Missed mentioning trade-offs"],
  "feedback": "Strong answer demonstrating good foundational understanding...",
  "suggested_model_answer": "In production, the ideal approach involves..."
}}
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

    return json.loads(text)

def evaluate_answer_heuristic(
    question: str,
    user_answer: str,
    category: str,
    expected_keywords: List[str]
) -> Dict[str, Any]:
    """Deterministic heuristic evaluation fallback for offline or testing mode"""
    words = user_answer.strip().split()
    word_count = len(words)
    answer_lower = user_answer.lower()

    # Keyword coverage
    matched_kw = [kw for kw in expected_keywords if kw.lower() in answer_lower]
    kw_ratio = len(matched_kw) / max(len(expected_keywords), 1)

    # Word count scoring
    if word_count < 10:
        length_multiplier = 0.4
    elif word_count < 30:
        length_multiplier = 0.7
    elif word_count < 150:
        length_multiplier = 0.95
    else:
        length_multiplier = 0.9

    technical = round(min(100.0, (kw_ratio * 70 + (length_multiplier * 30))), 1)
    relevance = round(min(100.0, 70.0 + (len(matched_kw) * 6)), 1)
    completeness = round(min(100.0, (word_count / 80.0) * 80 + (kw_ratio * 20)), 1)
    communication = round(min(100.0, 75.0 if word_count >= 20 else 50.0), 1)

    overall = round((technical * 0.35 + relevance * 0.25 + completeness * 0.25 + communication * 0.15), 1)

    strengths = []
    if matched_kw:
        strengths.append(f"Successfully integrated relevant concepts: {', '.join(matched_kw[:3])}.")
    if word_count >= 30:
        strengths.append("Provided a reasonably structured and thoughtful explanation.")
    else:
        strengths.append("Attempted a direct response.")

    weaknesses = []
    missing_kw = [kw for kw in expected_keywords if kw not in matched_kw]
    if missing_kw:
        weaknesses.append(f"Consider addressing key industry terms such as: {', '.join(missing_kw[:3])}.")
    if word_count < 30:
        weaknesses.append("Response is overly brief. Elaborate on edge cases, implementation details, and trade-offs.")

    return {
        "technical_score": technical,
        "relevance_score": relevance,
        "completeness_score": completeness,
        "communication_score": communication,
        "overall_score": overall,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "feedback": f"Your response achieved an overall score of {overall}%. To elevate this to top percentile, emphasize architectural trade-offs and concrete production examples.",
        "suggested_model_answer": f"A comprehensive answer would start with definition, followed by trade-offs, mentioning key concepts: {', '.join(expected_keywords[:4])}."
    }

def evaluate_answer(
    question: str,
    user_answer: str,
    category: str = "Technical",
    expected_keywords: Optional[List[str]] = None
) -> Dict[str, Any]:
    expected_keywords = expected_keywords or []
    if settings.GEMINI_API_KEY and "your_gemini" not in settings.GEMINI_API_KEY:
        try:
            return evaluate_answer_gemini(question, user_answer, category, expected_keywords)
        except Exception as e:
            logger.warning(f"Gemini evaluation error: {e}. Using heuristic evaluator.")

    return evaluate_answer_heuristic(question, user_answer, category, expected_keywords)
