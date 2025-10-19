from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from src.users.jwt_utils import JWTTokenError, get_user_id_from_token
from src.models.base import get_db
from src.users.models import User
from src.users.repository import UserRepository
from src.users.service import UserService

security = HTTPBearer()


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """Dependency to get UserService with injected repository"""
    user_repository = UserRepository(db)
    return UserService(user_repository)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Extract and validate JWT token from Authorization header, return current user.

    This dependency can be used on any protected endpoint to require authentication.
    Automatically extracts "Bearer <token>" from Authorization header, validates the
    JWT token, and returns the corresponding User object.

    Args:
        credentials: HTTP Bearer token from Authorization header
        db: Database session from dependency injection

    Returns:
        User object for the authenticated user

    Raises:
        HTTPException: 401 if token is invalid, expired, or user not found

    Example:
        @router.get("/protected")
        async def protected_endpoint(current_user: User = Depends(get_current_user)):
            return {"user_id": current_user.id}
    """
    try:
        user_id = get_user_id_from_token(credentials.credentials)

        user_repository = UserRepository(db)
        user = user_repository.get_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user

    except JWTTokenError as e:
        raise e
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
