# iLearning Backend - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture](#architecture)
5. [Database Design](#database-design)
6. [API Routes](#api-routes)
7. [Authentication & Authorization](#authentication--authorization)
8. [Key Features](#key-features)
9. [Configuration](#configuration)
10. [Development Guide](#development-guide)

---

## Project Overview

**iLearning Backend** is a subscription-based learning platform backend application built with **Express.js**, **PostgreSQL**, and **Prisma ORM**. The system manages student subscriptions, billing plans, and payment processing through Stripe integration.

### Key Capabilities
- Student registration and authentication
- Subscription plan management
- Payment processing and webhook handling
- Role-based access control
- Premium content access management

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Runtime** | Node.js | - |
| **Framework** | Express.js | ^5.2.1 |
| **Language** | TypeScript | - |
| **Database** | PostgreSQL | - |
| **ORM** | Prisma | ^7.3.0 |
| **Authentication** | Better Auth | ^1.4.18 |
| **Payment Gateway** | Stripe | ^20.3.1 |
| **Validation** | Zod | ^4.3.6 |
| **JWT** | jsonwebtoken | ^9.0.3 |
| **CORS** | cors | ^2.8.6 |
| **Environment** | dotenv | ^17.2.3 |

---

## Project Structure

```
ilearning-backend/
├── prisma/
│   ├── migrations/                 # Database migrations
│   │   ├── migration_lock.toml
│   │   ├── 20260319164246/
│   │   └── 20260325032230/
│   └── schema/                     # Prisma schema files (modular)
│       ├── auth.prisma             # Auth-related models
│       ├── enum.prisma             # Enums (Role, Status types)
│       ├── payment.prisma          # Payment model
│       ├── plan.prisma             # Billing plan model
│       ├── schema.prisma           # Main schema configuration
│       └── subscription.prisma     # Subscription model
│
├── src/
│   ├── app.ts                      # Express app initialization
│   ├── server.ts                   # Server entry point
│   │
│   ├── app/
│   │   ├── config/                 # Configuration files
│   │   │   ├── env.ts              # Environment variables validation
│   │   │   └── stripe.config.ts    # Stripe API configuration
│   │   │
│   │   ├── errorHelpers/           # Error handling utilities
│   │   │   ├── AppError.ts         # Custom error class
│   │   │   ├── handlePrismaErrors.ts
│   │   │   └── handleZodError.ts
│   │   │
│   │   ├── interfaces/             # TypeScript interfaces & types
│   │   │   ├── error.interface.ts
│   │   │   ├── index.d.ts
│   │   │   └── requestUser.interface.ts
│   │   │
│   │   ├── lib/                    # Core libraries
│   │   │   ├── auth.ts             # Better Auth configuration
│   │   │   └── prisma.ts           # Prisma client instance
│   │   │
│   │   ├── middleware/             # Express middleware
│   │   │   ├── checkAuth.ts        # Authentication middleware
│   │   │   ├── checkPremiumAccess.ts # Premium access verification
│   │   │   ├── globalErrorHandler.ts # Global error handling
│   │   │   ├── notFound.ts         # 404 handler
│   │   │   └── validateRequest.ts  # Request validation (Zod)
│   │   │
│   │   ├── modules/                # Feature modules (MVC pattern)
│   │   │   ├── auth/               # Authentication module
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.route.ts
│   │   │   │   └── auth.service.ts
│   │   │   │
│   │   │   ├── payment/            # Payment processing module
│   │   │   │   ├── payment.controller.ts
│   │   │   │   ├── payment.interface.ts
│   │   │   │   ├── payment.route.ts
│   │   │   │   ├── payment.service.ts
│   │   │   │   └── payment.validation.ts
│   │   │   │
│   │   │   ├── plans/              # Subscription plans module
│   │   │   │   ├── plan.controller.ts
│   │   │   │   ├── plan.route.ts
│   │   │   │   ├── plan.service.ts
│   │   │   │   └── plan.validation.ts
│   │   │   │
│   │   │   └── subscriptions/      # Subscription management module
│   │   │       ├── subscription.controller.ts
│   │   │       ├── subscription.interface.ts
│   │   │       ├── subscription.route.ts
│   │   │       ├── subscription.service.ts
│   │   │       └── subscription.validation.ts
│   │   │
│   │   ├── routes/
│   │   │   └── index.ts            # Main API route aggregator
│   │   │
│   │   ├── shared/                 # Shared utilities
│   │   │   ├── catchAsync.ts       # Async error catcher wrapper
│   │   │   └── sendResponse.ts     # Standardized response formatter
│   │   │
│   │   └── utils/                  # Helper utilities
│   │       ├── cookie.ts           # Cookie management
│   │       ├── jwt.ts              # JWT token utilities
│   │       ├── seed.ts             # Database seeding
│   │       └── token.ts            # Token generation utilities
│   │
│   └── generated/                  # Auto-generated Prisma files
│       └── prisma/
│           ├── browser.ts
│           ├── client.ts
│           ├── commonInputTypes.ts
│           ├── enums.ts
│           ├── models.ts
│           └── models/             # Individual model files
│
├── package.json                    # Project dependencies & scripts
├── pnpm-lock.yaml                  # Dependency lock file
├── prisma.config.ts                # Prisma configuration
├── tsconfig.json                   # TypeScript configuration
└── PROJECT_DOCUMENTATION.md        # This file
```

---

## Architecture

### Architectural Pattern: Modular Layered Architecture

The application follows a **layered architecture** with modular feature-based organization:

```
┌─────────────────────────────────────────────────┐
│         Express Application (app.ts)            │
├─────────────────────────────────────────────────┤
│  Middleware Layer                               │
│  ├─ CORS, JSON Parser, Cookie Parser            │
│  ├─ Authentication (checkAuth)                  │
│  ├─ Request Validation (validateRequest)        │
│  ├─ Global Error Handler                        │
│  └─ 404 Handler                                 │
├─────────────────────────────────────────────────┤
│  Route Layer (routes/index.ts)                  │
│  ├─ /api/v1/auth                                │
│  ├─ /api/v1/plans                               │
│  ├─ /api/v1/subscriptions                       │
│  └─ /webhook (Stripe webhook handler)           │
├─────────────────────────────────────────────────┤
│  Feature Modules (modules/*)                    │
│  ├─ Controllers (Handle requests)               │
│  ├─ Services (Business logic)                   │
│  ├─ Validation (Zod schemas)                    │
│  └─ Routes (Endpoint definitions)               │
├─────────────────────────────────────────────────┤
│  Data Access Layer                              │
│  ├─ Prisma ORM                                  │
│  ├─ Database Models                             │
│  └─ Query Builders                              │
├─────────────────────────────────────────────────┤
│  Database (PostgreSQL)                          │
└─────────────────────────────────────────────────┘
```

### Design Patterns Used

1. **MVC (Model-View-Controller)**
   - Controllers handle HTTP requests
   - Services implement business logic
   - Models defined via Prisma schemas

2. **Middleware Pattern**
   - Authentication verification
   - Request validation
   - Error handling
   - CORS and security

3. **Error Handling Strategy**
   - Custom `AppError` class for controlled errors
   - Global error handler middleware
   - Prisma error handling
   - Zod validation error handling

4. **Response Standardization**
   - Unified response format via `sendResponse` utility
   - Consistent error responses via global handler

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       
│    User     │◄──────│ Subscription│
│             │       │             │      
│ id (UUID)   │       │ id (UUID)   │      
│ email       │       │ name        │      
│ role        │       │ email       │      
│ status      │       │ profilePhoto│      
│ isDeleted   │       │ contactNum  │      
│             │       │ address     │      
└─────────────┘       │ isDeleted   │       
                      └─────────────┘       
                           ▲        │
                           │        │
                    ┌──────┴──────┐ │
                    │             │ │
            ┌─────────────┐ ┌──────────┐
            │    Plan     │ │ Payment  │
            │             │ │          │
            │ id (CUID)   │ │ id (UUID)│
            │ name        │ │ amount   │
            │ price       │ │ status   │
            │ interval    │ │ stripeId │
            │ isActive    │ │invoiceUrl│
            └─────────────┘ └──────────┘
```

### Core Models

#### **User**
- Managed by Better Auth
- Roles: SUPER_ADMIN, ADMIN, INSTRUCTOR, STUDENT
- Status: ACTIVE, BLOCKED, DELETED
- Additional fields: role, status, needPasswordChange, isDeleted

#### **Student**
- One-to-one relation with User
- Stores student profile information
- Multiple subscriptions relationship
- Soft delete support (isDeleted, deletedAt)

#### **Plan**
- Billing plan configuration
- Pricing and interval (DAILY, MONTHLY, YEARLY, LIFETIME)
- BillingInterval enum for flexible billing periods
- Multiple subscriptions relationship

#### **Subscription**
- Links Student to Plan
- Statuses: PENDING, ACTIVE, CANCELLED, EXPIRED, PAST_DUE, TRIAL
- Payment tracking (PaymentStatus: PAID, UNPAID)
- Temporal tracking (startDate, endDate)
- Stripe integration support (externalRef, paymentProvider)

#### **Payment**
- Transaction tracking for Stripe
- One-to-one relation with Subscription
- Stores invoice URL and payment gateway data
- Status tracking (PAID, UNPAID)

---

## API Routes

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Routes
**Base Path:** `/auth`

| Method | Endpoint | Protection | Description |
|--------|----------|-----------|-------------|
| `POST` | `/register` | Public | Register new student account |
| `POST` | `/login` | Public | Login user (email & password) |
| `GET` | `/me` | Protected* | Get current user profile |

*Protected: Requires valid session token for ADMIN, SUPER_ADMIN, or STUDENT roles

#### Example Requests

**Register Student**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "securePassword123"
}
```

**Get Current User**
```http
GET /api/v1/auth/me
Authorization: Bearer <session_token>
Cookie: better-auth.session_token=<token>
```

---

### Plans Routes
**Base Path:** `/plans`

| Method | Endpoint | Protection | Description |
|--------|----------|-----------|-------------|
| `GET` | `/` | Public | Get all active plans |
| `POST` | `/` | Protected** | Create new subscription plan |

**Protected**: Requires ADMIN or SUPER_ADMIN role

#### Example Requests

**Get All Plans**
```http
GET /api/v1/plans
```

**Create Plan (Admin Only)**
```http
POST /api/v1/plans
Authorization: Bearer <session_token>
Content-Type: application/json

{
  "name": "Pro Plan",
  "slug": "pro-plan",
  "description": "Advanced learning features",
  "price": 99.99,
  "currency": "USD",
  "interval": "MONTHLY",
  "isActive": true
}
```

---

### Subscriptions Routes
**Base Path:** `/subscriptions`

| Method | Endpoint | Protection | Description |
|--------|----------|-----------|-------------|
| `GET` | `/` | Admin Protected | Get all subscriptions (admin view) |
| `GET` | `/my-subscription` | Student Protected | Get current user's subscription |
| `GET` | `/my-premium-access` | Premium Verified | Check premium access status |
| `POST` | `/` | Student Protected | Create new subscription |
| `POST` | `/initiate-payment/:id` | Student Protected | Initiate Stripe payment for subscription |
| `POST` | `/book-subscription-with-pay-later` | Student Protected | Create subscription with deferred payment |
| `POST` | `/cancel-unpaid` | Admin Protected | Cancel all unpaid subscriptions |
| `PATCH` | `/:id/status` | Admin Protected | Update subscription status |

#### Example Requests

**Get My Subscription**
```http
GET /api/v1/subscriptions/my-subscription
Authorization: Bearer <session_token>
Cookie: better-auth.session_token=<token>
```

**Create Subscription**
```http
POST /api/v1/subscriptions
Authorization: Bearer <session_token>
Cookie: better-auth.session_token=<token>
Content-Type: application/json

{
  "planId": "plan_12345",
  "studentId": "student_uuid"
}
```

**Initiate Payment**
```http
POST /api/v1/subscriptions/initiate-payment/subscription_12345
Authorization: Bearer <session_token>
Cookie: better-auth.session_token=<token>
```

**Check Premium Access**
```http
GET /api/v1/subscriptions/my-premium-access
Authorization: Bearer <session_token>
Cookie: better-auth.session_token=<token>
```

**Update Subscription Status**
```http
PATCH /api/v1/subscriptions/subscription_12345/status
Authorization: Bearer <session_token>
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

---

### Webhook Routes

| Method | Endpoint | Protection | Description |
|--------|----------|-----------|-------------|
| `POST` | `/webhook` | Stripe Header Verification | Handle Stripe webhook events |

#### Stripe Webhook
```http
POST /webhook
Content-Type: application/json
stripe-signature: <signature>

{
  "type": "payment_intent.succeeded",
  "data": {...}
}
```

The webhook endpoint is handled directly in `app.ts` and uses Stripe's signature verification for security.

---

## Authentication & Authorization

### Authentication Flow

1. **User Registration/Login**
   - Uses Better Auth (Open-source authentication framework)
   - Email and password-based authentication
   - Optional email verification

2. **Session Management**
   - Cookie-based sessions (better-auth.session_token)
   - Server-side session validation via database
   - Configurable session expiration

3. **Token Refresh**
   - Sessions tracked in database with expiration
   - Auto-refresh headers when session nearing expiration
   - X-Session-Refresh header indicates refresh needed

### Authorization

**Role-Based Access Control (RBAC)**

```typescript
enum Role {
  SUPER_ADMIN  // Full system access
  ADMIN        // System administration (limited)
  INSTRUCTOR   // Create/manage courses
  STUDENT      // Access learning content
}
```

**Protection Middleware Examples**

```typescript
// Public route
router.post("/register", AuthController.registerStudent)

// Single role required
router.get("/me", checkAuth(Role.STUDENT), AuthController.getMe)

// Multiple roles allowed
router.get("/", 
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN), 
  SubscriptionController.getAllSubscriptions
)
```

### Security Features

- **CORS Configuration**: Restricted to authenticated frontend origins
- **Cookie Security**: HttpOnly, Secure flags
- **HTTPS Enforced**: For production
- **Environment Variables**: Sensitive data externalized
- **Stripe Signature Verification**: Webhook validation
- **Session Expiration**: Automatic cleanup of expired sessions

---

## Key Features

### 1. Subscription Management
- Create and manage subscription plans
- Track subscription lifecycle (PENDING → ACTIVE → EXPIRED/CANCELLED)
- Support multiple billing intervals (DAILY, MONTHLY, YEARLY, LIFETIME)
- Status management with full audit trail

### 2. Payment Processing
- Stripe integration for secure payment handling
- Multiple payment statuses (PAID, UNPAID)
- Pay-later functionality with deferred billing
- Webhook handling for payment confirmations
- Invoice URL storage and tracking

### 3. Student Profiles
- Comprehensive student profile management
- Personal information storage
- Profile photo support
- Contact and address management
- Soft delete functionality

### 4. Premium Access Control
- Middleware-based premium verification
- Student premium access checking
- Status-based access control
- Automatic expiration handling

### 5. Admin Dashboard Support
- Admin-only subscription viewing
- Bulk subscription status updates
- Unpaid subscription management
- Plan creation and management

---

## Configuration

### Environment Variables

| Variable | Type | Description | Required |
|----------|------|-------------|----------|
| `NODE_ENV` | string | Environment (development/production) | ✓ |
| `PORT` | number | Server port | ✓ |
| `DATABASE_URL` | string | PostgreSQL connection string | ✓ |
| `BETTER_AUTH_SECRET` | string | Better Auth secret key | ✓ |
| `BETTER_AUTH_URL` | string | Better Auth service URL | ✓ |
| `STRIPE_SECRET_KEY` | string | Stripe API secret key | ✓ |
| `STRIPE_WEBHOOK_SECRET` | string | Stripe webhook secret | ✓ |
| `FRONTEND_URL` | string | Frontend application URL | ✓ |
| `SUPER_ADMIN_EMAIL` | string | Super admin email | ✓ |
| `SUPER_ADMIN_PASSWORD` | string | Super admin password | ✓ |
| `ACCESS_TOKEN_SECRET` | string | JWT access token secret | ○ |
| `REFRESH_TOKEN_SECRET` | string | JWT refresh token secret | ○ |
| `ACCESS_TOKEN_EXPIRES_IN` | string | Access token expiration (e.g., 1h) | ○ |
| `REFRESH_TOKEN_EXPIRES_IN` | string | Refresh token expiration (e.g., 7d) | ○ |
| `BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN` | string | Session token expiration | ○ |
| `BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE` | string | Session refresh age threshold | ○ |

✓ = Required | ○ = Optional

### CORS Configuration

**Allowed Origins**
```typescript
[
  process.env.FRONTEND_URL,
  process.env.BETTER_AUTH_URL,
  "http://localhost:3000",
  "http://localhost:5000"
]
```

**Allowed Methods**: GET, POST, PUT, DELETE, PATCH
**Credentials**: Enabled (for cookie-based auth)

---

## Development Guide

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
```

### Database Setup

```bash
# Run migrations
pnpm run migrate

# Generate Prisma client
pnpm run generate

# Reset database (⚠️ Destroys data)
pnpm run prisma:reset

# Seed database
pnpm run seed
```

### Development Commands

```bash
# Start development server with hot reload
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start

# Run linting
pnpm run lint

# Open Prisma Studio (Database GUI)
pnpm run studio
```

### Stripe Development

```bash
# Listen to Stripe webhooks locally
pnpm run stripe:webhook
```

### Project Structure Best Practices

1. **Modular Organization**
   - Each feature has its own folder (auth, plans, subscriptions, etc.)
   - Within each module: controller, service, route, validation

2. **Separation of Concerns**
   - Controllers: HTTP request/response handling
   - Services: Business logic implementation
   - Routes: Endpoint definitions
   - Validation: Schema definitions (Zod)

3. **Error Handling**
   - Use `catchAsync` wrapper for async controller functions
   - Throw `AppError` for controlled errors
   - Global handler catches and formats errors

4. **Database Queries**
   - Use Prisma client from lib/prisma.ts
   - Leverage Prisma's type safety
   - Use relations as needed for eager loading

5. **Validation**
   - Define Zod schemas in validation files
   - Use validateRequest middleware for input validation
   - Type-safe request bodies in controllers

### Code Organization Example

```typescript
// route.ts
router.post("/", validateRequest(createSchema), Controller.create);

// controller.ts
static create = catchAsync(async (req: Request, res: Response) => {
  const result = await Service.create(req.body);
  sendResponse(res, { statusCode: 201, data: result });
});

// service.ts
static async create(data: CreateDTO) {
  return await prisma.model.create({ data });
}

// validation.ts
export const createSchema = z.object({
  // validation rules
});
```

---

## Summary

The **iLearning Backend** is a well-architected Node.js application that implements:

- ✅ Clean layered architecture with modular feature organization
- ✅ Type-safe development with TypeScript and Zod
- ✅ Secure authentication with Better Auth and role-based authorization
- ✅ Reliable payment processing with Stripe integration
- ✅ Database design supporting subscription and billing workflows
- ✅ Comprehensive error handling and validation
- ✅ RESTful API with clear endpoint organization
- ✅ Production-ready code structure and patterns

---

**Last Updated:** March 25, 2026
**Version:** 1.0.0
