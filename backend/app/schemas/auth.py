from typing import Optional
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    target_role: Optional[str] = "Full Stack Developer"
    experience_years: Optional[int] = 1

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    target_role: Optional[str] = "Full Stack Developer"
    experience_years: Optional[int] = 1
    created_at: Optional[str] = None
