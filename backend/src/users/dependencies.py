from fastapi import Depends
from sqlalchemy.orm import Session
from src.models.base import get_db
from src.users.repository import UserRepository
from src.users.service import UserService


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """Dependency to get UserService with injected repository"""
    user_repository = UserRepository(db)
    return UserService(user_repository)
