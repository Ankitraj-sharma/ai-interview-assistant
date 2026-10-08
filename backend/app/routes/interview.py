import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.interview import (
    StartInterviewRequest,
    StartInterviewResponse,
    InterviewQuestionSchema,
    SubmitAnswerRequest,
    EvaluationResponse,
    FinishInterviewResponse
)
from app.services.question_generator import (
    generate_interview_questions,
    generate_followup_question
)
from app.services.answer_evaluator import evaluate_answer
from app.services.recommendation_engine import generate_recommendations
from app.database.supabase_client import (
    db_save_session,
    db_update_session,
    db_get_session,
    db_save_questions,
    db_get_questions,
    db_save_answer,
    db_get_answers,
    db_get_resume
)
from app.utils.security import get_current_user_optional

router = APIRouter(prefix="/interview", tags=["Mock Interview"])

@router.post("/start", response_model=StartInterviewResponse)
def start_interview(
    req: StartInterviewRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    session_id = str(uuid.uuid4())
    user_id = current_user.get("id") if current_user else None

    resume_skills = []
    if req.resume_id:
        res = db_get_resume(req.resume_id)
        if res:
            resume_skills = res.get("extracted_skills", [])

    # Generate or retrieve questions
    raw_questions = generate_interview_questions(
        role=req.role,
        difficulty=req.difficulty,
        num_questions=req.num_questions,
        resume_skills=resume_skills,
        missing_skills=req.missing_skills
    )

    formatted_questions = []
    for i, q in enumerate(raw_questions):
        q_id = str(uuid.uuid4())
        formatted_questions.append({
            "id": q_id,
            "session_id": session_id,
            "question_order": i + 1,
            "question_text": q.get("question", ""),
            "category": q.get("category", "Technical"),
            "difficulty": q.get("difficulty", req.difficulty),
            "expected_keywords": q.get("expected_keywords", [])
        })

    # Save to database
    session_data = {
        "id": session_id,
        "user_id": user_id,
        "role": req.role,
        "difficulty": req.difficulty,
        "num_questions": len(formatted_questions),
        "status": "in_progress",
        "created_at": datetime.utcnow().isoformat()
    }
    db_save_session(session_data)
    db_save_questions(session_id, formatted_questions)

    response_questions = [
        InterviewQuestionSchema(**q) for q in formatted_questions
    ]

    return StartInterviewResponse(
        session_id=session_id,
        role=req.role,
        difficulty=req.difficulty,
        total_questions=len(response_questions),
        questions=response_questions
    )

@router.post("/answer", response_model=EvaluationResponse)
def submit_answer(req: SubmitAnswerRequest):
    session = db_get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    questions = db_get_questions(req.session_id)
    target_q = next((q for q in questions if q.get("id") == req.question_id), None)
    if not target_q:
        raise HTTPException(status_code=404, detail="Question not found in this session")

    # Evaluate answer
    eval_result = evaluate_answer(
        question=target_q.get("question_text", ""),
        user_answer=req.user_answer,
        category=target_q.get("category", "Technical"),
        expected_keywords=target_q.get("expected_keywords", [])
    )

    # Generate follow-up question
    follow_up = generate_followup_question(
        original_question=target_q.get("question_text", ""),
        user_answer=req.user_answer,
        role=session.get("role", "Software Engineer")
    )

    answer_id = str(uuid.uuid4())
    answer_record = {
        "id": answer_id,
        "session_id": req.session_id,
        "question_id": req.question_id,
        "user_answer": req.user_answer,
        "audio_url": req.audio_url,
        "technical_score": eval_result["technical_score"],
        "communication_score": eval_result["communication_score"],
        "relevance_score": eval_result["relevance_score"],
        "completeness_score": eval_result["completeness_score"],
        "overall_score": eval_result["overall_score"],
        "feedback": eval_result["feedback"],
        "strengths": eval_result["strengths"],
        "weaknesses": eval_result["weaknesses"],
        "follow_up_question": follow_up,
        "speaking_metrics": req.speaking_metrics or {}
    }
    db_save_answer(answer_record)

    return EvaluationResponse(
        answer_id=answer_id,
        overall_score=eval_result["overall_score"],
        technical_score=eval_result["technical_score"],
        communication_score=eval_result["communication_score"],
        relevance_score=eval_result["relevance_score"],
        completeness_score=eval_result["completeness_score"],
        strengths=eval_result["strengths"],
        weaknesses=eval_result["weaknesses"],
        feedback=eval_result["feedback"],
        suggested_model_answer=eval_result.get("suggested_model_answer"),
        follow_up_question=follow_up
    )

@router.post("/finish", response_model=FinishInterviewResponse)
def finish_interview(session_id: str):
    session = db_get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    answers = db_get_answers(session_id)
    if not answers:
        raise HTTPException(status_code=400, detail="No answers submitted yet")

    # Compute averages
    count = len(answers)
    avg_tech = round(sum(a.get("technical_score", 0.0) for a in answers) / count, 1)
    avg_comm = round(sum(a.get("communication_score", 0.0) for a in answers) / count, 1)
    avg_rel = round(sum(a.get("relevance_score", 0.0) for a in answers) / count, 1)
    avg_comp = round(sum(a.get("completeness_score", 0.0) for a in answers) / count, 1)
    avg_overall = round(sum(a.get("overall_score", 0.0) for a in answers) / count, 1)

    # Collect weak areas
    weak_areas = []
    for a in answers:
        for w in a.get("weaknesses", []):
            if w not in weak_areas:
                weak_areas.append(w)
    weak_areas = weak_areas[:4]

    recommendations = generate_recommendations(weak_areas, avg_overall)

    summary_feedback = (
        f"You completed the mock interview for {session.get('role')} with an overall score of {avg_overall}%. "
        f"Technical depth scored {avg_tech}%, communication clarity scored {avg_comm}%. "
        f"Review the identified weak areas and model answers to maximize interview performance."
    )

    completed_at = datetime.utcnow().isoformat()
    db_update_session(session_id, {
        "status": "completed",
        "overall_score": avg_overall,
        "technical_score": avg_tech,
        "communication_score": avg_comm,
        "relevance_score": avg_rel,
        "completeness_score": avg_comp,
        "summary_feedback": summary_feedback,
        "weak_areas": weak_areas,
        "recommendations": recommendations,
        "completed_at": completed_at
    })

    return FinishInterviewResponse(
        session_id=session_id,
        overall_score=avg_overall,
        technical_score=avg_tech,
        communication_score=avg_comm,
        relevance_score=avg_rel,
        completeness_score=avg_comp,
        summary_feedback=summary_feedback,
        weak_areas=weak_areas,
        recommendations=recommendations,
        completed_at=completed_at
    )

@router.get("/{session_id}/result")
def get_interview_result(session_id: str):
    session = db_get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    questions = db_get_questions(session_id)
    answers = db_get_answers(session_id)

    # Combine questions and their corresponding answers
    qa_list = []
    for q in questions:
        ans = next((a for a in answers if a.get("question_id") == q.get("id")), None)
        qa_list.append({
            "question": q,
            "answer": ans
        })

    return {
        "session": session,
        "qa_details": qa_list
    }
