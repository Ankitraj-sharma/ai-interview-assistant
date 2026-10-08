import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional

class MockStore:
    """
    In-memory fallback data store used when Supabase credentials are not yet configured.
    Ensures zero crashes and smooth evaluation locally and in automated test suites.
    """
    def __init__(self):
        self.profiles: Dict[str, Dict[str, Any]] = {}
        self.resumes: Dict[str, Dict[str, Any]] = {}
        self.jobs: Dict[str, Dict[str, Any]] = {}
        self.matches: Dict[str, Dict[str, Any]] = {}
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.questions: Dict[str, List[Dict[str, Any]]] = {}
        self.answers: Dict[str, List[Dict[str, Any]]] = {}

    def save_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        profile_id = profile_data.get("id") or str(uuid.uuid4())
        profile_data["id"] = profile_id
        profile_data["created_at"] = profile_data.get("created_at") or datetime.utcnow().isoformat()
        self.profiles[profile_id] = profile_data
        return profile_data

    def get_profile_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        for p in self.profiles.values():
            if p.get("email") == email:
                return p
        return None

    def get_profile_by_id(self, profile_id: str) -> Optional[Dict[str, Any]]:
        return self.profiles.get(profile_id)

    def save_resume(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        resume_id = resume_data.get("id") or str(uuid.uuid4())
        resume_data["id"] = resume_id
        resume_data["created_at"] = datetime.utcnow().isoformat()
        self.resumes[resume_id] = resume_data
        return resume_data

    def get_resume(self, resume_id: str) -> Optional[Dict[str, Any]]:
        return self.resumes.get(resume_id)

    def get_user_resumes(self, user_id: str) -> List[Dict[str, Any]]:
        return [r for r in self.resumes.values() if r.get("user_id") == user_id]

    def save_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        job_id = job_data.get("id") or str(uuid.uuid4())
        job_data["id"] = job_id
        job_data["created_at"] = datetime.utcnow().isoformat()
        self.jobs[job_id] = job_data
        return job_data

    def save_match(self, match_data: Dict[str, Any]) -> Dict[str, Any]:
        match_id = match_data.get("id") or str(uuid.uuid4())
        match_data["id"] = match_id
        match_data["created_at"] = datetime.utcnow().isoformat()
        self.matches[match_id] = match_data
        return match_data

    def get_match(self, match_id: str) -> Optional[Dict[str, Any]]:
        return self.matches.get(match_id)

    def save_session(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        session_id = session_data.get("id") or str(uuid.uuid4())
        session_data["id"] = session_id
        session_data["created_at"] = datetime.utcnow().isoformat()
        self.sessions[session_id] = session_data
        return session_data

    def update_session(self, session_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if session_id in self.sessions:
            self.sessions[session_id].update(updates)
            return self.sessions[session_id]
        return None

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        return self.sessions.get(session_id)

    def save_questions(self, session_id: str, questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        for q in questions:
            if not q.get("id"):
                q["id"] = str(uuid.uuid4())
            q["session_id"] = session_id
        self.questions[session_id] = questions
        return questions

    def get_questions(self, session_id: str) -> List[Dict[str, Any]]:
        return self.questions.get(session_id, [])

    def save_answer(self, answer_data: Dict[str, Any]) -> Dict[str, Any]:
        answer_id = answer_data.get("id") or str(uuid.uuid4())
        answer_data["id"] = answer_id
        answer_data["created_at"] = datetime.utcnow().isoformat()
        session_id = answer_data["session_id"]
        if session_id not in self.answers:
            self.answers[session_id] = []
        self.answers[session_id].append(answer_data)
        return answer_data

    def get_answers(self, session_id: str) -> List[Dict[str, Any]]:
        return self.answers.get(session_id, [])

    def get_user_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        return [s for s in self.sessions.values() if s.get("user_id") == user_id]

mock_store = MockStore()
