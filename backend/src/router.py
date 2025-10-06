from fastapi import APIRouter
from src.users import router as users_router

# Create router for general endpoints
router = APIRouter()

# Include domain routers
router.include_router(users_router)

# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "FareShare API"}


# Root endpoint
@router.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to FareShare API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
