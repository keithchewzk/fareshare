# Project Plan: FareShare (MVP v0.1)

**Version:** 0.1 (MVP)
**Date:** 06 October 2025
**Author:** Project Manager AI

This document outlines the project plan for the Minimum Viable Product (MVP) of **FareShare**, a collaborative web application to track car usage. The primary goal of this MVP is to validate the core functionality of logging trips within a shared group.

**IMPORTANT NOTE:** This MVP version features **unsecured endpoints**. It is designed for initial development and testing in a trusted environment only. Security implementation is the top priority for the next iteration.

## 1. MVP Vision & Scope

The FareShare MVP will allow users to create an account, form groups, and log car trips. The system will calculate costs based on a pre-set rate. All data is public within the application during this MVP phase.

### Core Concepts

-   **User:** A person with an account, identified by an email.
-   **Group:** A shared space created by a user. It contains members and a trip log.
-   **Trip:** A record of a single journey logged by a member of a Group.

### MVP User Stories

-   **As a User, I want to...**
    -   ...create an account with my email and a password.
    -   ...create a new "Group" (e.g., "Family Car").
    -   ...receive a unique, shareable invite code for my Group.
    -   ...join an existing Group using an invite code.
    -   ...view a list of all Groups I am a member of.
    -   ...select a Group and view its dashboard, which includes all trips from all members.
    -   ...log a new trip within a specific Group.
    -   ...mark my own trips as "Paid."

## 2. System Design & Architecture (MVP)

The architecture is a standard decoupled frontend and backend. For the MVP, the security layer between them is omitted.

### Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React + Vite |
| **Backend** | Python + FastAPI |
| **Database** | PostgreSQL |
| **External API** | Google Maps Platform (Directions API) |
| **DevOps** | Docker, Docker Compose |
| **Deployment** | Railway |

### Database Schema

The schema supports user identification but does not yet enforce data access rules.

#### `users` table
| Column Name | Data Type | Notes |
| :--- | :--- | :--- |
| `id` | `SERIAL PRIMARY KEY` | |
| `email` | `VARCHAR(255) UNIQUE NOT NULL` | |
| `password_hash` | `VARCHAR(255) NOT NULL` | For future authentication. |
| `full_name` | `VARCHAR(100)` | |

#### `groups` table
| Column Name | Data Type | Notes |
| :--- | :--- | :--- |
| `id` | `SERIAL PRIMARY KEY` | |
| `name` | `VARCHAR(100) NOT NULL` | |
| `creator_id` | `INTEGER` | Foreign Key to `users.id`. |
| `cost_per_km` | `DECIMAL(10, 4) NOT NULL` | Set via environment variable for MVP. |
| `invite_code` | `VARCHAR(10) UNIQUE` | |

#### `group_members` table
| Column Name | Data Type | Notes |
| :--- | :--- | :--- |
| `user_id` | `INTEGER` | Foreign Key to `users.id` |
| `group_id` | `INTEGER` | Foreign Key to `groups.id` |
| **Constraint** | `PRIMARY KEY (user_id, group_id)` | |

#### `trips` table
| Column Name | Data Type | Notes |
| :--- | :--- | :--- |
| `id` | `SERIAL PRIMARY KEY` | |
| `group_id` | `INTEGER` | Foreign Key to `groups.id`. |
| `user_id` | `INTEGER` | Foreign Key to `users.id`. |
| `start_address` | `TEXT NOT NULL` | |
| `end_address` | `TEXT NOT NULL` | |
| `distance_km` | `DECIMAL(10, 2) NOT NULL` | |
| `cost_usd` | `DECIMAL(10, 2) NOT NULL` | |
| `trip_date` | `TIMESTAMP WITH TIME ZONE` | Default: `NOW()` |
| `is_paid` | `BOOLEAN` | Default: `FALSE` |

### API Endpoints (MVP - Unsecured)

All endpoints are public and do not require authentication tokens. The frontend will be responsible for passing the correct `user_id` and `group_id` as needed.

-   **User Management:**
    -   `POST /users`: Creates a new user.
    -   `GET /users`: Retrieves all users.

-   **Group Management:**
    -   `POST /groups`: Creates a new Group.
    -   `GET /groups`: Returns a list of all Groups.
    -   `POST /groups/join`: Adds a user to a group based on an `invite_code`.

-   **Trip Management:**
    -   `POST /groups/{group_id}/trips`: Creates a new trip for a given group.
    -   `GET /groups/{group_id}/trips`: Gets all trips for a specific group.
    -   `PATCH /trips/{trip_id}/settle`: Marks a single trip as paid.

## 3. Development & Deployment Plan

### Development Roadmap

1.  **Setup & Backend Foundation (Days 1-2):**
    -   Initialize Git repo and Docker setup.
    -   Define all `SQLAlchemy` database models.
    -   Implement all backend API endpoints as described above. All endpoints will be public.
    -   The `cost_per_km` rate will be a hardcoded environment variable (`COST_PER_KM`) on the backend.

2.  **Frontend Development (Days 3-6):**
    -   Build the UI for user registration, creating/joining groups, and logging trips.
    -   The frontend will manage the "logged-in" user's ID in its state (e.g., after a user "logs in" by selecting their name from a list of all users).
    -   Implement the core trip logging form, which calls the Google Maps API via the backend.
    -   Build the dashboard to display all trips for a selected Group.

3.  **Integration & Deployment (Day 7):**
    -   Perform end-to-end testing of the complete, unsecured user flow.
    -   Deploy the frontend, backend, and database to Railway.
    -   Configure production environment variables (`DATABASE_URL`, `GOOGLE_MAPS_API_KEY`, `COST_PER_KM`).

## 4. Post-MVP Roadmap: Critical Next Steps

This MVP provides a functional skeleton but lacks essential security. The following items are the highest priority for the next development cycle (v0.2).

1.  **Implement JWT Authentication:**
    -   Create a `/auth/login` endpoint that returns a JWT token.
    -   Secure all data-mutating and data-accessing endpoints, requiring a valid JWT.
    -   Implement a security dependency (`get_current_user`) in FastAPI to validate tokens and identify the user making the request.
    -   Update the frontend to store the JWT and send it in the `Authorization` header for all relevant API calls.

2.  **Enforce Permissions:**
    -   Once authentication is in place, add permission logic to the backend.
    -   **Example:** A user should only be able to mark their *own* trips as paid.
    -   **Example:** A user must be a member of a Group to view its trips.

3.  **Implement Email Verification:**
    -   Add a process to verify a user's email address upon registration to prevent account squatting and ensure notifications are sent to the correct person.
