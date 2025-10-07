import hashlib
from typing import List

from fastapi import HTTPException
from sqlalchemy.orm import Session

from .models import User
from .schemas import UserCreate


class UserService:
    """Service layer for user business logic"""

    @staticmethod
    def hash_password(password: str) -> str:
        """Simple password hashing (for MVP - not production ready)"""
        return hashlib.sha256(password.encode()).hexdigest()

    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """Create a new user"""
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Create new user
        hashed_password = UserService.hash_password(user_data.password)
        db_user = User(
            email=user_data.email,
            password_hash=hashed_password,
            full_name=user_data.full_name,
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
