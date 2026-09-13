from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.goal import Goal
from app.services.goal_service import GoalService
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse, GoalDetailResponse
from app.schemas.ai_plan import (
    AIPlanGenerateRequest,
    AIPlanResponse,
    AIPlanApproveRequest,
    AIReplanResponse,
)
from app.schemas.common import APIResponse

router = APIRouter(prefix="/goals", tags=["Goals"])


@router.get("", response_model=APIResponse[List[GoalResponse]])
def get_goals(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal_service = GoalService(db)
    raw_goals = goal_service.goal_repo.get_user_goals(current_user.id, status=status_filter)
    results = []
    for item in raw_goals:
        g = item["goal"]
        results.append(
            GoalResponse(
                id=g.id,
                user_id=g.user_id,
                title=g.title,
                description=g.description,
                category=g.category,
                deadline=g.deadline,
                target_hours=g.target_hours,
                status=g.status,
                current_skill=g.current_skill,
                preferred_days=g.preferred_days,
                created_at=g.created_at,
                updated_at=g.updated_at,
                progress_percentage=item["progress_percentage"],
                total_tasks=item["total_tasks"],
                completed_tasks=item["completed_tasks"],
            )
        )
    return APIResponse(success=True, data=results)


@router.post("", response_model=APIResponse[GoalResponse], status_code=status.HTTP_201_CREATED)
def create_goal(
    req: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal_service = GoalService(db)
    goal = goal_service.create_goal(current_user.id, req)
    return APIResponse(
        success=True,
        data=GoalResponse.model_validate(goal),
        message="Goal created successfully.",
    )


@router.get("/{goal_id}", response_model=APIResponse[GoalDetailResponse])
def get_goal_detail(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal_service = GoalService(db)
    goal = goal_service.goal_repo.get_goal_detail(goal_id, current_user.id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")

    # Calculate completion counts
    all_tasks = [t for m in goal.milestones for t in m.tasks]
    total = len(all_tasks)
    completed = sum(1 for t in all_tasks if t.status == "COMPLETED")
    pct = round((completed / total * 100), 1) if total > 0 else 0.0

    resp = GoalDetailResponse.model_validate(goal)
    resp.total_tasks = total
    resp.completed_tasks = completed
    resp.progress_percentage = pct

    return APIResponse(success=True, data=resp)


@router.put("/{goal_id}", response_model=APIResponse[GoalResponse])
def update_goal(
    goal_id: int,
    req: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal_service = GoalService(db)
    goal = goal_service.goal_repo.get_by_id_and_user(goal_id, current_user.id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")

    for k, v in req.model_dump(exclude_unset=True).items():
        setattr(goal, k, v)
    db.commit()
    db.refresh(goal)

    return APIResponse(success=True, data=GoalResponse.model_validate(goal), message="Goal updated.")


@router.delete("/{goal_id}", response_model=APIResponse[None])
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal_service = GoalService(db)
    goal = goal_service.goal_repo.get_by_id_and_user(goal_id, current_user.id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")

    goal_service.goal_repo.delete(goal)
    return APIResponse(success=True, data=None, message="Goal deleted successfully.")


@router.post("/{goal_id}/generate-plan", response_model=APIResponse[AIPlanResponse])
async def generate_goal_plan(
    goal_id: int,
    req: AIPlanGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal_service = GoalService(db)
    plan_resp = await goal_service.generate_ai_plan(current_user.id, goal_id, req)
    return APIResponse(
        success=True,
        data=plan_resp,
        message="AI Plan generated successfully.",
    )


@router.post("/{goal_id}/approve-plan", response_model=APIResponse[GoalDetailResponse])
def approve_goal_plan(
    goal_id: int,
    req: AIPlanApproveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal_service = GoalService(db)
    goal = goal_service.approve_ai_plan(
        user_id=current_user.id,
        goal_id=goal_id,
        plan=req.modified_plan,
        plan_id=req.plan_id,
    )
    return APIResponse(
        success=True,
        data=GoalDetailResponse.model_validate(goal),
        message="AI Plan approved and scheduled.",
    )


@router.post("/{goal_id}/replan", response_model=APIResponse[AIReplanResponse])
async def replan_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal_service = GoalService(db)
    replan_resp = await goal_service.replan_goal(current_user.id, goal_id)
    return APIResponse(
        success=True,
        data=replan_resp,
        message=replan_resp.summary,
    )
