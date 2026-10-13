import json
import logging
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

def evaluate_answer_gemini(
    question: str,
    user_answer: str,
    category: str,
    expected_keywords: List[str],
    company_mode: str = "General Tech",
    code_submission: Optional[str] = None,
    programming_language: Optional[str] = "javascript"
) -> Dict[str, Any]:
    """Uses Gemini 3.8 Flash to evaluate user's answer and code submissions"""
    from google import genai
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    code_prompt_section = ""
    if code_submission and code_submission.strip():
        code_prompt_section = f"""
Candidate's Submitted Code ({programming_language}):
```
{code_submission}
```
Analyze this code specifically for:
1. time_complexity (e.g. 'O(N)', 'O(N log N)', 'O(N^2)')
2. space_complexity (e.g. 'O(1)', 'O(N)')
3. code_quality: Cleanliness, variable naming, edge case handling
4. optimized_code: A clean, idiomatic model solution
"""

    prompt = f"""You are a Staff Engineer & Hiring Committee member conducting an interview at {company_mode}.

Question: "{question}"
Category: {category}
Expected concepts/keywords: {', '.join(expected_keywords)}
Candidate's Verbal/Text Answer: "{user_answer}"
{code_prompt_section}

Company Evaluation Persona: {company_mode}.
- If Google: Enforce strict computational Big-O complexity and distributed scale.
- If Amazon: Evaluate Amazon Leadership Principles alignment and STAR method clarity.
- If Startup: Evaluate pragmatic velocity, error handling, and clean maintainability.

Evaluate the candidate rigorously on these 4 core dimensions (0 to 100 each):
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
  "code_score": 85.0,
  "strengths": ["Clear explanation of concept", "Mentioned correct technical terms"],
  "weaknesses": ["Could have detailed real-world edge cases", "Missed mentioning trade-offs"],
  "feedback": "Strong answer demonstrating good foundational understanding...",
  "company_feedback": "Feedback tailored specifically for {company_mode} hiring standards...",
  "suggested_model_answer": "In production, the ideal approach involves...",
  "code_analysis": {{
    "time_complexity": "O(N)",
    "space_complexity": "O(N)",
    "code_quality": "Clean and well structured with optimal hash map lookup.",
    "optimized_code": "// Clean model code..."
  }}
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
    expected_keywords: List[str],
    company_mode: str = "General Tech",
    code_submission: Optional[str] = None
) -> Dict[str, Any]:
    """Deterministic heuristic evaluation fallback for offline or testing mode"""
    words = user_answer.strip().split()
    word_count = len(words)
    answer_lower = user_answer.lower()

    matched_kw = []
    for kw in expected_keywords:
        kw_lower = kw.lower()
        if kw_lower in answer_lower:
            matched_kw.append(kw)
        elif any(sub_w in answer_lower for sub_w in kw_lower.split() if len(sub_w) > 3):
            matched_kw.append(kw)

    kw_ratio = len(matched_kw) / max(len(expected_keywords), 1)

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

    code_analysis = None
    code_score = None
    if code_submission and len(code_submission.strip()) > 10:
        has_loop = "for" in code_submission or "while" in code_submission
        time_c = "O(N)" if has_loop else "O(1)"
        code_score = 80.0 if has_loop else 65.0
        code_analysis = {
            "time_complexity": time_c,
            "space_complexity": "O(1)",
            "code_quality": "Syntactically correct with good variable declarations.",
            "optimized_code": "// Model code\n" + code_submission.strip()
        }

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

    # Comprehensive Domain-Specific Model Answers for Heuristic Engine
    q_lower = question.lower()
    if "client-side rendering" in q_lower or "csr" in q_lower or "ssr" in q_lower:
        model_ans = (
            "Ideal Solution: Server-Side Rendering (SSR, e.g. Next.js) renders complete HTML on the server for each request, "
            "providing instantaneous First Contentful Paint (FCP) and optimal SEO discoverability, making it essential for public-facing "
            "portals and e-commerce. Conversely, Client-Side Rendering (CSR, e.g. standard React SPA) downloads a minimal HTML shell and "
            "executes JavaScript client-side, offering silky-smooth page transitions and offline caching for authenticated SaaS dashboards. "
            "SSR introduces server CPU compute overhead and hydration latency, whereas CSR suffers from slower initial load times on low-bandwidth networks."
        )
    elif "jwt" in q_lower or "token" in q_lower or "csrf" in q_lower or "xss" in q_lower:
        model_ans = (
            "Ideal Solution: A secure authentication pipeline stores JWT tokens inside HttpOnly, Secure, SameSite=Lax/Strict cookies "
            "rather than browser localStorage, completely preventing XSS-based token theft. CSRF vulnerabilities are mitigated via SameSite cookies "
            "combined with anti-CSRF challenge headers. Access tokens should remain short-lived (5-15 mins) with refresh token rotation and server-side "
            "revocation blacklists (e.g. in Redis) to invalidate compromised sessions immediately."
        )
    elif "spike" in q_lower or "latency" in q_lower or "4 seconds" in q_lower or "diagnostic" in q_lower:
        model_ans = (
            "Ideal Solution: Systematic 4-step remediation: 1) Telemetry & Isolation: Inspect APM traces (Datadog/New Relic) to identify whether "
            "the latency is database I/O, downstream microservices, or garbage collection stalls. 2) Database Diagnosis: Check active locks, connection pool "
            "exhaustion, and run EXPLAIN ANALYZE on slow queries to add missing B-Tree indexes. 3) Caching & Load Shedding: Deploy Redis caching for frequent "
            "read queries, enable read replicas, and activate circuit breakers. 4) Scaling: Scale horizontal stateless pods and verify memory thresholds."
        )
    elif "two sum" in q_lower or "target" in q_lower or "array" in q_lower or "complexity" in q_lower:
        model_ans = (
            "Ideal Solution: The optimal algorithm achieves O(N) Time and O(N) Space Complexity using a Hash Map (Hash Table):\n"
            "function twoSum(nums, target) {\n"
            "  const seen = new Map();\n"
            "  for (let i = 0; i < nums.length; i++) {\n"
            "    const complement = target - nums[i];\n"
            "    if (seen.has(complement)) {\n"
            "      return [seen.get(complement), i];\n"
            "    }\n"
            "    seen.set(nums[i], i);\n"
            "  }\n"
            "  return [];\n"
            "}\n"
            "This performs a single linear pass instead of a nested O(N^2) brute-force scan."
        )
    else:
        model_ans = (
            f"Ideal Solution: A top-tier interview answer begins with clear technical definitions, follows with system architecture, "
            f"and explicitly incorporates essential industry concepts: {', '.join(expected_keywords[:5])}. "
            f"It then highlights production trade-offs, high-concurrency failure modes, and automated error recovery."
        )

    return {
        "technical_score": technical,
        "relevance_score": relevance,
        "completeness_score": completeness,
        "communication_score": communication,
        "overall_score": overall,
        "code_score": code_score,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "feedback": f"Your response achieved an overall score of {overall}%. To meet {company_mode} standards, emphasize architectural trade-offs.",
        "company_feedback": f"For {company_mode}, structure your reasoning with measurable impacts and explicit Big-O trade-offs.",
        "suggested_model_answer": model_ans,
        "code_analysis": code_analysis
    }

def evaluate_answer(
    question: str,
    user_answer: str,
    category: str = "Technical",
    expected_keywords: Optional[List[str]] = None,
    company_mode: str = "General Tech",
    code_submission: Optional[str] = None,
    programming_language: Optional[str] = "javascript"
) -> Dict[str, Any]:
    expected_keywords = expected_keywords or []
    if settings.GEMINI_API_KEY and "your_gemini" not in settings.GEMINI_API_KEY:
        try:
            return evaluate_answer_gemini(
                question=question,
                user_answer=user_answer,
                category=category,
                expected_keywords=expected_keywords,
                company_mode=company_mode,
                code_submission=code_submission,
                programming_language=programming_language
            )
        except Exception as e:
            logger.warning(f"Gemini evaluation error: {e}. Using heuristic evaluator.")

    return evaluate_answer_heuristic(
        question=question,
        user_answer=user_answer,
        category=category,
        expected_keywords=expected_keywords,
        company_mode=company_mode,
        code_submission=code_submission
    )
