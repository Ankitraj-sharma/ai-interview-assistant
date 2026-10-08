import uuid
from datetime import timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserProfile
from app.database.supabase_client import (
    db_save_profile,
    db_get_profile_by_email,
    db_get_profile_by_id
)
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister):
    existing = db_get_profile_by_email(user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    user_id = str(uuid.uuid4())
    profile_data = {
        "id": user_id,
        "email": user_in.email,
        "password_hash": hash_password(user_in.password),
        "full_name": user_in.full_name,
        "target_role": user_in.target_role or "Full Stack Developer",
        "experience_years": user_in.experience_years or 1
    }

    saved = db_save_profile(profile_data)
    token = create_access_token(
        data={"sub": saved["id"], "email": saved["email"], "name": saved["full_name"]}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": saved["id"],
            "email": saved["email"],
            "full_name": saved["full_name"],
            "target_role": saved["target_role"],
            "experience_years": saved["experience_years"]
        }
    )

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    user = db_get_profile_by_email(credentials.email)

    # Auto-seed demo account if requested and missing in fresh database
    if not user and credentials.email == "ankit.demo@example.com" and credentials.password == "DemoPass123!":
        user_id = str(uuid.uuid4())
        profile_data = {
            "id": user_id,
            "email": credentials.email,
            "password_hash": hash_password(credentials.password),
            "full_name": "Ankit Sharma (Demo)",
            "target_role": "Full Stack Developer",
            "experience_years": 2
        }
        user = db_save_profile(profile_data)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    stored_hash = user.get("password_hash")
    if not stored_hash or not verify_password(credentials.password, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token(
        data={"sub": user["id"], "email": user["email"], "name": user["full_name"]}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "target_role": user.get("target_role", "Full Stack Developer"),
            "experience_years": user.get("experience_years", 1)
        }
    )

@router.get("/me", response_model=UserProfile)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserProfile(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user.get("full_name", "User"),
        target_role=current_user.get("target_role", "Software Engineer"),
        experience_years=current_user.get("experience_years", 1),
        created_at=current_user.get("created_at")
    )
