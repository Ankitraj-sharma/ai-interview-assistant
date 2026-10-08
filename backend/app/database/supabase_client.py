import logging
from typing import Optional, Dict, Any, List
from app.config import settings
from app.database.mock_store import mock_store

logger = logging.getLogger(__name__)

supabase_client = None

def get_supabase():
    global supabase_client
    if supabase_client is not None:
        return supabase_client

    if settings.SUPABASE_URL and settings.SUPABASE_KEY and "your-project" not in settings.SUPABASE_URL:
        try:
            from supabase import create_client
            supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            logger.info("Connected to Supabase PostgreSQL database successfully.")
            return supabase_client
        except Exception as e:
            logger.warning(f"Failed to initialize Supabase client: {e}. Falling back to in-memory store.")
            return None
    return None

def is_supabase_enabled() -> bool:
    return get_supabase() is not None

# Unified DB Access Methods with automatic fallback
def db_save_profile(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    client = get_supabase()
    if client:
        try:
            res = client.table("profiles").upsert(profile_data).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase save_profile error: {e}")
    return mock_store.save_profile(profile_data)

def db_get_profile_by_email(email: str) -> Optional[Dict[str, Any]]:
    client = get_supabase()
    if client:
        try:
            res = client.table("profiles").select("*").eq("email", email).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase get_profile_by_email error: {e}")
    return mock_store.get_profile_by_email(email)

def db_get_profile_by_id(profile_id: str) -> Optional[Dict[str, Any]]:
    client = get_supabase()
    if client:
        try:
            res = client.table("profiles").select("*").eq("id", profile_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase get_profile_by_id error: {e}")
    return mock_store.get_profile_by_id(profile_id)

def db_save_resume(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    client = get_supabase()
    if client:
        try:
            res = client.table("resumes").insert(resume_data).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase save_resume error: {e}")
    return mock_store.save_resume(resume_data)

def db_get_resume(resume_id: str) -> Optional[Dict[str, Any]]:
    client = get_supabase()
    if client:
        try:
            res = client.table("resumes").select("*").eq("id", resume_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase get_resume error: {e}")
    return mock_store.get_resume(resume_id)

def db_save_job(job_data: Dict[str, Any]) -> Dict[str, Any]:
    client = get_supabase()
    if client:
        try:
            res = client.table("job_descriptions").insert(job_data).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase save_job error: {e}")
    return mock_store.save_job(job_data)

def db_save_match(match_data: Dict[str, Any]) -> Dict[str, Any]:
    client = get_supabase()
    if client:
        try:
            res = client.table("skill_matches").insert(match_data).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase save_match error: {e}")
    return mock_store.save_match(match_data)

def db_get_match(match_id: str) -> Optional[Dict[str, Any]]:
    client = get_supabase()
    if client:
        try:
            res = client.table("skill_matches").select("*").eq("id", match_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase get_match error: {e}")
    return mock_store.get_match(match_id)

def db_save_session(session_data: Dict[str, Any]) -> Dict[str, Any]:
    client = get_supabase()
    if client:
        try:
            res = client.table("interview_sessions").insert(session_data).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase save_session error: {e}")
    return mock_store.save_session(session_data)

def db_update_session(session_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    client = get_supabase()
    if client:
        try:
            res = client.table("interview_sessions").update(updates).eq("id", session_id).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase update_session error: {e}")
    return mock_store.update_session(session_id, updates)

def db_get_session(session_id: str) -> Optional[Dict[str, Any]]:
    client = get_supabase()
    if client:
        try:
            res = client.table("interview_sessions").select("*").eq("id", session_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase get_session error: {e}")
    return mock_store.get_session(session_id)

def db_save_questions(session_id: str, questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    client = get_supabase()
    if client:
        try:
            formatted = []
            for q in questions:
                q_copy = dict(q)
                q_copy["session_id"] = session_id
                formatted.append(q_copy)
            res = client.table("interview_questions").insert(formatted).execute()
            if res.data:
                return res.data
        except Exception as e:
            logger.error(f"Supabase save_questions error: {e}")
    return mock_store.save_questions(session_id, questions)

def db_get_questions(session_id: str) -> List[Dict[str, Any]]:
    client = get_supabase()
    if client:
        try:
            res = client.table("interview_questions").select("*").eq("session_id", session_id).order("question_order").execute()
            if res.data:
                return res.data
        except Exception as e:
            logger.error(f"Supabase get_questions error: {e}")
    return mock_store.get_questions(session_id)

def db_save_answer(answer_data: Dict[str, Any]) -> Dict[str, Any]:
    client = get_supabase()
    if client:
        try:
            res = client.table("interview_answers").insert(answer_data).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase save_answer error: {e}")
    return mock_store.save_answer(answer_data)

def db_get_answers(session_id: str) -> List[Dict[str, Any]]:
    client = get_supabase()
    if client:
        try:
            res = client.table("interview_answers").select("*").eq("session_id", session_id).execute()
            if res.data:
                return res.data
        except Exception as e:
            logger.error(f"Supabase get_answers error: {e}")
    return mock_store.get_answers(session_id)

def db_get_user_sessions(user_id: str) -> List[Dict[str, Any]]:
    client = get_supabase()
    if client:
        try:
            res = client.table("interview_sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            if res.data:
                return res.data
        except Exception as e:
            logger.error(f"Supabase get_user_sessions error: {e}")
    return mock_store.get_user_sessions(user_id)
