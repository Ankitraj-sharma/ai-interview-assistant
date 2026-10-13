import json
import logging
from typing import List, Dict, Any, Optional
from app.config import settings
from app.services.question_retriever import retrieve_relevant_questions

logger = logging.getLogger(__name__)

COMPANY_PERSONAS = {
    "Google": {
        "emphasis": "Algorithmic scalability, $O(N)$ Big-O computational complexity, distributed systems fault-tolerance, and rigorous systems trade-offs.",
        "style": "Probe edge cases, large-scale concurrency, and distributed data structures."
    },
    "Amazon": {
        "emphasis": "Amazon 16 Leadership Principles (Customer Obsession, Ownership, Bias for Action, Dive Deep, Deliver Results) and STAR method.",
        "style": "Evaluate trade-offs between speed and long-term architecture, asking for past metrics and customer impact."
    },
    "Fast-Paced Startup": {
        "emphasis": "Pragmatic engineering velocity, full-stack debugging, rapid prototyping, and shipping resilient MVPs.",
        "style": "Focus on high-speed execution, minimal dependencies, and real-world failure remediation."
    },
    "Meta": {
        "emphasis": "High-throughput product engineering, real-time caching, asynchronous messaging, and moving fast with stable infra.",
        "style": "Probe API contracts, database query efficiency, and user-facing responsiveness."
    },
    "General Tech": {
        "emphasis": "Solid software engineering fundamentals, design patterns, clean code, and effective communication.",
        "style": "Balanced assessment across system design, programming best practices, and behavioral questions."
    }
}

CODING_TEMPLATES = {
    "Two Sum / Map Lookup": "function twoSum(nums, target) {\n    // Write your optimal solution here\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}",
    "LRU Cache": "class LRUCache {\n    constructor(capacity) {\n        this.capacity = capacity;\n        this.cache = new Map();\n    }\n    get(key) {\n        if (!this.cache.has(key)) return -1;\n        const val = this.cache.get(key);\n        this.cache.delete(key);\n        this.cache.set(key, val);\n        return val;\n    }\n    put(key, value) {\n        if (this.cache.has(key)) this.cache.delete(key);\n        else if (this.cache.size >= this.capacity) {\n            const oldestKey = this.cache.keys().next().value;\n            this.cache.delete(oldestKey);\n        }\n        this.cache.set(key, value);\n    }\n}",
    "Rate Limiter": "class TokenBucketRateLimiter {\n    constructor(capacity, refillRatePerSec) {\n        this.capacity = capacity;\n        this.tokens = capacity;\n        this.refillRate = refillRatePerSec;\n        this.lastRefill = Date.now();\n    }\n    allowRequest() {\n        this.refill();\n        if (this.tokens >= 1) {\n            this.tokens -= 1;\n            return true;\n        }\n        return false;\n    }\n    refill() {\n        const now = Date.now();\n        const elapsed = (now - this.lastRefill) / 1000;\n        this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);\n        this.lastRefill = now;\n    }\n}"
}

def generate_interview_questions(
    role: str,
    difficulty: str = "Intermediate",
    company_mode: str = "General Tech",
    num_questions: int = 5,
    include_coding_challenge: bool = True,
    resume_skills: Optional[List[str]] = None,
    job_skills: Optional[List[str]] = None,
    missing_skills: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Generates interview questions using Gemini 3.8 Flash tailored to company persona
    and includes coding sandbox challenges where appropriate.
    """
    persona = COMPANY_PERSONAS.get(company_mode, COMPANY_PERSONAS["General Tech"])

    if settings.GEMINI_API_KEY and "your_gemini" not in settings.GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            coding_instruction = (
                "Ensure exactly one question is a practical Coding Challenge ('category': 'Coding', 'is_coding_challenge': true, 'code_starter_template': 'function solveProblem(input) { ... }') testing algorithm or data structures."
                if include_coding_challenge else ""
            )

            prompt = f"""You are a Hiring Committee Lead conducting an elite technical interview at {company_mode}.
Interview Persona Style:
- Emphasis: {persona['emphasis']}
- Persona Assessment Style: {persona['style']}

Target Role: {role}
Target Seniority/Difficulty: {difficulty}
Candidate Resume Skills: {', '.join(resume_skills or [])}
Target Job Required Skills: {', '.join(job_skills or [])}
Target Missing Skills to Stress-Test: {', '.join(missing_skills or [])}

Generate exactly {num_questions} realistic, rigorous interview questions.
{coding_instruction}

Respond ONLY with valid JSON in this exact structure without markdown backticks:
[
  {{
    "question": "Question text here",
    "category": "Technical",
    "difficulty": "{difficulty}",
    "expected_keywords": ["keyword1", "keyword2", "keyword3"],
    "is_coding_challenge": false,
    "code_starter_template": "",
    "hints": "Helpful interviewer hint or edge cases to consider"
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
    retrieved = retrieve_relevant_questions(
        role=role,
        difficulty=difficulty,
        limit=num_questions,
        focus_skills=missing_skills or job_skills
    )

    # If coding challenge is requested, ensure at least one coding challenge exists
    if include_coding_challenge and retrieved:
        retrieved[1 if len(retrieved) > 1 else 0]["is_coding_challenge"] = True
        retrieved[1 if len(retrieved) > 1 else 0]["category"] = "Coding"
        retrieved[1 if len(retrieved) > 1 else 0]["code_starter_template"] = CODING_TEMPLATES["Two Sum / Map Lookup"]

    return retrieved

def generate_followup_question(
    original_question: str,
    user_answer: str,
    role: str = "Software Engineer",
    company_mode: str = "General Tech"
) -> Optional[str]:
    """Generates an intelligent dynamic follow-up question based on user answer & company mode"""
    persona = COMPANY_PERSONAS.get(company_mode, COMPANY_PERSONAS["General Tech"])

    if settings.GEMINI_API_KEY and "your_gemini" not in settings.GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            prompt = f"""You are an elite technical interviewer at {company_mode} ({persona['emphasis']}).
Original Question: "{original_question}"
Candidate's Answer: "{user_answer}"

Generate a short, incisive, realistic follow-up question (1 sentence) probing an edge case, trade-off, or asking for deeper clarification in the style of {company_mode}.
Return ONLY the question text."""
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            return response.text.strip().replace('"', '')
        except Exception as e:
            logger.warning(f"Follow-up generation error: {e}")

    fallbacks = [
        "What trade-offs did you consider in this approach, and how would it scale under 10x traffic?",
        "How would you handle failure scenarios or distributed network partitions in that exact implementation?",
        "Can you walk me through an edge case where this solution might break down?",
        "What specific metrics or telemetry would you monitor in production to verify this works properly?"
    ]
    import random
    return random.choice(fallbacks)

def calibrate_adaptive_question(
    next_question: Dict[str, Any],
    previous_score: float,
    current_difficulty: str
) -> Dict[str, Any]:
    """
    CAT (Computerized Adaptive Testing) calibration:
    Dynamically scales the difficulty and challenge level of subsequent questions
    based on the candidate's performance.
    """
    q_copy = dict(next_question)

    if previous_score >= 85.0:
        q_copy["difficulty"] = "Advanced"
        q_copy["adaptive_status"] = "Scaled Up (Hard 🔥)"
        if not q_copy.get("question_text", "").startswith("[Advanced Deep-Dive]"):
            q_copy["question_text"] = f"[Advanced Deep-Dive & Scale]: {q_copy.get('question_text', '')}"
    elif previous_score <= 55.0:
        q_copy["difficulty"] = "Beginner / Core"
        q_copy["adaptive_status"] = "Calibrated (Foundations 🎯)"
        if not q_copy.get("question_text", "").startswith("[Foundational Diagnostic]"):
            q_copy["question_text"] = f"[Foundational Diagnostic]: {q_copy.get('question_text', '')}"
    else:
        q_copy["adaptive_status"] = "Standard Dynamic"

    return q_copy
