from app.schemas.common import APIResponse, APIErrorDetail, PaginatedResponse, PaginatedMeta
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshTokenRequest
from app.schemas.user import UserBase, UserUpdate, UserResponse
from app.schemas.goal import GoalBase, GoalCreate, GoalUpdate, GoalResponse, GoalDetailResponse
from app.schemas.milestone import MilestoneBase, MilestoneCreate, MilestoneUpdate, MilestoneResponse
from app.schemas.task import TaskBase, TaskCreate, TaskUpdate, TaskStatusUpdate, TaskResponse, TaskBatchUpdateItem
from app.schemas.ai_plan import (
    PlanTaskItem,
    PlanMilestoneItem,
    StructuredPlan,
    AIPlanGenerateRequest,
    AIPlanResponse,
    AIPlanApproveRequest,
    AIReplanResponse,
    RescheduledTaskItem,
)
from app.schemas.schedule import ScheduleCreate, ScheduleResponse, DayScheduleGroup
from app.schemas.dashboard import DashboardSummaryResponse, WeeklyProgressPoint
from app.schemas.analytics import AnalyticsResponse, DailyCompletionMetric, GoalProgressMetric, WorkloadDistribution
from app.schemas.notification import NotificationBase, NotificationCreate, NotificationResponse

__all__ = [
    "APIResponse",
    "APIErrorDetail",
    "PaginatedResponse",
    "PaginatedMeta",
    "RegisterRequest",
    "LoginRequest",
    "TokenResponse",
    "RefreshTokenRequest",
    "UserBase",
    "UserUpdate",
    "UserResponse",
    "GoalBase",
    "GoalCreate",
    "GoalUpdate",
    "GoalResponse",
    "GoalDetailResponse",
    "MilestoneBase",
    "MilestoneCreate",
    "MilestoneUpdate",
    "MilestoneResponse",
    "TaskBase",
    "TaskCreate",
    "TaskUpdate",
    "TaskStatusUpdate",
    "TaskResponse",
    "TaskBatchUpdateItem",
    "PlanTaskItem",
    "PlanMilestoneItem",
    "StructuredPlan",
    "AIPlanGenerateRequest",
    "AIPlanResponse",
    "AIPlanApproveRequest",
    "AIReplanResponse",
    "RescheduledTaskItem",
    "ScheduleCreate",
    "ScheduleResponse",
    "DayScheduleGroup",
    "DashboardSummaryResponse",
    "WeeklyProgressPoint",
    "AnalyticsResponse",
    "DailyCompletionMetric",
    "GoalProgressMetric",
    "WorkloadDistribution",
    "NotificationBase",
    "NotificationCreate",
    "NotificationResponse",
]
