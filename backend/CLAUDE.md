# FareShare Backend - Technical Overview

## Project Overview

FareShare is a collaborative web application for tracking car usage within shared groups. Currently focusing on implementing user authentication and login functionality as the foundation.

**Current Status**: Early development phase focusing on user management and authentication. Currently implementing login functionality with basic user operations. This is an MVP with **unsecured endpoints** designed for initial development and testing.

## Technical Architecture

### Technology Stack
- **Backend**: Python 3.x + FastAPI
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0.23 with Alembic for migrations
- **API Documentation**: Auto-generated via FastAPI (Swagger/OpenAPI)
- **Containerization**: Docker + Docker Compose
- **Development**: Hot reload enabled for development

### Project Structure
```
backend/
├── src/                    # Main application code
│   ├── main.py            # FastAPI application entry point
│   ├── settings.py        # Application configuration
│   ├── router.py          # Main API router
│   ├── models/            # Database models
│   │   └── base.py        # SQLAlchemy base configuration
│   └── users/             # User domain
│       ├── models.py      # User database models
│       ├── schemas.py     # Pydantic schemas for validation
│       ├── router.py      # User API endpoints
│       └── service.py     # User business logic
├── alembic/               # Database migration tools
├── requirements.txt       # Python dependencies
└── Dockerfile            # Container configuration
```

## Database Schema

### Current Implementation

#### Users Table
```sql
users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100)
)
```

### Future Implementation
Additional tables for groups, trips, and related functionality will be added after authentication is complete.

## API Endpoints

### Current Implementation

#### User Management
- `POST /users` - Create a new user
- `GET /users` - Get all users (MVP - no authentication)

#### System
- `GET /` - Root endpoint with API information
- `GET /health` - Health check endpoint

### Planned Implementation

#### Authentication (Next Priority)
- `POST /auth/login` - User login with JWT token
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user profile

#### Future Features
- Group management endpoints
- Trip logging and management endpoints

## Domain-Driven Design

The codebase follows a domain-driven design approach with clear separation of concerns:

- **Models**: SQLAlchemy ORM models for database entities
- **Schemas**: Pydantic models for request/response validation
- **Services**: Business logic layer
- **Routers**: API endpoint definitions
- **Base**: Shared database configuration and utilities

Currently implementing the `users` domain with plans to add additional domains (`groups`, `trips`) after authentication is complete. Each domain will be self-contained with its own models, schemas, services, and routers.

## Key Implementation Details

### Current Features

#### User Management (`src/users/`)
- **User Creation**: Email validation, password hashing (SHA256 - MVP only)
- **User Retrieval**: Get all users endpoint
- **Schema Validation**: Pydantic schemas for request/response validation
- **Database Integration**: SQLAlchemy ORM for user entities

#### Configuration (`src/settings.py`)
- Environment-based configuration using Pydantic BaseSettings
- CORS configuration for frontend integration
- Database URL configuration
- Development/production environment support

#### Database Setup
- Alembic integration for database migrations
- SQLAlchemy 2.0 with declarative base
- PostgreSQL connection with proper session management
- Docker Compose setup for local development database

### Next Priority: Authentication System
- JWT-based user authentication
- Login/logout functionality
- Protected endpoints with user authorization
- Session management

### Future Features
- Group management with invite codes
- Trip logging and tracking
- Google Maps integration for distance calculation
- Cost calculation and payment tracking

## Security Notes

**⚠️ Current MVP Limitations**:
- No authentication/authorization implemented
- All endpoints are public
- Simple SHA256 password hashing (not production-ready)
- No JWT token system
- No user session management

**Planned Security Improvements**:
- JWT-based authentication
- Proper password hashing (bcrypt/scrypt)
- Authorization middleware
- User session management
- Secure API endpoints

## Development Setup

### Local Development
```bash
# Start services
./start.sh

# Access API documentation
http://localhost:8000/docs

# Database access
postgresql://fareshare_user:fareshare_password@localhost:5432/fareshare
```

### Database Migrations
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

## Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `ENVIRONMENT`: development/production
- `CORS_ORIGINS`: Allowed frontend origins

### Docker Configuration
- PostgreSQL 15 with health checks
- Backend with hot reload in development
- Volume mounting for development workflow

## Dependencies

### Core Dependencies
- `fastapi==0.104.1`: Web framework
- `sqlalchemy==2.0.23`: ORM
- `psycopg2-binary==2.9.9`: PostgreSQL adapter
- `alembic==1.13.1`: Database migrations
- `pydantic==2.5.0`: Data validation
- `uvicorn[standard]==0.24.0`: ASGI server

### Development Dependencies
- `python-dotenv==1.0.0`: Environment variable management
- `httpx==0.25.2`: HTTP client for testing

## Next Steps

1. **Complete Authentication System**: Implement JWT-based login/logout functionality
2. **Add Protected Endpoints**: Secure existing and new endpoints with authentication
3. **Implement Group Management**: Add group creation and management features
4. **Implement Trip Management**: Add trip logging functionality
5. **Google Maps Integration**: Add distance calculation API
6. **Frontend Integration**: Connect with React frontend
7. **Testing**: Add comprehensive test suite
8. **Deployment**: Prepare for Railway deployment