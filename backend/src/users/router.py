from fastapi import APIRouter, Depends, status
from src.users.dependencies import get_user_service, get_current_user
from src.users.models import User as UserModel
from src.users.schemas import CreateUser, User, LoginRequest, LoginResponse, UserProfile
from src.users.service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("", response_model=User, status_code=201)
async def create_user(
    user_data: CreateUser, user_service: UserService = Depends(get_user_service)
):
    """Create a new user account"""
    return user_service.create_user(user_data)


@router.post("/login", response_model=LoginResponse, status_code=200)
async def login_user(
    login_data: LoginRequest, user_service: UserService = Depends(get_user_service)
):
    """User login - authenticate and get JWT token"""
    return user_service.login(login_data.email, login_data.password)


@router.get("/me", response_model=UserProfile, status_code=200)
async def get_current_user_profile(
    current_user: UserModel = Depends(get_current_user)
):
    """Get the current authenticated user's profile information"""
    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name
    )
