from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class CreateUser(BaseModel):
    """Schema for creating a new user"""

    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(
        ..., min_length=6, description="User's password (min 6 characters)"
    )
    first_name: str = Field(..., max_length=50, description="User's first name")
    last_name: Optional[str] = Field(
        None, max_length=50, description="User's last name"
    )


class User(BaseModel):
    """Schema for user response (without password)"""

    id: int
    email: str
    first_name: str
    last_name: Optional[str] = None

    class Config:
        from_attributes = True  # For SQLAlchemy model compatibility


class LoginRequest(BaseModel):
    """Schema for user login request"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=1, description="User's password")


class LoginResponse(BaseModel):
    """Schema for successful login response"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user_id: int = Field(..., description="User's database ID")
    email: str = Field(..., description="User's email address")


class UserProfile(BaseModel):
    """Schema for user profile information"""
    id: int = Field(..., description="User's database ID")
    email: str = Field(..., description="User's email address")
    first_name: str | None = Field(None, description="User's first name")
    last_name: str | None = Field(None, description="User's last name")

    class Config:
        from_attributes = True
