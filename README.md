# Egyptian LMS

This project is a learning management system built for educational workflows in Egypt. It brings together student access, admin management, course content, assessments, videos, and payment flows in one application.

The project does not include a fixed academy or teacher identity by default. Branding and identity details can be configured inside the application settings when needed.

## Features

- Student portal for lessons, activities, and progress tracking
- Teacher and admin dashboard for managing content and users
- Homework submission and review workflows
- Assessments and quiz-based learning
- Video-based learning with protected media handling
- Payment and order management
- Configurable app settings and branding

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Drizzle ORM
- Better Auth
- PostgreSQL

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create your environment file:
   ```bash
   copy .env.example .env.local
   ```
   or create `.env.local` manually with the required values.

3. Update the environment variables for your database, auth, media, and payment services.

4. Push the database schema:
   ```bash
   pnpm db:push
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

## Available Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm db:generate
pnpm db:push
pnpm db:seed
```

## Project Structure

```bash
src/
├── app/            # Next.js app routes and pages
├── components/     # Shared UI components
├── features/       # Feature-specific modules
├── lib/            # Utilities, config, DB, and helpers
├── public/         # Static assets
└── styles/         # Global styling
```

## Notes

- Make sure environment variables are configured before running the app.
- The app is designed to support custom branding without hardcoding a specific academy or teacher name.
