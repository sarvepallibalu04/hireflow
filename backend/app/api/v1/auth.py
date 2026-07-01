from fastapi import APIRouter, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from app.models import User, Base
from app.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from app.services.auth import (
    hash_password,
    verify_password,
    create_access_token,
)
import os

router = APIRouter(prefix="/auth", tags=["auth"])

# Temporary in-memory database for testing
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///:memory:")

# For demo purposes, we'll use an in-memory dict to store users
users_db = {}

@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate):
    """Register a new user."""
    
    # Check if user exists
    if user_data.email in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_id = str(len(users_db) + 1)
    hashed_password = hash_password(user_data.password)
    
    user = {
        "id": user_id,
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "email": user_data.email,
        "password_hash": hashed_password,
        "is_active": True,
        "created_at": None,
    }
    
    users_db[user_data.email] = user
    
    # Create token
    token = create_access_token(data={"sub": user_data.email})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user)
    )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login a user."""
    
    # Find user
    user = users_db.get(credentials.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create token
    token = create_access_token(data={"sub": credentials.email})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str = None):
    """Get current user profile."""
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # TODO: Verify token and return user
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token"
    )