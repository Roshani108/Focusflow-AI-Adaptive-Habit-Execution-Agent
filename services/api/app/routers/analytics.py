from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import AnalyticsResponse
from app.schemas.common import APIResponse

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("", response_model=APIResponse[AnalyticsResponse])
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AnalyticsService(db)
    analytics = service.get_analytics(current_user.id)
    return APIResponse(success=True, data=analytics)
