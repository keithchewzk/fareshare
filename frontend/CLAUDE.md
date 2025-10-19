# FareShare Frontend

## Project Overview

FareShare is a collaborative web application for tracking car usage within shared groups. The backend provides user authentication and will expand to include group management and trip tracking functionality.

## Technology Stack

- **Framework:** React 19.1.1 with TypeScript
- **Build Tool:** Vite 7.1.2
- **Styling:** Tailwind CSS 3.4.x with shadcn/ui components
- **Icons:** Lucide React
- **Development:** ESLint for code quality
- **Utilities:** clsx, tailwind-merge, class-variance-authority
- **Navigation:** React Router DOM 7.9.4 for client-side routing
- **Additional Dependencies:** @radix-ui/react-slot, @radix-ui/react-tabs, @radix-ui/react-label, @radix-ui/react-dialog

## Code Organization

### Component Structure

The frontend follows a **modular component architecture** using the **Index File Pattern (Option 3)** with **lifted state management**:

```
src/
├── components/
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx                # Button component with variants
│   │   ├── input.tsx                 # Input field component
│   │   ├── label.tsx                 # Form label component
│   │   ├── card.tsx                  # Card components (Card, CardHeader, etc.)
│   │   ├── tabs.tsx                  # Tabs navigation components
│   │   └── dialog.tsx                # Modal dialog components
│   ├── LandingPage/                  # Landing page with complete 6-section layout
│   │   └── index.tsx                 # Hero, Features, Use Cases, CTA, Footer
│   ├── AuthPage/                     # Authentication system
│   │   └── index.tsx                 # Login/Signup tabs with mock auth
│   └── Dashboard/                    # Main dashboard (Index File Pattern)
│       ├── index.tsx                 # Dashboard with groups grid & empty state
│       ├── CreateGroupDialog.tsx     # Group creation dialog
│       └── JoinGroupDialog.tsx       # Group joining dialog with invite codes
├── lib/
│   ├── utils.ts                     # Utility functions (cn helper)
│   └── routes.ts                    # API routes configuration
├── services/
│   └── userService.ts               # User registration and authentication API calls
├── main.tsx                         # Application entry point with React root
├── App.tsx                           # Main app with React Router setup
├── App.css                           # Global app styles
└── index.css                         # Tailwind CSS imports and custom styles
```

### Architecture Principles

**1. Index File Pattern**

- Each major component has its own directory
- Main component is named `index.tsx` for clean imports
- Sub-components use simple, contextual names

**3. Clean Import Paths**

```typescript
// Clean imports thanks to index.tsx pattern
import { Dashboard } from "./components/Dashboard";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";

// Internal sub-component imports (within Dashboard directory)
import { CreateGroupDialog } from "./CreateGroupDialog";
import { JoinGroupDialog } from "./JoinGroupDialog";
```

**6. Contextual Naming**

- Sub-components use simple names (`CreateGroupDialog`, `JoinGroupDialog`)
- Context comes from their parent directory location
- Avoids repetitive naming like `DashboardCreateGroupDialog`


## Application Architecture

### Routing & Navigation
- **React Router DOM** - Client-side routing with BrowserRouter
- **Route Structure:**
  - `/` - Landing page with conversion funnel
  - `/auth` - Authentication page (Login/Signup tabs)
  - `/dashboard` - Protected dashboard (requires authentication)

### State Management
- **Local State** - useState for component-level state
- **localStorage Persistence** - Groups and trips data stored locally
- **Mock Authentication** - Development-ready auth system

### Data Models
```typescript
interface User {
  id: string;
  email: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  members: string[];
  createdAt: number;
}
```

## Implementation Progress

### ✅ Completed Features

#### 1. Project Foundation
- **Project Setup:** Vite + React + TypeScript configuration
- **Styling System:** Tailwind CSS 3.4.x + shadcn/ui setup
- **Configuration Files:**
  - `postcss.config.js` - PostCSS with Tailwind + Autoprefixer
  - `tailwind.config.js` - Tailwind configuration with shadcn/ui theme
  - `tsconfig.json` + `tsconfig.node.json` - TypeScript configuration
  - `eslint.config.js` - Modern flat ESLint configuration with React hooks
  - `vite.config.js` - Vite build configuration with React plugin
  - `vite-env.d.ts` - TypeScript declarations for Vite environment
  - `components.json` - shadcn/ui CLI configuration

#### 2. UI Component Library
- **Base Components:** Complete shadcn/ui implementation
  - `src/lib/utils.ts` - Utility functions (cn helper)
  - `src/components/ui/button.tsx` - Button with variants
  - `src/components/ui/input.tsx` - Form input fields
  - `src/components/ui/label.tsx` - Form labels
  - `src/components/ui/card.tsx` - Card components
  - `src/components/ui/tabs.tsx` - Tab navigation
  - `src/components/ui/dialog.tsx` - Modal dialogs

#### 3. Landing Page (Complete)
- **Full 6-Section Layout:** `src/components/LandingPage/index.tsx`
  - Header - Sticky navigation with CTA
  - Hero - Main value proposition
  - Features - 3-column feature grid
  - Use Cases - Target audience section
  - Final CTA - Conversion section
  - Footer - Simple closure
- **Responsive Design** - Mobile-first approach
- **Conversion Funnel** - Awareness → Interest → Consideration → Action

#### 4. Authentication System (Complete - Real Backend Integration)
- **AuthPage Component:** `src/components/AuthPage/index.tsx`
  - Tabbed interface (Login/Signup)
  - Real API integration for registration and login
  - Separate first name/last name fields (first name required)
  - JWT token management and localStorage persistence
  - Loading states and comprehensive error handling
  - React Router integration

#### 5. Dashboard System (Complete)
- **Main Dashboard:** `src/components/Dashboard/index.tsx`
  - User header with logout functionality
  - Action buttons (Create Group, Join Group)
  - Groups grid with statistics
  - Empty state for new users
  - Responsive layout (mobile/tablet/desktop)

#### 6. Group Management (Complete)
- **CreateGroupDialog:** `src/components/Dashboard/CreateGroupDialog.tsx`
  - Group name input with validation
  - Auto-generated invite codes
  - localStorage persistence
  - Form reset on success
- **JoinGroupDialog:** `src/components/Dashboard/JoinGroupDialog.tsx`
  - Invite code input (6-character, uppercase)
  - Error handling for invalid/duplicate codes
  - Group membership validation
  - Form validation and reset

#### 7. Application Entry Point
- **Main Entry:** `src/main.tsx` - React 19 application bootstrapping
  - Strict mode enabled for development
  - Root element validation and error handling
  - Modern createRoot API usage

#### 8. Backend Integration (New)
- **API Client Architecture:** Router & Services pattern
  - `lib/routes.ts` - Centralized API endpoint configuration
  - `services/userService.ts` - User registration and authentication business logic
  - Environment-based configuration with `VITE_BACKEND_API_URL`
- **Authentication Flow:**
  - User Registration: POST /users → Create account in PostgreSQL database
  - User Login: POST /auth/login → JWT token + GET /auth/me → User profile
  - Token Management: localStorage persistence with key `fareshare_token`
- **Error Handling:** Comprehensive API error handling with user-friendly messages
- **Loading States:** Visual feedback during API operations

#### 9. Data Persistence
- **localStorage Integration:**
  - Groups stored in `fareshare_groups` (mock data)
  - JWT tokens stored in `fareshare_token` (real authentication)
- **Backend Persistence:** User accounts stored in PostgreSQL via FastAPI
- **Mock Trip Data:** Support for future trip statistics

### ✅ Application Flow
1. **Landing Page** - User discovers FareShare
2. **Authentication** - Real backend integration:
   - **Registration:** User creates account → Stored in PostgreSQL database
   - **Login:** User authenticates → JWT token + user profile → Dashboard
3. **Dashboard** - User views their groups (mock data)
4. **Group Creation** - User creates new shared vehicle group (mock functionality)
5. **Group Joining** - User joins existing groups via invite codes (mock functionality)
6. **Group Management** - User views group statistics and members (mock functionality)

### 📋 Ready for Enhancement
- **Group Management Integration:** Connect frontend group functionality to backend API
- **Trip tracking and expense management:** Full trip logging with backend integration
- **Group detail pages and member management:** Enhanced group features
- **Advanced group features:** Roles, permissions, and member administration
- **Token refresh and session management:** Enhanced authentication security
- **Mobile app considerations:** Responsive design improvements

### Technical Decisions
- **Tailwind CSS 3.x** - Chosen over 4.x for stability with shadcn/ui
- **Manual component installation** - Used due to CLI network issues
- **Index File Pattern** - Consistent component organization
- **Router & Services Architecture** - Clean separation of API routes and business logic
- **Environment Configuration** - Vite environment variables for API URL configuration
- **JWT Authentication** - Industry-standard token-based authentication
- **Hybrid Approach** - Real authentication with mock group data (transitional)