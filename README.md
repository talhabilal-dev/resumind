# Resumind — AI-Powered Resume Analysis Platform

> Upload your resume, get instant AI feedback, match it against job descriptions, and download a polished PDF — all in one place.

<p align="left">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
  <img src="https://img.shields.io/badge/LangChain-000000?style=for-the-badge&logo=langchain&logoColor=white" alt="LangChain" />
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
</p>

---

## Table of Contents

1. [What is Resumind?](#what-is-resumind)
2. [Features at a Glance](#features-at-a-glance)
3. [Screenshots](#screenshots)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [How the App Works](#how-the-app-works)
   - [Authentication Flow](#authentication-flow)
   - [AI Analysis Pipeline](#ai-analysis-pipeline)
   - [Credit & Payment System](#credit--payment-system)
   - [PDF Generation](#pdf-generation)
7. [Environment Variables](#environment-variables)
8. [Getting Started](#getting-started)
   - [Running Locally](#running-locally)
   - [Running on Replit](#running-on-replit)
9. [Scripts Reference](#scripts-reference)
10. [API Reference](#api-reference)
    - [Authentication](#authentication-endpoints)
    - [Resume](#resume-endpoints)
    - [Credits & Payments](#credits--payments-endpoints)
    - [Profile](#profile-endpoints)
11. [Page Routes](#page-routes)
12. [Data Models](#data-models)
13. [Error Handling](#error-handling)
14. [Troubleshooting](#troubleshooting)
15. [Contributing](#contributing)
16. [License](#license)

---

## What is Resumind?

Resumind is a full-stack web application that helps job seekers improve their resumes using AI. You upload your CV (PDF, DOCX, or TXT), and the app extracts the text, runs it through an OpenAI-powered LangChain agent, and gives you:

- An **ATS (Applicant Tracking System) score** out of 100
- Specific, actionable **improvement recommendations**
- A **job description match analysis** — paste any JD and see how well your CV aligns
- A **downloadable improved PDF** of your resume

The platform uses a credit-based billing model: users buy credits via Stripe and spend them on analyses.

---

## Features at a Glance

| Feature | Description |
|---|---|
| JWT Authentication | Secure login/register with access + refresh token flow |
| Email Verification | Account verification and password reset via Resend |
| Resume Upload | Supports PDF, DOCX, and TXT formats |
| AI Resume Analysis | ATS scoring and improvement suggestions via LangChain + OpenAI |
| CV + JD Matching | Paste a job description to get a targeted match score and tips |
| Improved PDF Export | Generates a polished, downloadable PDF of the improved resume |
| Credit Wallet | Buy credits via Stripe, spend them on analyses |
| History & Transactions | Full history of analyses and credit transactions |
| Responsive UI | Works on desktop and mobile; dark mode by default |

---

## Screenshots

### Home / Landing Page

The main entry point for new and returning users.

![Home](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488555/Screenshot_2026-03-14_at_16-42-22_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_racm0w.png)

---

### Sign In

Email and password login with error handling and a "forgot password" link.

![Sign In](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488483/Screenshot_2026-03-14_at_16-35-59_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_fc5jfa.png)

---

### Sign Up

New user registration with real-time validation and email verification flow.

![Sign Up](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488483/Screenshot_2026-03-14_at_16-36-11_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_vdzg54.png)

---

### Dashboard

The user's home base: credit balance, recent analyses, and quick navigation via sidebar.

![Dashboard](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488935/Screenshot_2026-03-14_at_16-48-44_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_trmq6f.png)

---

### Resume Analysis

Upload your CV and get an instant ATS score and detailed recommendations.

![Resume Analysis](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488482/Screenshot_2026-03-14_at_16-37-06_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_ssoady.png)

---

### CV + Job Description Analysis

Paste any job description alongside your CV for a targeted match report.

![CV JD Analysis](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488482/Screenshot_2026-03-14_at_16-37-06_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_ssoady.png)

---

### Analysis Detail

Full report for a single analysis: ATS score, suggestions, and PDF download.

![Analysis Detail](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488483/Screenshot_2026-03-14_at_16-37-58_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_ni50bl.png)

---

### Analysis History

Browse all past analyses. Revisit reports or download PDFs at any time.

![Analysis History](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488482/Screenshot_2026-03-14_at_16-37-14_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_vxe8ug.png)

---

### Credits Page

Buy more credits via Stripe and view your current balance.

![Credits](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488483/Screenshot_2026-03-14_at_16-37-28_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_owj1si.png)

---

### Transaction History

Full log of credit purchases, deductions, and refunds.

![Transaction History](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488484/Screenshot_2026-03-14_at_16-37-21_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_pgoq47.png)

---

### Profile & Settings

Edit your display name, email, change your password, and manage your account.

![Profile Settings](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488483/Screenshot_2026-03-14_at_16-37-42_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_r68gqo.png)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, Radix UI, custom UI primitives |
| Fonts | Space Grotesk, Rajdhani, Inter (Google Fonts) |
| Database | MongoDB via Mongoose |
| Auth | JWT (jose) — access token + refresh token |
| AI | LangChain + OpenAI GPT |
| Email | Resend |
| Payments | Stripe (Checkout + Webhooks) |
| PDF | pdf-lib (generation), pdf-parse (extraction), mammoth (DOCX) |
| Validation | Zod |
| Package Manager | pnpm |

---

## Project Structure

```
resumind/
├── src/
│   ├── app/
│   │   ├── api/                        # All API route handlers (Next.js Route Handlers)
│   │   │   ├── stripe/
│   │   │   │   └── webhook/            # Stripe webhook handler (legacy path)
│   │   │   ├── webhooks/
│   │   │   │   └── stripe/             # Stripe webhook handler (primary path)
│   │   │   └── users/
│   │   │       ├── login/              # POST: authenticate user, issue tokens
│   │   │       ├── register/           # POST: create account
│   │   │       ├── logout/             # POST: clear auth cookies
│   │   │       ├── profile/            # GET/PUT: view and update profile
│   │   │       ├── change-password/    # POST: change password (authenticated)
│   │   │       ├── token/              # POST: refresh access token
│   │   │       ├── user-verify/
│   │   │       │   ├── route.ts        # POST: verify account with token
│   │   │       │   └── sent/           # POST: resend verification email
│   │   │       ├── forgot-password/
│   │   │       │   ├── sent/           # POST: send password reset email
│   │   │       │   └── verify/         # POST: verify reset token and set new password
│   │   │       ├── credits/
│   │   │       │   ├── checkout/       # POST: create Stripe checkout session
│   │   │       │   ├── status/         # GET: current credit balance
│   │   │       │   ├── transactions/   # GET: transaction history
│   │   │       │   └── verify/         # POST: confirm Stripe payment and credit user
│   │   │       └── resume/
│   │   │           ├── analyze/        # POST: run AI resume analysis (costs credits)
│   │   │           ├── extract-text/   # POST: extract text from uploaded file
│   │   │           ├── jd-analysis/    # POST: run CV + job description match (costs credits)
│   │   │           ├── history/        # GET: list all past analyses
│   │   │           └── history/[id]/   # GET: single analysis detail + DELETE
│   │   │
│   │   └── user/                       # Frontend pages (all require authentication)
│   │       ├── login/
│   │       ├── register/
│   │       ├── verify/                 # Email verification landing page
│   │       ├── verify/sent/            # "Check your email" page
│   │       ├── verify-token/           # Token-based verification redirect
│   │       ├── reset-password/         # Request password reset
│   │       ├── reset-password/verify/  # Set new password via reset link
│   │       └── dashboard/
│   │           ├── page.tsx            # Dashboard home
│   │           ├── layout.tsx          # Sidebar layout wrapper
│   │           ├── analyze/            # Resume upload and analysis UI
│   │           ├── jd-analysis/        # CV + JD comparison UI
│   │           ├── history/            # Analysis history list
│   │           ├── history/[id]/       # Single analysis detail view
│   │           ├── credits/            # Credit balance + Stripe checkout
│   │           ├── credits/verify/     # Post-payment verification page
│   │           ├── transactions/       # Credit transaction log
│   │           └── settings/           # Profile and password settings
│   │
│   ├── components/
│   │   └── ui/                         # Reusable UI components
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx             # App navigation sidebar
│   │       ├── skeleton.tsx            # Loading skeleton
│   │       ├── spinner.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       └── tooltip.tsx
│   │
│   ├── helpers/                        # Server-side utility functions
│   │   ├── apiUtils.ts                 # Shared API response helpers
│   │   ├── decodeToken.ts              # JWT decode and validation
│   │   ├── downloadBase64Pdf.ts        # Client-side PDF download trigger
│   │   ├── mailer.ts                   # Resend email sender (verification, reset)
│   │   ├── pdfAnalysisReport.ts        # Build improved PDF with pdf-lib
│   │   ├── refreshToken.ts             # Token refresh middleware helper
│   │   ├── resumeAgent.ts              # LangChain agent setup for resume analysis
│   │   └── resumeTool.ts               # LangChain tool definition for AI pipeline
│   │
│   ├── hooks/
│   │   ├── use-mobile.ts               # Responsive breakpoint detection
│   │   └── use-toast.ts                # Toast notification hook
│   │
│   ├── lib/
│   │   ├── db.ts                       # MongoDB connection singleton
│   │   ├── hash.ts                     # bcryptjs password hashing utilities
│   │   └── utils.ts                    # Tailwind cn() helper
│   │
│   ├── models/                         # Mongoose data models
│   │   ├── userModel.ts                # User account
│   │   ├── resumeModel.ts              # Resume analysis result
│   │   ├── jdAnalysisModel.ts          # CV + JD match result
│   │   ├── jobModel.ts                 # Job description snapshot
│   │   ├── transactionModel.ts         # Credit transaction log
│   │   └── stripeModel.ts              # Stripe session tracking
│   │
│   ├── schemas/                        # Zod validation schemas
│   │   ├── userSchema.ts               # User registration/login inputs
│   │   ├── resumeSchema.ts             # Resume analysis inputs
│   │   ├── resumeAgentSchema.ts        # AI agent output shape
│   │   ├── jdAnalysisSchema.ts         # JD analysis inputs and outputs
│   │   ├── pdfAnalysisSchema.ts        # PDF report data shape
│   │   └── creditsSchema.ts            # Credit checkout inputs
│   │
│   ├── services/
│   │   └── resumeService.ts            # Business logic for resume operations
│   │
│   ├── types/
│   │   └── index.ts                    # Shared TypeScript types and interfaces
│   │
│   └── proxy.ts                        # Internal request proxy utility
│
├── email/                              # Email templates (Resend)
├── .env.example                        # Template for required environment variables
├── next.config.ts                      # Next.js configuration
├── tsconfig.json                       # TypeScript configuration
├── postcss.config.mjs                  # PostCSS / Tailwind config
└── components.json                     # shadcn/ui component registry config
```

---

## How the App Works

### Authentication Flow

Resumind uses a dual-token JWT strategy:

1. **Access Token** — short-lived, stored in an `HttpOnly` cookie, sent with every API request.
2. **Refresh Token** — longer-lived, also `HttpOnly`. Used to silently issue a new access token when it expires.

The flow looks like this:

```
User logs in → API issues access token + refresh token (HttpOnly cookies)
                ↓
Any protected API route reads & verifies the access token
                ↓
If expired → /api/users/token refreshes it automatically
                ↓
User logs out → both cookies are cleared server-side
```

Email verification is required after registration. Password resets are handled via a time-limited token sent through Resend.

---

### AI Analysis Pipeline

When a user submits a resume for analysis:

```
1. File upload (PDF / DOCX / TXT)
        ↓
2. /api/users/resume/extract-text
   - pdf-parse for PDFs
   - mammoth for DOCX
   - plain read for TXT
        ↓
3. /api/users/resume/analyze
   - Credit check (deduct before processing)
   - LangChain agent (resumeAgent.ts) invokes OpenAI
   - Agent uses a custom LangChain Tool (resumeTool.ts)
   - Output validated with Zod (resumeAgentSchema.ts)
        ↓
4. Result saved to MongoDB (resumeModel.ts)
        ↓
5. Response includes: ATS score, recommendations, improved resume text
        ↓
6. User can download an improved PDF (pdfAnalysisReport.ts via pdf-lib)
```

For **CV + JD matching** (`/api/users/resume/jd-analysis`), the same pipeline runs but the agent receives both the resume text and the job description, and returns a match score plus targeted suggestions.

---

### Credit & Payment System

Credits are the currency of the platform. Each analysis costs a set number of credits.

```
User visits /dashboard/credits
        ↓
Clicks "Buy Credits" → POST /api/users/credits/checkout
   → Creates a Stripe Checkout Session
        ↓
User completes payment on Stripe-hosted page
        ↓
Stripe sends webhook → POST /api/webhooks/stripe
   → Credits added to user account
   → Transaction recorded (transactionModel.ts)
        ↓
User returns to /dashboard/credits/verify
   → GET /api/users/credits/verify confirms payment
```

Every analysis route calls `/api/users/credits/verify` before running, deducting the cost atomically.

---

### PDF Generation

When a user requests a PDF export of an analysis:

1. The improved resume text from the AI result is passed to `pdfAnalysisReport.ts`.
2. `pdf-lib` builds a formatted, multi-page PDF in memory.
3. The binary PDF is returned as a `application/pdf` response.
4. The client receives it and triggers a download via `downloadBase64Pdf.ts`.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values before running:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string (Atlas or self-hosted) |
| `TOKEN_SECRET` | Yes | Secret for signing access JWTs — use a long random string |
| `REFRESH_TOKEN_SECRET` | Yes | Secret for signing refresh JWTs — different from TOKEN_SECRET |
| `RESEND_API_KEY` | Yes | API key from [resend.com](https://resend.com) for sending emails |
| `FROM_EMAIL_DOMAIN` | Yes | Verified sender domain in Resend, e.g. `noreply@yourdomain.com` |
| `OPENAI_API_KEY` | Yes | OpenAI API key for the LangChain agent |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (`sk_live_...` or `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signing secret from your Stripe dashboard |
| `DOMAIN` | Yes | Full URL of your app, e.g. `https://yourapp.com` (used for email links) |
| `NODE_ENV` | No | `development` or `production` |

> **Tip:** Generate secure JWT secrets with:
> ```bash
> openssl rand -base64 64
> ```

---

## Getting Started

### Running Locally

Make sure you have **Node.js >= 20** and **pnpm** installed.

```bash
# 1. Clone the repository
git clone https://github.com/your-username/resumind.git
cd resumind

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in all required values

# 4. Start the development server
pnpm dev
```

The app will be available at `http://localhost:5000`.

> **MongoDB:** You'll need a running MongoDB instance. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) offers a free tier that works perfectly.

> **Stripe Webhooks locally:** Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhook events:
> ```bash
> stripe listen --forward-to localhost:5000/api/webhooks/stripe
> ```

---

### Running on Replit

The project is already configured for Replit. Just add your secrets in the **Secrets** tab (the lock icon in the sidebar):

| Secret Key | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `TOKEN_SECRET` | A long random string |
| `REFRESH_TOKEN_SECRET` | A different long random string |
| `RESEND_API_KEY` | Your Resend API key |
| `FROM_EMAIL_DOMAIN` | Your verified sender email |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook secret |
| `DOMAIN` | Your Replit app's public URL |

The `Start application` workflow runs `pnpm dev` automatically and the preview pane will show your app.

---

## Scripts Reference

| Script | Command | What it does |
|---|---|---|
| `dev` | `pnpm dev` | Start dev server on port 5000 with hot reload |
| `build` | `pnpm build` | Build for production |
| `start` | `pnpm start` | Start production server on port 5000 |
| `lint` | `pnpm lint` | Run ESLint |
| `typecheck` | `pnpm typecheck` | Run TypeScript compiler check (no output) |
| `format` | `pnpm format` | Auto-format all files with Prettier |
| `format:check` | `pnpm format:check` | Check formatting without writing |

---

## API Reference

All API routes live under `/api`. Authenticated routes require a valid `accessToken` cookie. All responses follow this shape:

**Success:**
```json
{
  "success": true,
  "data": { }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Human-readable message",
  "details": { }
}
```

---

### Authentication Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/users/register` | No | Create a new account |
| `POST` | `/api/users/login` | No | Log in, receive auth cookies |
| `POST` | `/api/users/logout` | Yes | Clear auth cookies |
| `POST` | `/api/users/token` | No | Refresh access token using refresh cookie |
| `POST` | `/api/users/user-verify` | No | Verify email address with token |
| `POST` | `/api/users/user-verify/sent` | Yes | Resend verification email |
| `POST` | `/api/users/forgot-password/sent` | No | Send password reset email |
| `POST` | `/api/users/forgot-password/verify` | No | Verify reset token and set new password |
| `POST` | `/api/users/change-password` | Yes | Change password (authenticated) |

---

### Resume Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/users/resume/extract-text` | Yes | Upload file and extract plain text |
| `POST` | `/api/users/resume/analyze` | Yes | Run AI analysis (costs credits) |
| `POST` | `/api/users/resume/jd-analysis` | Yes | Run CV + JD match analysis (costs credits) |
| `GET` | `/api/users/resume/history` | Yes | List all past analyses for the user |
| `GET` | `/api/users/resume/history/[id]` | Yes | Get a single analysis by ID |
| `DELETE` | `/api/users/resume/history/[id]` | Yes | Delete a single analysis |

**Request body for `/api/users/resume/analyze`:**
```json
{
  "resumeText": "Full plain text of the resume..."
}
```

**Request body for `/api/users/resume/jd-analysis`:**
```json
{
  "resumeText": "Full plain text of the resume...",
  "jobDescription": "Full text of the job posting..."
}
```

---

### Credits & Payments Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/credits/status` | Yes | Get current credit balance |
| `POST` | `/api/users/credits/checkout` | Yes | Create a Stripe Checkout session |
| `POST` | `/api/users/credits/verify` | Yes | Confirm payment and credit the account |
| `GET` | `/api/users/credits/transactions` | Yes | List all credit transactions |
| `POST` | `/api/webhooks/stripe` | No* | Stripe webhook handler |

> *The Stripe webhook verifies the request using the `STRIPE_WEBHOOK_SECRET` signature — it does not use session cookies.

---

### Profile Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/profile` | Yes | Get the current user's profile |
| `PUT` | `/api/users/profile` | Yes | Update profile fields (name, email) |

---

## Page Routes

| Path | Description |
|---|---|
| `/` | Landing page |
| `/user/login` | Sign in |
| `/user/register` | Create account |
| `/user/verify` | Email verification prompt |
| `/user/verify/sent` | Verification email sent confirmation |
| `/user/verify-token` | Token landing from email link |
| `/user/reset-password` | Request password reset |
| `/user/reset-password/verify` | Set a new password via reset link |
| `/user/dashboard` | Main dashboard (credit balance, quick actions) |
| `/user/dashboard/analyze` | Upload and analyze a resume |
| `/user/dashboard/jd-analysis` | CV + job description comparison |
| `/user/dashboard/history` | All past analyses |
| `/user/dashboard/history/[id]` | Single analysis detail and PDF download |
| `/user/dashboard/credits` | Credit wallet and buy credits |
| `/user/dashboard/credits/verify` | Post-Stripe payment confirmation |
| `/user/dashboard/transactions` | Full transaction history |
| `/user/dashboard/settings` | Profile settings and password change |

---

## Data Models

### User
```
_id, name, email, password (hashed), isVerified, credits, createdAt, updatedAt
```

### Resume Analysis
```
_id, userId, originalText, improvedText, atsScore, recommendations[], createdAt
```

### JD Analysis
```
_id, userId, resumeText, jobDescription, matchScore, suggestions[], createdAt
```

### Transaction
```
_id, userId, type (purchase | deduction), amount, description, createdAt
```

### Stripe Session
```
_id, userId, sessionId, status, creditsAmount, createdAt
```

---

## Error Handling

- All API routes return structured JSON errors (see [API Reference](#api-reference)).
- Client-side errors are displayed via a toast notification system.
- Zod validation errors are formatted and returned as `details` in the error response.
- JWT errors (expired, invalid) result in a `401` response, prompting the client to refresh or log in again.
- MongoDB connection errors are caught at the `lib/db.ts` singleton level.

---
