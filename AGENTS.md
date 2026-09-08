<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Egyptian LMS (Tablawy OS) - Agent Architecture & Modern Next.js Guidelines

This document provides non-negotiable architectural mandates, coding patterns, and verification standards for all AI agents working on this repository. Follow these rules to avoid breaking modernized Next.js App Router patterns, type safety, and domain-specific conventions.

---

## 1. Absolute Golden Rules (Never Break or Regress)

1. **Keep Server Components by Default ("Move Client Components to the Leaves"):**
   - Never add `"use client"` to the top of `page.tsx` or `layout.tsx` unless there is an inescapable requirement (e.g. legacy client-only context providers).
   - Any page needing `generateMetadata()` or `export const metadata` **MUST remain a Server Component**.
   - Client interactivity (`useState`, `useEffect`, `framer-motion`, event handlers, Refine client hooks) must be encapsulated inside leaf components under `src/features/*/components/`.

2. **Never Regress to Hard Page Reloads:**
   - **STRICTLY FORBIDDEN:** Calling `window.location.reload()`, `window.location.href = ...`, or using native `<a>` tags for internal navigation.
   - **REQUIRED:** Use Next.js `<Link>` from `next/link` with automatic prefetching. Use `useRouter()` from `next/navigation` for imperative navigation, and `router.refresh()` or TanStack Query / Refine `refetch()` for revalidation.

3. **Preserve Tiered Error Handling & Crash Boundaries:**
   - **`src/app/global-error.tsx`** is mandatory. It catches root layout crashes. It **MUST** define its own `<html>` and `<body>` tags, provide a retry action (`reset()`), display error digests, and offer a pre-filled WhatsApp emergency report link.
   - **`src/app/error.tsx`**, **`src/app/portal/error.tsx`**, and **`src/app/admin/error.tsx`** are scoped boundaries. They are `"use client"` components with 3D illustrations (`src/components/ui/error-illustrations.tsx`), session preservation, and actionable error telemetry. Never delete or bypass them.

4. **Preserve Visual Not-Found Hierarchies (`not-found.tsx`):**
   - Root (`src/app/not-found.tsx`), Portal (`src/app/portal/not-found.tsx`), and Admin (`src/app/admin/not-found.tsx`) must feature rich 3D vector illustrations (`src/components/ui/not-found-illustrations.tsx`), audio speech assistance (Web Speech API), smart search jump bars, and contextual fallback buttons.
   - When a resource is missing in a Server Component (e.g. invalid lesson slug or unit slug), invoke `notFound()` from `next/navigation`.

5. **Maintain Route Groups `(auth)`:**
   - Authentication routes (`/student-login`, `/student-register`) must remain organized inside `src/app/(auth)/`.
   - Shared authentication layout shell (`src/app/(auth)/layout.tsx`) prevents component remounting and layout shift when toggling between login and register tabs.
   - Clean URLs (`/student-login`, `/student-register`) are preserved without exposing `(auth)` in the URL. Do not create duplicate files at `src/app/student-login/page.tsx`.

6. **Preserve Streaming Loading Skeletons (`loading.tsx`):**
   - `src/app/loading.tsx` (root branded halo loader), `src/app/portal/loading.tsx` (student dashboard skeleton), and `src/app/admin/loading.tsx` (admin table & metric skeleton) must be maintained to provide instant visual feedback during Server Component streaming.

7. **Dynamic OpenGraph & Arabic Ligature Limitation:**
   - **NEVER** attempt to generate dynamic OpenGraph images via `@vercel/og` (`ImageResponse`) with custom Arabic OTF/TTF fonts containing complex OpenType substitution tables (`lookupType: 5 - substFormat: 3`), as Satori engine will crash at build time.
   - Always reference pre-rendered, high-resolution static assets (e.g. `/icon-512.png` or SVG assets in `public/`) for OpenGraph and Twitter card metadata.

8. **Refine v5 & i18n Synchronization:**
   - The student enrollment resource is strictly named `enrollments` (never revert to `teacher-subscriptions`).
   - Synchronize any resource changes across:
     - `src/providers/access-control/`
     - `src/config/resources.tsx`
     - `src/i18n/` locales (default translations consolidated in namespaces: `common`, `classes`, etc.).

9. **Student Learning Route Privacy:**
   - Private student learning segments (`src/app/portal/lesson/[lessonSlug]/layout.tsx` and `src/app/portal/quiz/[quizId]/layout.tsx`) **MUST** maintain `robots: { index: false, follow: false }` to protect proprietary curriculum from web crawlers.

---

## 2. Directory Structure & Architecture

The application adheres to Feature-Sliced Design (FSD) hybrid conventions:

```
src/
├── app/                                 # Next.js App Router routes
│   ├── (auth)/                          # Route group for authentication
│   │   ├── layout.tsx                   # Shared auth layout (AuthLayoutShell)
│   │   ├── student-login/page.tsx       # /student-login
│   │   └── student-register/page.tsx    # /student-register
│   ├── admin/                           # Administrative portal
│   │   ├── error.tsx                    # Admin error boundary
│   │   ├── loading.tsx                  # Admin skeleton loader
│   │   ├── not-found.tsx                # Admin 404 handler
│   │   └── ...                          # Admin sub-routes
│   ├── portal/                          # Student learning portal
│   │   ├── error.tsx                    # Student portal error boundary
│   │   ├── layout.tsx                   # Student portal layout
│   │   ├── loading.tsx                  # Student portal skeleton loader
│   │   ├── not-found.tsx                # Student portal 404 handler
│   │   ├── dashboard/page.tsx           # Student dashboard
│   │   ├── learn/[unitSlug]/page.tsx    # Server Component unit view
│   │   ├── lesson/[lessonSlug]/         # Lesson viewer + private layout
│   │   └── quiz/[quizId]/               # Quiz engine + private layout
│   ├── api/                             # Route handlers (REST endpoints)
│   ├── error.tsx                        # Root application error boundary
│   ├── global-error.tsx                 # Root catastrophic crash boundary
│   ├── layout.tsx                       # Root layout (Metadata, fonts, providers)
│   ├── loading.tsx                      # Root loading skeleton
│   ├── not-found.tsx                    # Root 404 page
│   └── page.tsx                         # Landing page (Server Component)
├── features/                            # Domain-driven feature slices
│   ├── admin-students/                  # Student management logic & components
│   ├── auth/                            # Authentication forms & hooks
│   ├── checkout/                        # Paymob & wallet payment modals
│   ├── landing/                         # Landing page sections & client shells
│   ├── portal-dashboard/                # Student dashboard widgets & ID card modal
│   ├── portal-learn/                    # Unit & lecture player client components
│   └── quiz-engine/                     # Anti-cheat & interactive quiz runner
├── components/                          # Shared UI primitives and icons
│   ├── layout/                          # Header, footer, and navigation
│   └── ui/                              # Button, dialog, error & 404 illustrations
├── providers/                           # Refine, auth, and theme providers
└── lib/                                 # Shared utilities, DB client, types
```

---

## 3. Mandatory Component Implementation Patterns

### Pattern A: Server Component Page with Dynamic Metadata
```tsx
// src/app/portal/learn/[unitSlug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { UnitLearnClient } from '@/features/portal-learn/components/unit-learn-client';

interface PageProps {
  params: Promise<{ unitSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { unitSlug } = await params;
  const unit = await getUnitData(unitSlug);
  if (!unit) return { title: 'الوحدة غير موجودة' };
  
  return {
    title: unit.title,
    description: unit.description,
  };
}

export default async function UnitLearnPage({ params }: PageProps) {
  const { unitSlug } = await params;
  const unit = await getUnitData(unitSlug);
  if (!unit) notFound();

  return <UnitLearnClient unit={unit} />;
}
```

### Pattern B: Isolated Client Leaf Component
```tsx
// src/features/portal-learn/components/unit-learn-client.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function UnitLearnClient({ unit }: { unit: UnitData }) {
  const [selectedLesson, setSelectedLesson] = useState(unit.lessons[0]);
  const router = useRouter();

  return (
    <div>
      {/* Client interactivity, video player, and state */}
    </div>
  );
}
```

### Pattern C: Resilient Error Boundary
```tsx
// src/app/portal/error.tsx
'use client';

import { useEffect } from 'react';
import { StudentPortalErrorSvg } from '@/components/ui/error-illustrations';

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Portal Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <StudentPortalErrorSvg className="w-48 h-48 mb-6" />
      <h2 className="text-2xl font-bold">حدث خطأ أثناء تحميل بيانات الطالب</h2>
      {error.digest && <p className="text-xs text-muted-foreground mt-2">كود الخطأ: {error.digest}</p>}
      <button onClick={() => reset()} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg">
        إعادة المحاولة
      </button>
    </div>
  );
}
```

---

## 4. Verification Protocol (Required Before Completing Any Task)

Every agent completing modifications in this repository **MUST** execute and pass these checks:

1. **TypeScript Verification:**
   ```bash
   pnpm tsc --noEmit
   ```
   *Expected: Exit Code 0 (0 type errors).*

2. **Next.js Production Build:**
   ```bash
   pnpm build
   ```
   *Expected: Exit Code 0 across all routes without Turbopack compilation errors.*

3. **Git Cleanliness:**
   ```bash
   git status -s
   ```
   *Ensure no unintended files, broken paths, or missing imports exist.*

4. **Communication Standard:**
   - All user explanations must be written in **English**.
   - All file and symbol references must use clickable markdown links with `file:///` and forward slashes.

