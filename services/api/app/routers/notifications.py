from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.repositories.notification_repo import NotificationRepository
from app.schemas.notification import NotificationResponse
from app.schemas.common import APIResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=APIResponse[List[NotificationResponse]])
def get_notifications(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = NotificationRepository(db)
    items = repo.get_user_notifications(current_user.id, limit=limit)
    return APIResponse(
        success=True,
        data=[NotificationResponse.model_validate(n) for n in items],
    )


@router.get("/unread-count", response_model=APIResponse[int])
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = NotificationRepository(db)
    count = repo.get_unread_count(current_user.id)
    return APIResponse(success=True, data=count)


@router.patch("/{notification_id}/read", response_model=APIResponse[NotificationResponse])
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = NotificationRepository(db)
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return APIResponse(success=True, data=NotificationResponse.model_validate(notif))


@router.post("/mark-all-read", response_model=APIResponse[None])
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = NotificationRepository(db)
    repo.mark_all_as_read(current_user.id)
    return APIResponse(success=True, data=None, message="All notifications marked as read.")
