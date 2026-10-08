import json
import os
import re
from typing import List, Set

def load_skill_taxonomy() -> dict:
    curr_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    taxonomy_file = os.path.join(curr_dir, "datasets", "skill_taxonomy.json")
    try:
        with open(taxonomy_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {
            "common": ["python", "javascript", "react", "fastapi", "docker", "sql", "git", "aws", "mongodb", "postgres"]
        }

TAXONOMY = load_skill_taxonomy()

def extract_skills_from_text(text: str) -> List[str]:
    """
    Extracts canonical skills from resume or job description text using 
    boundary-aware multi-word n-gram regex matching against taxonomy.
    """
    if not text:
        return []

    text_lower = text.lower()
    found_skills: Set[str] = set()

    for category, skills in TAXONOMY.items():
        for skill in skills:
            pattern = r'(?<![a-zA-Z0-9#\+])' + re.escape(skill) + r'(?![a-zA-Z0-9#\+])'
            if re.search(pattern, text_lower):
                # Format skill cleanly
                formatted_name = skill.title()
                # Specific capitalization fixes
                replacements = {
                    "Sql": "SQL", "Html": "HTML", "Css": "CSS", "Api": "API",
                    "Rest Api": "REST API", "Restful Api": "RESTful API",
                    "Jwt": "JWT", "Oop": "OOP", "Dsa": "DSA", "Aws": "AWS",
                    "Gcp": "GCP", "Ai": "AI", "Ml": "ML", "Nlp": "NLP",
                    "Llm": "LLM", "Rag": "RAG", "Ci/Cd": "CI/CD", "Tdd": "TDD",
                    "Php": "PHP", "Db": "DB", "Faiss": "FAISS",
                    "Next.Js": "Next.js", "Node.Js": "Node.js", "Vue.Js": "Vue.js",
                    "Express.Js": "Express.js", "Nest.Js": "Nest.js",
                    "C++": "C++", "C#": "C#", ".Net": ".NET"
                }
                for old, new in replacements.items():
                    if formatted_name.lower() == old.lower():
                        formatted_name = new
                        break
                found_skills.add(formatted_name)

    return sorted(list(found_skills))
