# Resumind

Resumind is an AI-powered resume analysis platform built with Next.js, TypeScript, MongoDB, and OpenAI/LangChain.

It provides:

- auth + user account management
- credit-based usage with Stripe checkout
- CV vs Job Description analysis
- improved CV PDF generation
- analysis history and transaction history

## Core Features

- JWT auth with refresh token flow (`login`, `register`, `logout`, `forgot/reset`, `verify`)
- Credit wallet + Stripe checkout + verification
- Resume text extraction from PDF/DOCX/TXT
- AI resume analysis with structured schema validation (Zod)
- CV + JD analysis with ATS score and recommendation output
- Improved CV generation as downloadable PDF
- Analysis history detail pages and PDF export/report tools
- Responsive dashboard UI with custom sidebar, cards, and toast system

## Tech Stack

- Next.js App Router
- React 19 + TypeScript
- MongoDB + Mongoose
- LangChain + OpenAI
- Stripe
- Tailwind CSS 4
- Radix UI + custom UI primitives
- pdf-lib, pdf-parse, mammoth

## Project Structure

```text
src/
  app/
    api/
      users/
        credits/
        forgot-password/
        login/
        logout/
        profile/
        register/
        resume/
          analyze/
          extract-text/
          history/
          jd-analysis/
          pdf-analysis/
        token/
        user-verify/
    user/
      dashboard/
      login/
      register/
      reset-password/
      verify/
      verify-token/
  helpers/
  lib/
  models/
  schemas/
  services/
```

## Environment Variables

Create `.env.local` in the project root:

```bash
# Database
MONGODB_URI=

# Auth
TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

# Email (Resend)
RESEND_API_KEY=
FROM_EMAIL_DOMAIN=

# AI
OPENAI_API_KEY=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Runtime
NODE_ENV=development
DOMAIN=http://localhost:3000
```

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

1. Run development server:

```bash
pnpm dev
```

1. Open:

```text
http://localhost:3000
```

## Useful Scripts

- `pnpm dev` - start local dev server
- `pnpm build` - production build
- `pnpm start` - run production server
- `pnpm lint` - run linting
- `pnpm typecheck` - run TypeScript checks
- `pnpm format` - format code with Prettier
- `pnpm format:check` - validate formatting

## Main User Routes

- `/user/login`
- `/user/register`
- `/user/reset-password`
- `/user/dashboard`
- `/user/dashboard/analyze`
- `/user/dashboard/jd-analysis`
- `/user/dashboard/history`
- `/user/dashboard/transactions`
- `/user/dashboard/credits`

## Notes

- API error responses are standardized as `{ success: false, error: string }` with optional extra fields like `details`
- Credits are deducted on usage routes and tracked in transaction history
- Generated PDFs are returned as binary responses from API routes
