"""
Authentication API Router

Defines authentication endpoints for login, logout, and user profile access.
"""

from fastapi import APIRouter, Depends, status

from src.auth.dependencies import get_auth_service, get_current_user
from src.auth.schemas import LoginRequest, LoginResponse, UserProfile
from src.auth.service import AuthService
from src.users.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login",
    description="Authenticate user with email and password, returns JWT access token"
)
async def login(
    login_data: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
) -> LoginResponse:
    """
    User login endpoint.

    Validates credentials and returns JWT token for authenticated requests.
    """
    return auth_service.login(login_data)


@router.get(
    "/me",
    response_model=UserProfile,
    status_code=status.HTTP_200_OK,
    summary="Get Current User",
    description="Get the current authenticated user's profile information"
)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
) -> UserProfile:
    """
    Get current user profile endpoint.

    Returns the authenticated user's profile information.
    Requires valid JWT token in Authorization header.
    """
    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name
    )