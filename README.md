
# Resumind

An AI-powered resume analysis platform built with Next.js, TypeScript, MongoDB, and OpenAI/LangChain.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Screenshots](#screenshots)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Environment Variables](#environment-variables)
7. [Getting Started](#getting-started)
8. [Useful Scripts](#useful-scripts)
9. [API Overview](#api-overview)
10. [Main User Routes](#main-user-routes)
11. [Error Handling](#error-handling)
12. [Credits & Payments](#credits--payments)
13. [PDF Generation](#pdf-generation)
14. [Troubleshooting](#troubleshooting)
15. [Contributing](#contributing)

---

## Overview

Resumind is a full-stack platform for resume analysis, job matching, and CV improvement. It leverages AI to provide actionable feedback, ATS scoring, and PDF generation. Users can manage their accounts, purchase credits, and track their analysis and transaction history.

---

## Features

- **Authentication**: JWT auth with refresh token flow (`login`, `register`, `logout`, `forgot/reset`, `verify`).
- **Credit Wallet**: Stripe checkout, credit verification, and deduction on usage.
- **Resume Extraction**: Supports PDF, DOCX, TXT formats.
- **AI Resume Analysis**: Uses OpenAI/LangChain, Zod schema validation.
- **CV + JD Analysis**: ATS score, recommendations, and job matching.
- **PDF Generation**: Improved CV generation, downloadable as PDF.
- **History Tracking**: Analysis history, transaction history, detail pages, PDF export.
- **Responsive UI**: Custom sidebar, cards, toast system, Radix UI, Tailwind CSS.

---


## Screenshots & Explanations

### Home Dashboard
**Main landing page after login.**
Shows a summary of user credits, recent analyses, and quick access to core features. The sidebar provides navigation to dashboard sections.
![Dashboard](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488555/Screenshot_2026-03-14_at_16-42-22_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_racm0w.png)

### Authentication Pages
#### Sign In
**User login form.**
Allows users to authenticate with email and password, including error handling and password reset links.
![Sign In](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488483/Screenshot_2026-03-14_at_16-35-59_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_fc5jfa.png)

#### Sign Up
**User registration form.**
Enables new users to create an account, with validation and email verification flow.
![Sign Up](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488483/Screenshot_2026-03-14_at_16-36-11_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_vdzg54.png)

### Dashboard Overview
**User dashboard with navigation sidebar.**
Displays credit balance, quick links to analysis, transaction history, and profile settings. Responsive layout for desktop and mobile.
![Dashboard](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488935/Screenshot_2026-03-14_at_16-48-44_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_trmq6f.png)

### Transaction History
**List of all credit transactions.**
Shows purchases, deductions, and refunds. Users can filter and review their payment history.
![Transaction History](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488484/Screenshot_2026-03-14_at_16-37-21_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_pgoq47.png)

### Resume Analysis History
**History of all resume analyses performed.**
Users can view past analyses, download reports, and revisit recommendations for each resume.
![Resume Analysis History](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488482/Screenshot_2026-03-14_at_16-37-14_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_vxe8ug.png)

### Credits Page
**Credit wallet and purchase options.**
Displays current credit balance, allows users to buy more credits via Stripe, and shows credit usage history.
![Credits](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488483/Screenshot_2026-03-14_at_16-37-28_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_owj1si.png)

### CV + Job Description Analysis
**AI-powered CV and job description comparison.**
Users upload their CV and a job description to receive ATS scoring, recommendations, and match analysis.
![CV JD Analysis](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488482/Screenshot_2026-03-14_at_16-37-06_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_ssoady.png)

### Profile Settings
**User profile management.**
Edit personal information, change password, and manage notification preferences.
![Profile Settings](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488483/Screenshot_2026-03-14_at_16-37-42_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_r68gqo.png)

### Analysis Detail Page
**Detailed view of a single resume analysis.**
Shows the full report, recommendations, ATS score, and download options for PDF export.
![Analysis Detail](https://res.cloudinary.com/dvdktrhsz/image/upload/v1773488483/Screenshot_2026-03-14_at_16-37-58_Resumind_-_An_Ai-Powered_Resume_Builder_and_Analysis_Tool_ni50bl.png)

---

## Tech Stack

- **Frontend**: Next.js App Router, React 19, TypeScript, Tailwind CSS 4, Radix UI, custom UI primitives
- **Backend**: Node.js, MongoDB, Mongoose
- **AI**: LangChain, OpenAI
- **Payments**: Stripe
- **PDF Tools**: pdf-lib, pdf-parse, mammoth

---

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

---

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

---

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```
2. **Run development server:**
   ```bash
   pnpm dev
   ```
3. **Open in browser:**
   ```text
   http://localhost:3000
   ```

---

## Useful Scripts

- `pnpm dev` - start local dev server
- `pnpm build` - production build
- `pnpm start` - run production server
- `pnpm lint` - run linting
- `pnpm typecheck` - run TypeScript checks
- `pnpm format` - format code with Prettier
- `pnpm format:check` - validate formatting

---

## API Overview

### Standardized Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": {}
}
```

### Example Success Response

```json
{
  "success": true,
  "data": { /* ... */ }
}
```

### Common Endpoints

- `/api/users/login` - User authentication
- `/api/users/register` - User registration
- `/api/users/credits/checkout` - Stripe checkout
- `/api/users/resume/analyze` - Resume analysis
- `/api/users/resume/history` - Analysis history
- `/api/users/profile` - Profile management

---

## Main User Routes

- `/user/login` - Login page
- `/user/register` - Registration page
- `/user/reset-password` - Password reset
- `/user/dashboard` - Main dashboard
- `/user/dashboard/analyze` - Resume analysis
- `/user/dashboard/jd-analysis` - Job description analysis
- `/user/dashboard/history` - Analysis history
- `/user/dashboard/transactions` - Transaction history
- `/user/dashboard/credits` - Credits management

---

## Error Handling

- All API errors return `{ success: false, error: string, details?: object }`.
- Client-side errors are shown via toast notifications.
- Backend logs errors for debugging.

---

## Credits & Payments

- Credits are deducted on analysis and tracked in transaction history.
- Stripe checkout is used for purchasing credits.
- Credit verification is performed before each analysis.

---

## PDF Generation

- Improved CV generation using pdf-lib, pdf-parse, mammoth.
- Downloadable PDF reports for analysis and history.
- Binary responses from API routes for PDF downloads.

---

## Troubleshooting

- Ensure all environment variables are set in `.env.local`.
- MongoDB must be running and accessible.
- Stripe keys must be valid for payments.
- OpenAI API key required for AI analysis.
- Run `pnpm lint` and `pnpm typecheck` to check for code issues.

---

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes with clear messages.
4. Submit a pull request and describe your changes.
5. Ensure all tests pass and code is formatted.

---

## License

MIT License. See [LICENSE](LICENSE) for details.
