from fastapi import APIRouter
from src.groups.router import router as groups_router
from src.users.router import router as users_router

router = APIRouter()

router.include_router(users_router)
router.include_router(groups_router)


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "FareShare API"}


@router.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to FareShare API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
