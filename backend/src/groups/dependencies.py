from fastapi import Depends
from sqlalchemy.orm import Session
from src.groups.repository import GroupRepository
from src.groups.service import GroupService
from src.models.base import get_db


def get_group_service(db: Session = Depends(get_db)) -> GroupService:
    """Dependency to get GroupService with injected repository"""
    group_repository = GroupRepository(db)
    return GroupService(group_repository)
