import hashlib
from typing import List

from fastapi import HTTPException

from src.users.models import User
from src.users.repository import UserRepository
from src.users.schemas import UserCreate


class UserService:
    """Service layer for user business logic"""

    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    @staticmethod
    def hash_password(password: str) -> str:
        """Simple password hashing (for MVP - not production ready)"""
        return hashlib.sha256(password.encode()).hexdigest()

    def create_user(self, user_data: UserCreate) -> User:
        """Create a new user"""
        # Check if user already exists
        existing_user = self.user_repository.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Create new user
        hashed_password = self.hash_password(user_data.password)
        return self.user_repository.create(
            email=user_data.email,
            password_hash=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
        )
