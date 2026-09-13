from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    avatar_url: Optional[str] = None
    timezone: str = "UTC"
    daily_capacity_hours: float = 3.0
    preferred_days: str = "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"
    current_skill_level: str = "Intermediate"


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = None
    daily_capacity_hours: Optional[float] = None
    preferred_days: Optional[str] = None
    current_skill_level: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
