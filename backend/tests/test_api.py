import pytest
from app.services.skill_extractor import extract_skills_from_text
from app.services.skill_matcher import match_skills, compute_semantic_similarity
from app.services.question_retriever import retrieve_relevant_questions
from app.services.answer_evaluator import evaluate_answer
from app.services.speech_service import analyze_speech_metrics

def test_skill_extraction():
    sample_text = """
    Experienced Software Engineer skilled in React, FastAPI, Docker, and PostgreSQL.
    Proficient with Python, TypeScript, REST API development, and Git.
    """
    skills = extract_skills_from_text(sample_text)
    assert "React" in skills
    assert "FastAPI" in skills
    assert "Docker" in skills
    assert "Python" in skills
    assert "PostgreSQL" in skills

def test_skill_matching():
    resume_skills = ["React", "Python", "FastAPI", "Git"]
    job_skills = ["React", "FastAPI", "Docker", "AWS", "Kubernetes"]

    result = match_skills(resume_skills, job_skills)
    assert "React" in result["matched_skills"]
    assert "FastAPI" in result["matched_skills"]
    assert "Docker" in result["missing_skills"]
    assert "AWS" in result["missing_skills"]
    assert result["match_percentage"] == 40.0
    assert result["readiness_status"] == "Needs Preparation"

def test_question_retrieval():
    questions = retrieve_relevant_questions(role="Full Stack Developer", limit=3)
    assert len(questions) == 3
    assert all("question" in q for q in questions)

def test_answer_evaluator():
    eval_result = evaluate_answer(
        question="What is the difference between client-side rendering and server-side rendering?",
        user_answer="Server-side rendering renders HTML on the server improving SEO and initial page load, whereas client-side rendering executes JavaScript in the browser for rich interactivity.",
        category="Technical",
        expected_keywords=["seo", "initial load time", "hydration", "next.js", "react"]
    )
    assert eval_result["technical_score"] > 50
    assert eval_result["overall_score"] > 50
    assert len(eval_result["strengths"]) > 0

def test_speech_metrics():
    sample_speech = "Um basically, I would uh use Redis for caching to speed up like slow database queries."
    metrics = analyze_speech_metrics(sample_speech, duration_seconds=15.0)
    assert metrics["filler_words_count"] >= 2
    assert metrics["wpm"] > 0
