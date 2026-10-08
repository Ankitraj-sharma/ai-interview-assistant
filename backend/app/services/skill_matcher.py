from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def compute_semantic_similarity(text1: str, text2: str) -> float:
    """
    Computes cosine similarity between two texts using TF-IDF representation.
    Returns score as a percentage between 0.0 and 100.0.
    """
    if not text1.strip() or not text2.strip():
        return 0.0
    try:
        vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return round(float(sim) * 100, 2)
    except Exception:
        return 0.0

def match_skills(
    resume_skills: List[str], 
    job_skills: List[str], 
    resume_text: str = "", 
    job_text: str = ""
) -> Dict[str, Any]:
    """
    Analyzes candidate resume skills vs job description skills,
    calculates match percentage, missing skills, semantic similarity,
    readiness tier, and actionable recommendations.
    """
    resume_set = {s.lower(): s for s in resume_skills}
    job_set = {s.lower(): s for s in job_skills}

    matched_skills = []
    missing_skills = []

    for s_lower, s_orig in job_set.items():
        if s_lower in resume_set:
            matched_skills.append(s_orig)
        else:
            missing_skills.append(s_orig)

    # Calculate Skill Match Score
    if len(job_skills) > 0:
        match_percentage = round((len(matched_skills) / len(job_skills)) * 100, 2)
    else:
        match_percentage = 100.0 if len(resume_skills) > 0 else 0.0

    # Semantic similarity of overall text
    semantic_sim = compute_semantic_similarity(
        resume_text or " ".join(resume_skills),
        job_text or " ".join(job_skills)
    )

    # Readiness Category
    if match_percentage >= 75.0:
        readiness_status = "Ready for Interview"
    elif match_percentage >= 50.0:
        readiness_status = "High Potential"
    else:
        readiness_status = "Needs Preparation"

    # Recommendations
    recommendations = []
    for skill in missing_skills[:4]:
        recommendations.append(f"Review core concepts, real-world patterns, and typical interview questions for {skill}.")
    if semantic_sim < 40.0:
        recommendations.append("Tailor your resume project descriptions to mirror the specific terminology in the job description.")
    if not recommendations:
        recommendations.append("Strong skill alignment! Focus on explaining system design architecture and edge cases.")

    # Suggested interview focus topics
    suggested_topics = (missing_skills[:3] + matched_skills[:3])[:5]

    return {
        "match_percentage": match_percentage,
        "semantic_similarity": semantic_sim,
        "matched_skills": sorted(matched_skills),
        "missing_skills": sorted(missing_skills),
        "readiness_status": readiness_status,
        "recommendations": recommendations,
        "suggested_interview_topics": suggested_topics
    }
