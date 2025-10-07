from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.models.base import get_db

from src.users.repository import UserRepository
from src.users.schemas import UserCreate, UserResponse
from src.users.service import UserService

router = APIRouter(prefix="/users", tags=["users"])


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """Dependency to get UserService with injected repository"""
    user_repository = UserRepository(db)
    return UserService(user_repository)


@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(
    user_data: UserCreate,
    user_service: UserService = Depends(get_user_service)
):
    """Create a new user"""
    return user_service.create_user(user_data)
