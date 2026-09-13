from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.analytics_service import AnalyticsService
from app.schemas.dashboard import DashboardSummaryResponse
from app.schemas.common import APIResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=APIResponse[DashboardSummaryResponse])
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AnalyticsService(db)
    summary = service.get_dashboard_summary(current_user.id)
    return APIResponse(success=True, data=summary)
