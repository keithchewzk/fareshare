"""
JWT Token Utilities

This module provides JWT token creation and validation functionality.
Handles token generation, verification, and user data extraction.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict

import jwt
from fastapi import HTTPException, status
from src.settings import settings


class JWTTokenError(HTTPException):
    """Custom exception for JWT token errors"""

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


def create_access_token(user_id: int, email: str) -> str:
    """
    Create a JWT access token for a user.

    Includes standard JWT claims (sub, exp, iat) plus user_id and email.
    Token expires after jwt_expire_minutes from settings.

    Args:
        user_id: User's database ID
        email: User's email address

    Returns:
        Encoded JWT token string
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)

    payload = {
        "sub": str(user_id),
        "email": email,
        "user_id": user_id,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }

    token = jwt.encode(
        payload=payload, key=settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )

    return token


def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify and decode a JWT token

    Args:
        token: JWT token string to verify

    Returns:
        Decoded token payload as dictionary

    Raises:
        JWTTokenError: If token is invalid, expired, or malformed
    """
    try:
        payload = jwt.decode(
            jwt=token, key=settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise JWTTokenError("Token has expired")

    except jwt.InvalidTokenError:
        raise JWTTokenError("Invalid token")

    except Exception as e:
        raise JWTTokenError(f"Token validation failed: {str(e)}")


def get_user_id_from_token(token: str) -> int:
    """
    Extract user ID from a valid JWT token

    Args:
        token: JWT token string

    Returns:
        User ID as integer

    Raises:
        JWTTokenError: If token is invalid or missing user_id
    """
    payload = verify_token(token)

    user_id = payload.get("user_id")
    if not user_id:
        raise JWTTokenError("Token missing user information")

    return int(user_id)


def get_user_email_from_token(token: str) -> str:
    """
    Extract user email from a valid JWT token

    Args:
        token: JWT token string

    Returns:
        User email as string

    Raises:
        JWTTokenError: If token is invalid or missing email
    """
    payload = verify_token(token)

    email = payload.get("email")
    if not email:
        raise JWTTokenError("Token missing user email")

    return email