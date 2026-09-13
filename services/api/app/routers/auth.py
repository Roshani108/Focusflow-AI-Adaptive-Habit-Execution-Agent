from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.auth_service import AuthService
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshTokenRequest
from app.schemas.user import UserResponse
from app.schemas.common import APIResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=APIResponse[TokenResponse], status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user, tokens = auth_service.register(req)
    return APIResponse(
        success=True,
        data=tokens,
        message="User registered successfully.",
    )


@router.post("/login", response_model=APIResponse[TokenResponse])
def login(req: LoginRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user, tokens = auth_service.login(req)
    return APIResponse(
        success=True,
        data=tokens,
        message="Login successful.",
    )


@router.post("/refresh", response_model=APIResponse[TokenResponse])
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    tokens = auth_service.refresh_access_token(req.refresh_token)
    return APIResponse(
        success=True,
        data=tokens,
        message="Token refreshed successfully.",
    )


@router.post("/logout", response_model=APIResponse[None])
def logout(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    auth_service.logout(req.refresh_token)
    return APIResponse(
        success=True,
        data=None,
        message="Logged out successfully.",
    )


@router.get("/me", response_model=APIResponse[UserResponse])
def get_me(current_user: User = Depends(get_current_user)):
    return APIResponse(
        success=True,
        data=UserResponse.model_validate(current_user),
    )
