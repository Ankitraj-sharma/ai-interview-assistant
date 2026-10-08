from fastapi import APIRouter, Depends
from app.schemas.dashboard import DashboardStatsResponse
from app.database.supabase_client import db_get_user_sessions
from app.services.recommendation_engine import build_dashboard_summary
from app.utils.security import get_current_user_optional

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(current_user: dict = Depends(get_current_user_optional)):
    user_id = current_user.get("id") if current_user else "guest-user"
    user_name = current_user.get("full_name", "Candidate") if current_user else "Candidate"
    target_role = current_user.get("target_role", "Software Engineer") if current_user else "Software Engineer"

    sessions = db_get_user_sessions(user_id)
    summary = build_dashboard_summary(sessions, user_name, target_role)

    return DashboardStatsResponse(**summary)
