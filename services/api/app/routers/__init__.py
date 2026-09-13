from app.routers.auth import router as auth_router
from app.routers.goals import router as goals_router
from app.routers.tasks import router as tasks_router
from app.routers.schedules import router as schedules_router
from app.routers.dashboard import router as dashboard_router
from app.routers.analytics import router as analytics_router
from app.routers.notifications import router as notifications_router

__all__ = [
    "auth_router",
    "goals_router",
    "tasks_router",
    "schedules_router",
    "dashboard_router",
    "analytics_router",
    "notifications_router",
]
