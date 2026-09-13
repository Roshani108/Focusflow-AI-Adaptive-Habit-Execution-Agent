from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.task_service import TaskService
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskStatusUpdate,
    TaskResponse,
    TaskBatchUpdateItem,
)
from app.schemas.common import APIResponse, PaginatedResponse, PaginatedMeta

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=APIResponse[PaginatedResponse[TaskResponse]])
def get_tasks(
    goal_id: Optional[int] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = None,
    scheduled_date: Optional[date] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task_service = TaskService(db)
    skip = (page - 1) * page_size
    tasks, total = task_service.task_repo.get_tasks_filtered(
        user_id=current_user.id,
        goal_id=goal_id,
        status=status_filter,
        priority=priority,
        scheduled_date=scheduled_date,
        skip=skip,
        limit=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    items = [TaskResponse.model_validate(t) for t in tasks]
    paginated = PaginatedResponse(
        items=items,
        meta=PaginatedMeta(total=total, page=page, page_size=page_size, total_pages=total_pages),
    )
    return APIResponse(success=True, data=paginated)


@router.post("", response_model=APIResponse[TaskResponse], status_code=status.HTTP_201_CREATED)
def create_task(
    req: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task_service = TaskService(db)
    task = task_service.create_task(current_user.id, req)
    return APIResponse(
        success=True,
        data=TaskResponse.model_validate(task),
        message="Task created successfully.",
    )


@router.get("/{task_id}", response_model=APIResponse[TaskResponse])
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task_service = TaskService(db)
    task = task_service.get_task(task_id, current_user.id)
    return APIResponse(success=True, data=TaskResponse.model_validate(task))


@router.put("/{task_id}", response_model=APIResponse[TaskResponse])
def update_task(
    task_id: int,
    req: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task_service = TaskService(db)
    task = task_service.update_task(task_id, current_user.id, req)
    return APIResponse(
        success=True,
        data=TaskResponse.model_validate(task),
        message="Task updated.",
    )


@router.delete("/{task_id}", response_model=APIResponse[None])
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task_service = TaskService(db)
    task_service.delete_task(task_id, current_user.id)
    return APIResponse(success=True, data=None, message="Task deleted.")


@router.patch("/{task_id}/complete", response_model=APIResponse[TaskResponse])
def complete_task(
    task_id: int,
    actual_minutes: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task_service = TaskService(db)
    req = TaskStatusUpdate(status="COMPLETED", actual_minutes=actual_minutes)
    task = task_service.update_task_status(task_id, current_user.id, req)
    return APIResponse(
        success=True,
        data=TaskResponse.model_validate(task),
        message="Task marked as completed!",
    )


@router.patch("/{task_id}/status", response_model=APIResponse[TaskResponse])
def update_status(
    task_id: int,
    req: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task_service = TaskService(db)
    task = task_service.update_task_status(task_id, current_user.id, req)
    return APIResponse(success=True, data=TaskResponse.model_validate(task))


@router.post("/batch-update", response_model=APIResponse[List[TaskResponse]])
def batch_update_tasks(
    items: List[TaskBatchUpdateItem],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task_service = TaskService(db)
    updated = task_service.batch_update(current_user.id, items)
    return APIResponse(
        success=True,
        data=[TaskResponse.model_validate(t) for t in updated],
        message="Batch update applied.",
    )
