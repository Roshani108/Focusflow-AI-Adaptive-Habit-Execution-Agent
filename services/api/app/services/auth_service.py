from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.schemas.user import UserResponse
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    hash_token,
)
from app.config import settings


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def register(self, req: RegisterRequest) -> Tuple[User, TokenResponse]:
        existing = self.user_repo.get_by_email(req.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email address already exists.",
            )

        user = User(
            email=req.email.lower(),
            hashed_password=hash_password(req.password),
            full_name=req.full_name,
            daily_capacity_hours=req.daily_capacity_hours or 3.0,
            preferred_days=req.preferred_days or "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
            current_skill_level=req.current_skill_level or "Intermediate",
            is_active=True,
        )
        created_user = self.user_repo.create(user)
        token_resp = self._issue_tokens(created_user)
        return created_user, token_resp

    def login(self, req: LoginRequest) -> Tuple[User, TokenResponse]:
        user = self.user_repo.get_by_email(req.email)
        if not user or not verify_password(req.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated.",
            )

        token_resp = self._issue_tokens(user)
        return user, token_resp

    def refresh_access_token(self, raw_refresh_token: str) -> TokenResponse:
        token_hash = hash_token(raw_refresh_token)
        token_record = self.user_repo.get_refresh_token(token_hash)
        if not token_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token.",
            )

        user = self.user_repo.get(token_record.user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

        # Revoke old refresh token (token rotation pattern)
        self.user_repo.revoke_refresh_token(token_hash)
        return self._issue_tokens(user)

    def logout(self, raw_refresh_token: str) -> None:
        token_hash = hash_token(raw_refresh_token)
        self.user_repo.revoke_refresh_token(token_hash)

    def _issue_tokens(self, user: User) -> TokenResponse:
        access_token = create_access_token(subject=user.id)
        raw_refresh = create_refresh_token()
        refresh_hash = hash_token(raw_refresh)
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        self.user_repo.store_refresh_token(user.id, refresh_hash, expires_at)

        return TokenResponse(
            access_token=access_token,
            refresh_token=raw_refresh,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
