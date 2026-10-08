import os
import json
import random
from typing import List, Dict, Any, Optional

def load_questions_bank() -> List[Dict[str, Any]]:
    curr_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(curr_dir, "datasets", "questions_bank.json")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

QUESTIONS_BANK = load_questions_bank()

def retrieve_relevant_questions(
    role: str,
    difficulty: str = "Intermediate",
    limit: int = 5,
    focus_skills: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    RAG-style Question Retriever:
    Finds the most relevant interview questions from the curated dataset based on
    role, target difficulty, and candidate's target/missing skills.
    """
    scored_questions = []
    role_lower = role.lower()
    focus_skills_lower = [s.lower() for s in (focus_skills or [])]

    for q in QUESTIONS_BANK:
        score = 0.0
        q_role = q.get("role", "").lower()
        q_diff = q.get("difficulty", "").lower()
        q_text = q.get("question", "").lower()
        keywords = [k.lower() for k in q.get("expected_keywords", [])]

        # Role match
        if q_role == role_lower or (q_role in role_lower) or (role_lower in q_role):
            score += 5.0
        elif q.get("category") == "HR":
            score += 2.0  # HR questions fit any role

        # Difficulty match
        if q_diff == difficulty.lower():
            score += 3.0

        # Skill relevance match
        for s in focus_skills_lower:
            if s in q_text or any(s in k for k in keywords):
                score += 4.0

        scored_questions.append((score, q))

    # Sort descending by relevance score
    scored_questions.sort(key=lambda x: x[0], reverse=True)

    selected = [item[1] for item in scored_questions[:limit]]

    # If dataset has fewer questions than requested, fill with general technical & behavioral
    if len(selected) < limit:
        all_pool = [q for q in QUESTIONS_BANK if q not in selected]
        random.shuffle(all_pool)
        selected.extend(all_pool[:limit - len(selected)])

    return selected
