"""
Authentication Pydantic Schemas

Request and response schemas for authentication endpoints.
Handles data validation and serialization for login/logout operations.
"""

from pydantic import BaseModel, EmailStr, Field


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


class LogoutResponse(BaseModel):
    """Schema for logout response"""
    message: str = Field(default="Successfully logged out", description="Logout confirmation message")