from fastapi import APIRouter, Depends
from src.users.dependencies import get_user_service
from src.users.schemas import UserCreate, UserResponse
from src.users.service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(
    user_data: UserCreate, user_service: UserService = Depends(get_user_service)
):
    """Create a new user"""
    return user_service.create_user(user_data)
