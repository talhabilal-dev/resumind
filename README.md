# Resumind — AI-Powered Resume Analysis Platform

> Upload your resume, get instant AI feedback, match it against job descriptions, and download a polished PDF analysis — all in one place.

<p align="left">
  <img src="https://img.shields.io/badge/Next.js-16.1.6-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.4-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-9.3.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/OpenAI-LangChain-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Stripe-20.4.1-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
</p>

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Main Functional Areas](#main-functional-areas)
4. [Technology Stack](#technology-stack)
5. [Project Architecture](#project-architecture)
6. [How the Application Works](#how-the-application-works)
7. [Folder Structure](#folder-structure)
8. [Major Modules](#major-modules)
9. [Database Schema](#database-schema)
10. [API Documentation](#api-documentation)
11. [Authentication & Authorization](#authentication--authorization)
12. [Configuration](#configuration)
13. [Installation](#installation)
14. [Available Scripts](#available-scripts)
15. [Dependencies](#dependencies)
16. [Development Notes](#development-notes)
17. [Deployment](#deployment)

---

## Project Overview

Resumind is a full-stack web application that helps job seekers improve their resumes using AI technology. Users upload their CV in PDF, DOCX, or TXT format, and the application:

- **Extracts** text from the uploaded file
- **Analyzes** the resume using OpenAI-powered LangChain agents
- **Generates** an ATS (Applicant Tracking System) score out of 100
- **Provides** specific, actionable improvement recommendations
- **Matches** resumes against job descriptions to assess compatibility
- **Creates** downloadable PDF reports with structured feedback

The platform operates on a credit-based billing model integrated with Stripe. Users purchase credits and spend them on AI-powered analyses. New users receive 10 credits as a signup bonus.

---

## Key Features

### Authentication & User Management
- JWT-based authentication with dual-token system (access + refresh tokens)
- Email verification using Resend API with time-limited tokens (10-minute expiry)
- Password reset flow with secure token generation
- User profiles with firstname, lastname, username, bio, and email
- HttpOnly cookie-based session management

### Resume Analysis
- Multi-format file upload support (PDF, DOCX, TXT) up to 5MB
- Text extraction using pdf-parse (PDF), mammoth (DOCX), and native parsing (TXT)
- AI-powered comprehensive resume analysis via LangChain + OpenAI GPT-4.1-mini
- ATS scoring (0-100) with section-by-section feedback
- Structured data extraction (contact info, skills, experience, education, projects, certifications)
- Keyword extraction and optimization suggestions
- Priority-based improvements (high, medium, low)

### Job Description Matching
- CV + JD compatibility analysis
- Match score calculation (0-100)
- Missing keyword identification (up to 30 keywords)
- Strengths and weaknesses assessment
- Targeted improvement suggestions
- Content hash-based caching to avoid duplicate analyses

### Credit System
- Credit wallet with real-time balance tracking
- Three credit pack options:
  - **Starter**: 50 credits for $5.00
  - **Growth**: 150 credits for $15.00
  - **Pro**: 400 credits for $40.00
- Stripe Checkout integration for secure payments
- Webhook-based credit fulfillment
- Transaction history with type tracking (purchase, usage, refund)
- Cost per analysis: 5 credits for full resume analysis, 5 credits for JD analysis

### PDF Report Generation
- Professional PDF reports built with pdf-lib
- Formatted analysis results with color-coded sections
- Score visualizations and feedback categorization
- Downloadable analysis history

### Dashboard & History
- Personal dashboard with credit balance overview
- Recent analyses quick access
- Complete analysis history with pagination
- Transaction log with filtering capabilities
- Profile settings and password management

---

## Main Functional Areas

### 1. Landing Page
- Hero section with feature highlights
- Feature cards showcasing AI analysis, format optimization, and personalized insights
- Benefits section with checklist
- Pricing information display
- Responsive navigation with mobile menu
- Call-to-action sections

### 2. Authentication Flow
- **Register**: User account creation with email verification requirement
- **Login**: Credential-based authentication with JWT token issuance
- **Verify Email**: Token-based email confirmation (sent via Resend)
- **Forgot Password**: Password reset request and verification flow
- **Logout**: Session termination with cookie clearing

### 3. Dashboard (Protected Area)
- **Home**: Overview with credit balance, recent analyses, and quick action cards
- **Analyze Resume**: Upload and analyze resume with AI
- **JD Analysis**: Compare resume against job description
- **History**: Browse all past analyses with pagination
- **Analysis Detail**: View full analysis report and download PDF
- **Credits**: Purchase credits via Stripe Checkout
- **Transactions**: View credit transaction log
- **Settings**: Update profile information and change password

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16.1.6 (App Router with React Server Components)
- **Language**: TypeScript 5.9.3
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS 4.2.1
- **UI Components**: Radix UI (@radix-ui/react-dialog, @radix-ui/react-toast)
- **Base UI**: @base-ui/react 1.2.0
- **Icons**: lucide-react 0.577.0
- **Utility Libraries**: 
  - class-variance-authority 0.7.1
  - clsx 2.1.1
  - tailwind-merge 3.5.0
  - tw-animate-css 1.4.0
- **Fonts**: Space Grotesk, Rajdhani, Inter (Google Fonts via next/font)

### Backend
- **Runtime**: Node.js >= 20
- **Framework**: Next.js 16 API Routes (Route Handlers)
- **Database**: MongoDB with Mongoose 9.3.0 ORM
- **Authentication**: jose 6.2.1 (JWT signing and verification)
- **Password Hashing**: bcryptjs 3.0.3
- **Validation**: Zod 4.3.6

### AI & Analysis
- **LLM Framework**: LangChain 1.2.31
- **OpenAI Integration**: @langchain/openai 1.2.13, @langchain/core 1.1.32
- **AI Model**: GPT-4.1-mini (temperature: 0.3)
- **Structured Output**: Zod schema enforcement for AI responses

### File Processing
- **PDF Parsing**: pdf-parse 1.1.1
- **PDF Generation**: pdf-lib 1.17.1
- **DOCX Parsing**: mammoth 1.12.0

### Payments
- **Payment Gateway**: Stripe 20.4.1
- **Webhook Verification**: Stripe signature validation

### Email
- **Email Service**: Resend 6.9.3
- **Templates**: React-based email templates

### Development Tools
- **Build Tool**: Next.js with Turbopack (--turbopack flag)
- **Package Manager**: pnpm
- **Linting**: ESLint (next lint)
- **Type Checking**: TypeScript compiler (tsc --noEmit)
- **Formatting**: Prettier 3.8.1
- **PostCSS**: @tailwindcss/postcss 4.2.1

---

## Project Architecture

### Application Type
Next.js 16 full-stack application using the App Router with file-based routing, React Server Components, and API Route Handlers.

### Architectural Patterns

#### Frontend Architecture
- **Client-Side Routing**: Next.js App Router with nested layouts
- **Component Structure**: Functional React components with hooks
- **State Management**: React useState and useEffect for local state
- **Form Handling**: Controlled components with Zod validation
- **API Communication**: Native fetch API with async/await
- **Toast Notifications**: Custom hook-based toast system
- **Responsive Design**: Mobile-first Tailwind CSS with breakpoints
- **Dark Mode**: Default dark theme via Tailwind configuration

#### Backend Architecture
- **API Layer**: Next.js Route Handlers in `src/app/api/`
- **Service Layer**: Business logic encapsulated in `src/services/`
- **Data Layer**: Mongoose models in `src/models/`
- **Validation Layer**: Zod schemas in `src/schemas/`
- **Helper Layer**: Utility functions in `src/helpers/`

#### Database Design
- **ORM**: Mongoose with TypeScript interfaces
- **Connection Strategy**: Singleton pattern with connection caching to prevent multiple connections in development
- **Schema Design**: 
  - Users with embedded credit balance
  - Resumes with structured data extraction
  - JD analyses with content hashing for deduplication
  - Transactions with type-based categorization
  - Payments with Stripe session tracking

#### Authentication Flow
- **Strategy**: JWT with dual-token system
- **Access Token**: Short-lived, stored in HttpOnly cookie named `token`
- **Refresh Token**: Long-lived, stored in HttpOnly cookie named `refreshToken`
- **Token Verification**: jose library for signature validation
- **Middleware**: `decodeToken` helper attempts access token first, falls back to refresh token
- **Token Refresh**: Automatic via `/api/users/token` endpoint

#### AI Pipeline Architecture
```
File Upload → Text Extraction → Credit Deduction → LangChain Agent → OpenAI API → Structured Output → Zod Validation → MongoDB Storage → Response
```

**LangChain Tool System**:
- `fullResumeAnalysisTool` defined in `src/helpers/resumeTool.ts`
- Uses OpenAI structured output for JSON enforcement
- Agent singleton pattern in `src/helpers/resumeAgent.ts`
- Result parsing with JSON extraction and Zod validation

#### Payment Flow
```
User Clicks Buy Credits → Stripe Checkout Session Creation → Stripe Hosted Payment → Webhook Event → Credit Addition → Transaction Recording → User Redirect
```

---

## How the Application Works

### User Registration & Verification
1. User submits registration form with firstname, lastname, username, email, and password
2. Password is hashed using bcryptjs (10 salt rounds)
3. User record created in MongoDB with `isVerified: false` and 10 signup bonus credits
4. Verification token generated (hashed userId) with 10-minute expiry
5. Email sent via Resend API with verification link
6. User clicks link, token validated, `isVerified` set to `true`

### Authentication Process
1. User submits login credentials
2. Email lookup in MongoDB with password field selection
3. Password verification using bcryptjs.compare
4. JWT access token generated (signed with `TOKEN_SECRET`)
5. JWT refresh token generated (signed with `REFRESH_TOKEN_SECRET`)
6. Both tokens stored as HttpOnly cookies in response
7. Subsequent requests verified via `decodeToken` helper

### Resume Analysis Workflow
1. **File Upload**: User uploads PDF/DOCX/TXT file via `/api/users/resume/extract-text`
   - File size validation (max 5MB)
   - Extension validation
   - Text extraction using appropriate parser
   - Minimum text length check (120 characters)

2. **Analysis Request**: Extracted text sent to `/api/users/resume/analyze` with job title
   - User authentication check via JWT
   - Credit balance verification (requires 5 credits)
   - Credit deduction (atomic operation)
   
3. **AI Processing**: 
   - Request forwarded to `runResumeAgent` service
   - LangChain agent invokes `fullResumeAnalysisTool`
   - OpenAI GPT-4.1-mini processes resume text with structured output schema
   - Response includes: ATS score, section scores, improvements, extracted data, keywords
   
4. **Data Storage**:
   - Analysis result parsed and validated with Zod
   - Resume document created/updated in MongoDB
   - Structured data mapped to Resume model fields
   - AI metadata recorded (timestamp, tokens)

5. **Response**: Frontend receives analysis with:
   - Summary
   - ATS score (0-100)
   - Prioritized recommendations
   - Missing keywords
   - Cost information

### Job Description Matching
1. User submits resume text + job description to `/api/users/resume/jd-analysis`
2. Content hash calculated (SHA-256 of normalized texts)
3. Cache check against existing analyses by hash
4. If not cached:
   - Credit deduction (5 credits)
   - LangChain agent processes with JD context
   - OpenAI returns: ATS score, JD match score, missing keywords, strengths, weaknesses, suggestions, improved content
5. Result saved to JdAnalysisModel with content hash
6. Response includes match metrics and improvement suggestions

### Credit Purchase Flow
1. User selects credit pack on `/user/dashboard/credits`
2. Frontend calls `/api/users/credits/checkout` with packId
3. Backend creates Stripe Checkout Session with metadata (userId, credits, amount)
4. Pending payment record created in PaymentModel
5. User redirected to Stripe hosted checkout page
6. On payment completion, Stripe sends webhook to `/api/webhooks/stripe`
7. Webhook handler:
   - Verifies signature using `STRIPE_WEBHOOK_SECRET`
   - Extracts metadata from session
   - Increments user credits atomically
   - Updates payment status to "completed"
   - Creates transaction record
8. User redirected to `/user/dashboard/credits/verify`
9. Frontend calls `/api/users/credits/verify` to confirm success

### PDF Report Generation
1. Analysis data passed to `buildPdfAnalysisReport` function
2. pdf-lib creates new PDF document
3. Embeds Helvetica and HelveticaBold fonts
4. Renders sections:
   - Header with metadata (date, filename, job title, company)
   - Overall score box
   - Category sections (tone & style, content, structure, skills)
   - Tips with color coding (good = green, improve = amber)
5. Text wrapping algorithm handles line breaks and page overflow
6. Returns PDF as Uint8Array
7. Frontend triggers download via blob creation

---

## Folder Structure

```
resumind/
├── email/                          # Email templates
│   └── template.tsx                # Resend React email template
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/                    # API Route Handlers
│   │   │   ├── stripe/
│   │   │   │   └── webhook/        # Stripe webhook (legacy path)
│   │   │   ├── webhooks/
│   │   │   │   └── stripe/         # Stripe webhook (primary path)
│   │   │   └── users/
│   │   │       ├── login/          # POST: authenticate user
│   │   │       ├── register/       # POST: create account
│   │   │       ├── logout/         # POST: clear auth cookies
│   │   │       ├── token/          # POST: refresh access token
│   │   │       ├── profile/        # GET/PUT: profile management
│   │   │       ├── change-password/ # POST: password change
│   │   │       ├── user-verify/    # POST: verify email
│   │   │       ├── forgot-password/ # POST: reset flow
│   │   │       ├── credits/        # Credit management
│   │   │       │   ├── checkout/   # POST: create Stripe session
│   │   │       │   ├── status/     # GET: credit balance
│   │   │       │   ├── transactions/ # GET: transaction history
│   │   │       │   └── verify/     # POST: confirm payment
│   │   │       └── resume/         # Resume operations
│   │   │           ├── analyze/    # POST: AI analysis
│   │   │           ├── extract-text/ # POST: file text extraction
│   │   │           ├── jd-analysis/ # POST: JD matching
│   │   │           └── history/    # GET: analysis history
│   │   │               └── [id]/   # GET/DELETE: single analysis
│   │   │
│   │   ├── user/                   # Frontend pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify/             # Email verification landing
│   │   │   ├── verify-token/       # Token verification redirect
│   │   │   ├── reset-password/     # Password reset flow
│   │   │   └── dashboard/          # Protected dashboard
│   │   │       ├── page.tsx        # Dashboard home
│   │   │       ├── layout.tsx      # Sidebar layout
│   │   │       ├── analyze/        # Resume upload & analysis
│   │   │       ├── jd-analysis/    # JD comparison
│   │   │       ├── history/        # Analysis history
│   │   │       │   └── [id]/       # Analysis detail
│   │   │       ├── credits/        # Credit purchase
│   │   │       │   └── verify/     # Post-payment verification
│   │   │       ├── transactions/   # Transaction log
│   │   │       └── settings/       # Profile & password
│   │   │
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout with fonts
│   │   └── page.tsx                # Landing page
│   │
│   ├── components/
│   │   └── ui/                     # Reusable UI components
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx         # App navigation sidebar
│   │       ├── skeleton.tsx
│   │       ├── spinner.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       └── tooltip.tsx
│   │
│   ├── helpers/                    # Utility functions
│   │   ├── apiUtils.ts             # API response helpers
│   │   ├── decodeToken.ts          # JWT verification
│   │   ├── downloadBase64Pdf.ts    # Client PDF download
│   │   ├── mailer.ts               # Resend email sender
│   │   ├── pdfAnalysisReport.ts    # PDF generation
│   │   ├── refreshToken.ts         # Token refresh helper
│   │   ├── resumeAgent.ts          # LangChain agent wrapper
│   │   └── resumeTool.ts           # LangChain tool definition
│   │
│   ├── hooks/
│   │   ├── use-mobile.ts           # Responsive breakpoint hook
│   │   └── use-toast.ts            # Toast notification hook
│   │
│   ├── lib/
│   │   ├── db.ts                   # MongoDB connection singleton
│   │   ├── hash.ts                 # bcryptjs wrapper
│   │   └── utils.ts                # Tailwind cn() helper
│   │
│   ├── models/                     # Mongoose schemas
│   │   ├── userModel.ts            # User accounts
│   │   ├── resumeModel.ts          # Resume analyses
│   │   ├── jdAnalysisModel.ts      # JD matching results
│   │   ├── jobModel.ts             # Job descriptions
│   │   ├── transactionModel.ts     # Credit transactions
│   │   └── stripeModel.ts          # Stripe payments
│   │
│   ├── schemas/                    # Zod validation
│   │   ├── userSchema.ts           # User input validation
│   │   ├── resumeSchema.ts         # Resume upload validation
│   │   ├── resumeAgentSchema.ts    # AI agent schemas
│   │   ├── jdAnalysisSchema.ts     # JD analysis schemas
│   │   ├── pdfAnalysisSchema.ts    # PDF report schemas
│   │   └── creditsSchema.ts        # Credit pack schemas
│   │
│   ├── services/
│   │   └── resumeService.ts        # Resume business logic
│   │
│   ├── types/
│   │   └── index.ts                # Shared TypeScript types
│   │
│   └── proxy.ts                    # Internal proxy utility
│
├── .env.example                    # Environment template
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── postcss.config.mjs              # PostCSS configuration
├── components.json                 # shadcn/ui config
├── package.json                    # Dependencies & scripts
├── pnpm-lock.yaml                  # Lockfile
└── README.md                       # This file
```

---

## Major Modules

### Authentication Module (`src/app/api/users/`)
**Responsibility**: User authentication, registration, email verification, password management

**Key Files**:
- `login/route.ts`: Credential validation, JWT generation, cookie setting
- `register/route.ts`: User creation, email verification trigger
- `token/route.ts`: Access token refresh using refresh token
- `logout/route.ts`: Cookie clearing
- `user-verify/route.ts`: Email verification token validation
- `forgot-password/sent/route.ts`: Password reset email trigger
- `forgot-password/verify/route.ts`: Reset token validation and password update
- `change-password/route.ts`: Authenticated password change

**Interactions**: Uses `User` model, `mailer` helper, `hash` utility, `decodeToken` middleware

### Resume Analysis Module (`src/app/api/users/resume/`)
**Responsibility**: File upload, text extraction, AI analysis, history management

**Key Files**:
- `extract-text/route.ts`: Multi-format text extraction (PDF, DOCX, TXT)
- `analyze/route.ts`: Full resume AI analysis with credit deduction
- `jd-analysis/route.ts`: CV + JD matching with caching
- `history/route.ts`: List all user analyses with pagination
- `history/[id]/route.ts`: Single analysis detail and deletion

**Interactions**: Uses `ResumeModel`, `JdAnalysisModel`, `resumeService`, `resumeAgent`, LangChain tools

### Credit System Module (`src/app/api/users/credits/`)
**Responsibility**: Credit balance, Stripe checkout, payment verification, transaction logging

**Key Files**:
- `status/route.ts`: Fetch current credit balance
- `checkout/route.ts`: Create Stripe Checkout Session
- `verify/route.ts`: Post-payment confirmation (frontend polling)
- `transactions/route.ts`: Transaction history with pagination

**Webhook Handler** (`src/app/api/webhooks/stripe/route.ts`):
- Verifies Stripe webhook signature
- Handles `checkout.session.completed` and `checkout.session.expired` events
- Atomically increments user credits
- Creates transaction records
- Updates payment status

**Interactions**: Uses `User`, `PaymentModel`, `CreditTransactionModel`, Stripe SDK

### AI Agent Module (`src/helpers/`)
**Responsibility**: LangChain agent orchestration, OpenAI integration, structured output

**Key Files**:
- `resumeTool.ts`: Defines `fullResumeAnalysisTool` with OpenAI structured output
- `resumeAgent.ts`: Agent wrapper with singleton pattern, result parsing, Zod validation
- `resumeService.ts`: Business logic for agent execution, MongoDB persistence

**Flow**:
1. Service receives request with resume text and job title
2. Agent validates input with Zod
3. Tool invokes OpenAI with system prompt and user resume text
4. OpenAI returns structured JSON matching `ResumeAnalysisOutputSchema`
5. Agent normalizes tool output (handles string or array content)
6. Result validated and parsed
7. Service maps analysis to Resume model
8. Document saved/updated in MongoDB
9. Response returned with analysis and cost

### PDF Generation Module (`src/helpers/pdfAnalysisReport.ts`)
**Responsibility**: Professional PDF report creation

**Features**:
- Multi-page support with automatic pagination
- Text wrapping algorithm for content overflow
- Font embedding (Helvetica, HelveticaBold)
- Color-coded sections and tips
- Score visualization boxes
- Metadata header (date, filename, job title, company)

### Email Module (`src/helpers/mailer.ts` + `email/template.tsx`)
**Responsibility**: Transactional email sending

**Email Types**:
- `VERIFY`: Account verification with 10-minute token
- `FORGOT_PASSWORD`: Password reset with 10-minute token

**Template**: React-based email template rendered by Resend

---

## Database Schema

### User (`userModel.ts`)
```typescript
{
  firstname: string (required, 2-30 chars)
  lastname: string (required, 2-30 chars)
  username: string (required, unique, 3-30 chars)
  email: string (required, unique, lowercase)
  password: string (required, hashed, min 6 chars, select: false)
  bio: string (optional, max 160 chars)
  isVerified: boolean (default: false)
  isAdmin: boolean (default: false)
  credits: number (default: 10)
  verificationToken: string (select: false)
  verificationTokenExpiry: Date (select: false)
  forgetToken: string (select: false)
  forgetTokenExpiry: Date (select: false)
  refreshToken: string (select: false)
  createdAt: Date (auto)
}
```

### Resume (`resumeModel.ts`)
```typescript
{
  userId: ObjectId (indexed, ref: User)
  title: string (default: "My Resume")
  version: number (default: 1)
  personal: {
    fullName: string
    email: string
    phone: string
    location: string
    website: string
    linkedin: string
    github: string
  }
  summary: string
  skills: {
    technical: string[]
    soft: string[]
    tools: string[]
    languages: string[]
  }
  experience: [{
    company: string
    role: string
    location: string
    startDate: Date
    endDate: Date
    current: boolean
    achievements: string[]
  }]
  education: [{
    institution: string
    degree: string
    field: string
    startDate: Date
    endDate: Date
  }]
  projects: [{
    name: string
    description: string
    technologies: string[]
    url: string
    achievements: string[]
  }]
  certifications: [{
    name: string
    issuer: string
    date: Date
  }]
  keywords: string[]
  rawText: string
  parsedData: Mixed
  atsScore: number (0-100)
  fileUrl: string
  fileHash: string (indexed)
  aiMetadata: {
    lastAnalyzedAt: Date
    tokensUsed: number
  }
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### JdAnalysis (`jdAnalysisModel.ts`)
```typescript
{
  userId: ObjectId (ref: User)
  contentHash: string (SHA-256 of normalized CV + JD)
  jobTitle: string
  companyName: string
  jobDescription: string
  analysisResult: Mixed (full AI response)
  tokensUsed: number
  creditsCharged: number
  improvedCvGenerated: boolean (default: false)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```
**Indexes**: `{ userId: 1, contentHash: 1 }` for cache lookups

### CreditTransaction (`transactionModel.ts`)
```typescript
{
  userId: ObjectId (ref: User)
  amount: number
  type: "purchase" | "usage" | "refund"
  description: string
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Payment (`stripeModel.ts`)
```typescript
{
  userId: ObjectId (ref: User)
  amount: number (USD)
  credits: number
  stripePaymentId: string (Stripe session ID)
  status: "pending" | "completed" | "failed"
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

---

## API Documentation

All API routes return JSON with the following structure:

**Success Response**:
```json
{
  "success": true,
  "data": { }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Human-readable message",
  "details": { }
}
```

### Authentication Endpoints

| Method | Route | Auth Required | Description |
|--------|-------|---------------|-------------|
| POST | `/api/users/register` | No | Create account with email, password, firstname, lastname, username |
| POST | `/api/users/login` | No | Authenticate user, issue JWT cookies |
| POST | `/api/users/logout` | Yes | Clear auth cookies |
| POST | `/api/users/token` | No | Refresh access token using refresh cookie |
| POST | `/api/users/user-verify` | No | Verify email with token |
| POST | `/api/users/user-verify/sent` | Yes | Resend verification email |
| POST | `/api/users/forgot-password/sent` | No | Send password reset email |
| POST | `/api/users/forgot-password/verify` | No | Verify reset token and set new password |
| POST | `/api/users/change-password` | Yes | Change password (requires old password) |

### Resume Endpoints

| Method | Route | Auth Required | Description |
|--------|-------|---------------|-------------|
| POST | `/api/users/resume/extract-text` | Yes | Upload file (PDF/DOCX/TXT), extract text |
| POST | `/api/users/resume/analyze` | Yes | Run AI analysis (costs 5 credits) |
| POST | `/api/users/resume/jd-analysis` | Yes | Run CV + JD match (costs 5 credits) |
| GET | `/api/users/resume/history` | Yes | List all analyses (paginated) |
| GET | `/api/users/resume/history/[id]` | Yes | Get single analysis detail |
| DELETE | `/api/users/resume/history/[id]` | Yes | Delete analysis |

**Example Request: `/api/users/resume/analyze`**
```json
{
  "resumeText": "Full plain text of the resume...",
  "jobTitle": "Software Engineer"
}
```

**Example Request: `/api/users/resume/jd-analysis`**
```json
{
  "jobTitle": "Senior Frontend Developer",
  "companyName": "Tech Corp",
  "jobDescription": "Full job description text..."
}
```
Note: Resume text is from user's last analysis or extract-text call

### Credit Endpoints

| Method | Route | Auth Required | Description |
|--------|-------|---------------|-------------|
| GET | `/api/users/credits/status` | Yes | Get current credit balance |
| POST | `/api/users/credits/checkout` | Yes | Create Stripe Checkout session |
| POST | `/api/users/credits/verify` | Yes | Confirm payment success |
| GET | `/api/users/credits/transactions` | Yes | List credit transactions (paginated) |

**Example Request: `/api/users/credits/checkout`**
```json
{
  "packId": "starter"
}
```
Valid packIds: `starter` (50 credits, $5), `growth` (150 credits, $15), `pro` (400 credits, $40)

### Profile Endpoints

| Method | Route | Auth Required | Description |
|--------|-------|---------------|-------------|
| GET | `/api/users/profile` | Yes | Get current user profile |
| PUT | `/api/users/profile` | Yes | Update profile (firstname, lastname, username, bio, email) |

### Webhook Endpoints

| Method | Route | Auth Required | Description |
|--------|-------|---------------|-------------|
| POST | `/api/webhooks/stripe` | Signature Verified | Stripe webhook handler (checkout.session.completed) |

---

## Authentication & Authorization

### Strategy
JWT-based authentication with dual-token system stored in HttpOnly cookies.

### Token Generation
**Access Token**:
- Signed with `TOKEN_SECRET` environment variable
- Stored in cookie named `token`
- HttpOnly, Secure (production), SameSite=Strict
- Expires: Not specified in code (typically short-lived, e.g., 15 minutes)

**Refresh Token**:
- Signed with `REFRESH_TOKEN_SECRET` environment variable
- Stored in cookie named `refreshToken`
- HttpOnly, Secure (production), SameSite=Strict
- Expires: Not specified in code (typically long-lived, e.g., 7 days)

### Token Verification Flow
1. Request hits protected API route
2. `decodeToken` helper extracts cookies from request
3. Attempts to verify `token` cookie with `TOKEN_SECRET`
4. If access token invalid/expired, attempts to verify `refreshToken` with `REFRESH_TOKEN_SECRET`
5. If both fail, returns null (401 Unauthorized)
6. If valid, returns decoded payload with `userId`

### Automatic Token Refresh
- Client can call `/api/users/token` with refresh cookie
- Backend issues new access token
- New token set in response cookie

### Protected Routes
All routes under `/api/users/` (except login, register, token, user-verify, forgot-password) require authentication.

Frontend pages under `/user/dashboard/` are client-side protected (redirect to login if no token).

### Password Security
- Passwords hashed with bcryptjs (10 salt rounds)
- Password field excluded from queries by default (`select: false`)
- Minimum length: 6 characters (validated with Zod)

### Email Verification
- Required before full platform access (check `isVerified` flag)
- Token: bcrypt hash of userId
- Expiry: 10 minutes from generation
- Stored in `verificationToken` and `verificationTokenExpiry` fields

---

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.m8oca.mongodb.net/<dbname>?retryWrites=true&w=majority&appName=Cluster0

# JWT Secrets (generate with: openssl rand -base64 64)
TOKEN_SECRET=your_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL_DOMAIN=your_verified_email_domain

# AI (OpenAI)
OPENAI_API_KEY=your_openai_api_key

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
DOMAIN=http://localhost:3000
NODE_ENV=development
```

### Required Variables
- `MONGODB_URI`: MongoDB connection string
- `TOKEN_SECRET`: JWT access token signing secret
- `REFRESH_TOKEN_SECRET`: JWT refresh token signing secret
- `RESEND_API_KEY`: Resend API key for email sending
- `FROM_EMAIL_DOMAIN`: Verified sender domain in Resend (e.g., `yourapp.com`)
- `OPENAI_API_KEY`: OpenAI API key for GPT model access
- `STRIPE_SECRET_KEY`: Stripe secret key for payment processing
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- `DOMAIN`: Full application URL (used in email links and Stripe redirects)

### Optional Variables
- `NODE_ENV`: Set to `production` in production environments

### Next.js Configuration (`next.config.ts`)
```typescript
{
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
}
```

### TypeScript Configuration (`tsconfig.json`)
- Target: ES2017
- Module: esnext
- Module Resolution: bundler
- Path Alias: `@/*` → `./src/*`
- Strict mode enabled

### PostCSS Configuration (`postcss.config.mjs`)
Uses `@tailwindcss/postcss` plugin for Tailwind CSS 4.

---

## Installation

### Prerequisites
- Node.js >= 20
- pnpm (recommended) or npm
- MongoDB instance (local or Atlas)
- OpenAI API account
- Stripe account
- Resend account with verified domain

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/your-username/resumind.git
cd resumind
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all required values:
- MongoDB URI from MongoDB Atlas or local instance
- Generate JWT secrets: `openssl rand -base64 64` (run twice for two different secrets)
- Create Resend account, verify domain, get API key
- Create OpenAI account, get API key
- Create Stripe account, get secret key and webhook secret
- Set DOMAIN to `http://localhost:5000` for local development

4. **Set up Stripe webhooks locally** (optional for testing payments)
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```
Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `.env.local`

5. **Start development server**
```bash
pnpm dev
```

The application will be available at `http://localhost:5000` (default port in package.json).

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev --turbopack` | Start development server on port 5000 with Turbopack |
| `build` | `next build` | Build production bundle |
| `start` | `next start` | Start production server on port 5000 |
| `lint` | `next lint` | Run ESLint on codebase |
| `typecheck` | `tsc --noEmit` | Run TypeScript type checking without emitting files |
| `format` | `prettier --write .` | Format all files with Prettier |
| `format:check` | `prettier --check .` | Check formatting without modifying files |

### Development Workflow
```bash
# Development
pnpm dev          # Start dev server with hot reload

# Type safety
pnpm typecheck    # Check TypeScript errors

# Code quality
pnpm lint         # Check ESLint rules
pnpm format       # Auto-format code

# Production
pnpm build        # Build for production
pnpm start        # Run production server
```

---

## Dependencies

### Core Dependencies
- **next** (16.1.6): Full-stack React framework with App Router
- **react** (19.2.4): UI library
- **react-dom** (19.2.4): React DOM renderer
- **typescript** (5.9.3): TypeScript language

### Database
- **mongoose** (9.3.0): MongoDB ORM with schema validation

### Authentication
- **jose** (6.2.1): JWT creation and verification
- **bcryptjs** (3.0.3): Password hashing

### AI & LangChain
- **langchain** (1.2.31): LLM application framework
- **@langchain/core** (1.1.32): LangChain core abstractions
- **@langchain/openai** (1.2.13): OpenAI integration for LangChain

### File Processing
- **pdf-parse** (1.1.1): PDF text extraction
- **pdf-lib** (1.17.1): PDF document creation and modification
- **mammoth** (1.12.0): DOCX text extraction

### Payments
- **stripe** (20.4.1): Stripe payment processing

### Email
- **resend** (6.9.3): Modern email API

### Validation
- **zod** (4.3.6): TypeScript-first schema validation

### UI Components
- **@radix-ui/react-dialog** (1.1.15): Modal dialogs
- **@radix-ui/react-toast** (1.2.15): Toast notifications
- **@base-ui/react** (1.2.0): Base UI primitives
- **lucide-react** (0.577.0): Icon library

### Styling
- **tailwindcss** (4.2.1): Utility-first CSS framework
- **@tailwindcss/postcss** (4.2.1): Tailwind PostCSS plugin
- **tailwind-merge** (3.5.0): Merge Tailwind classes intelligently
- **class-variance-authority** (0.7.1): CVA for component variants
- **clsx** (2.1.1): Conditional class names
- **tw-animate-css** (1.4.0): Tailwind animation utilities

### Development
- **prettier** (3.8.1): Code formatter
- **@types/node** (25.4.0): Node.js type definitions
- **@types/react** (19.2.14): React type definitions
- **@types/react-dom** (19.2.3): React DOM type definitions
- **@types/pdf-parse** (1.1.5): pdf-parse type definitions

---

## Development Notes

### Import Alias
The project uses `@/*` as an alias for `src/*`. Example:
```typescript
import { connectDB } from "@/lib/db"
import { Button } from "@/components/ui/button"
```

### API Response Pattern
All API routes use standardized response helpers from `src/helpers/apiUtils.ts`:
```typescript
// Success
return NextResponse.json({ success: true, data: { } }, { status: 200 })

// Error
return NextResponse.json({ success: false, error: "message" }, { status: 400 })
```

### Database Connection
MongoDB connection uses a singleton pattern to prevent multiple connections in development:
```typescript
import { connectDB } from "@/lib/db"

await connectDB() // Safe to call multiple times
```

### Password Operations
Always use the hash utility:
```typescript
import { hashPassword, verifyPassword } from "@/lib/hash"

const hashed = await hashPassword(plainPassword)
const isValid = await verifyPassword(plainPassword, hashedPassword)
```

### Token Decoding
Use the centralized helper for JWT verification:
```typescript
import { decodeToken } from "@/helpers/decodeToken"

const payload = await decodeToken(req)
const userId = payload?.userId
```

### Zod Validation Pattern
All inputs validated with Zod before processing:
```typescript
import { userLoginSchema } from "@/schemas/userSchema"

const parsed = userLoginSchema.safeParse(body)
if (!parsed.success) {
  return NextResponse.json({ 
    success: false, 
    error: parsed.error.issues[0]?.message 
  }, { status: 400 })
}
```

### LangChain Agent Usage
Agent is a singleton for performance:
```typescript
import { getResumeAgent } from "@/helpers/resumeAgent"

const agent = getResumeAgent()
const result = await agent.run(request, options)
```

### Credit Costs
Credit costs are defined in `src/schemas/resumeAgentSchema.ts`:
```typescript
export const RESUME_TASK_CREDIT_COST = {
  full_resume_analysis: 5
}

export const JD_ANALYSIS_CREDIT_COST = 5
```

### Toast Notifications
Use the custom hook:
```typescript
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()
toast({
  title: "Success",
  description: "Operation completed",
  variant: "default" // or "destructive"
})
```

### Responsive Design
Mobile breakpoint hook:
```typescript
import { useMobile } from "@/hooks/use-mobile"

const isMobile = useMobile()
```

---

## Deployment

### Build Process
```bash
pnpm build
```
This creates an optimized production build in `.next/` directory.

### Production Server
```bash
pnpm start
```
Starts the Next.js production server on port 5000.

### Environment Requirements
- Node.js >= 20
- All environment variables set (see [Configuration](#configuration))
- MongoDB instance accessible from deployment environment
- Stripe webhook endpoint configured to point to production URL

### Stripe Webhook Configuration
1. Log in to Stripe Dashboard
2. Go to Developers → Webhooks
3. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Select events: `checkout.session.completed`, `checkout.session.expired`
5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` environment variable

### MongoDB Setup
- Use MongoDB Atlas free tier or self-hosted instance
- Ensure IP whitelist includes deployment server IP (or 0.0.0.0/0 for serverless)
- Connection string format: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>`

### Domain Configuration
- Set `DOMAIN` environment variable to production URL (e.g., `https://resumind.app`)
- Update Resend sender domain if using custom domain
- Ensure domain is verified in Resend dashboard

### Deployment Platforms
This Next.js application can be deployed to:
- **Vercel**: Zero-config deployment with automatic CI/CD
- **AWS**: Using Elastic Beanstalk, EC2, or serverless with Lambda
- **Google Cloud**: App Engine or Cloud Run
- **Azure**: App Service
- **DigitalOcean**: App Platform or Droplet
- **Railway**: Simple deployment with automatic scaling

### Performance Considerations
- Next.js uses Turbopack in development for faster builds
- Production build optimizes for performance
- Images served via Next.js Image Optimization (configured for unsplash.com)
- MongoDB connection pooling handled by Mongoose
- LangChain agent uses singleton pattern to avoid re-initialization

---

## License

MIT License - see repository for details.

---

## Support

For issues or questions:
- Email: support@resumind.app (as seen in landing page)
- GitHub Issues: Create an issue in the repository

---

**Built with ❤️ using Next.js, OpenAI, and LangChain**
