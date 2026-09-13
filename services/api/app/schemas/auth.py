from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    daily_capacity_hours: Optional[float] = 3.0
    preferred_days: Optional[str] = "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"
    current_skill_level: Optional[str] = "Intermediate"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str
