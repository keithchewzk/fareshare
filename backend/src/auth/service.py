"""
Authentication Service

Handles authentication business logic including login verification
and token generation.
"""

from fastapi import HTTPException, status

from src.auth.jwt_utils import create_access_token
from src.auth.schemas import LoginRequest, LoginResponse
from src.users.repository import UserRepository
from src.users.service import UserService


class AuthService:
    """Service layer for authentication business logic"""

    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def login(self, login_data: LoginRequest) -> LoginResponse:
        """
        Authenticate user and return JWT token.

        Validates email exists, verifies password with bcrypt, and generates
        JWT token on success. Returns same error message for both invalid
        email and password to prevent user enumeration attacks.

        Args:
            login_data: Login credentials (email and password)

        Returns:
            LoginResponse with JWT token and user info

        Raises:
            HTTPException: If credentials are invalid
        """
        user = self.user_repository.get_by_email(login_data.email)

        if not user or not UserService.verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        access_token = create_access_token(
            user_id=user.id,
            email=user.email
        )

        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user.id,
            email=user.email
        )