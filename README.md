<p align="center">
  <a href="https://github.com/galilio2023/egyptian-lms">
    <img src="./public/logo-full.svg" alt="Elite Academy Logo" width="520" />
  </a>
</p>

<h1 align="center">🌟 أكاديمية إيليت التعليمية — Elite Academy LMS</h1>

<p align="center">
  <strong>The Enterprise-Grade, Anti-Piracy EdTech Platform Engineered for the Egyptian Education Ecosystem.</strong><br/>
  <em>Next.js 16.3 (Turbopack) • React 19 • Tailwind CSS v4 • Drizzle ORM • Better Auth • Bunny.net DRM • Paymob & InstaPay</em>
</p>

<p align="center">
  <a href="https://github.com/galilio2023/egyptian-lms/actions"><img src="https://img.shields.io/badge/Next.js-16.3.4%20(Turbopack)-black?style=for-the-badge&logo=next.js" alt="Next.js 16" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://orm.drizzle.team"><img src="https://img.shields.io/badge/Drizzle%20ORM-0.45.2-C5F74F?style=for-the-badge&logo=drizzle" alt="Drizzle ORM" /></a>
  <a href="https://www.better-auth.com"><img src="https://img.shields.io/badge/Better%20Auth-1.7-8B5CF6?style=for-the-badge" alt="Better Auth" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind%20CSS-v4.0-38BDF8?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS v4" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
  <a href="https://github.com/galilio2023/egyptian-lms/pull/3"><img src="https://img.shields.io/badge/CodeRabbit-Reviewed%20%26%20Hardened-10B981?style=for-the-badge&logo=coderabbit" alt="CodeRabbit Audited" /></a>
</p>

---

## 📌 Repository Overview

| Property | Value |
| :--- | :--- |
| **Repository** | `galilio2023/egyptian-lms` |
| **Primary Domain** | Primary English Education (Grade 1 – Grade 6) — Mr. Ahmed Abdelrahman |
| **Market Target** | Egyptian Education Ecosystem (Egyptian Telecoms, Local Wallets, InstaPay, WhatsApp) |
| **Design Language** | Modern Arabic-First (RTL), High-Density Cairo Typography, Playful Gamified UI |
| **Security Posture** | Zero-Trust Webhooks (HMAC-SHA512), Single-Device Binding, Canvas DRM Watermarking, Strict RBAC |

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart TB
    subgraph ClientLayer ["📱 Multi-Platform Client Layer"]
        S["👦 Student Portal\n(Mobile / Tablet / PC)"]
        P["👨‍👩‍👧 Parent WhatsApp\n(Real-Time Loop)"]
        T["👨‍🏫 Teacher & Assistant CMS\n(/admin Backoffice)"]
    end

    subgraph SecurityAuth ["🛡️ Identity & Anti-Piracy Shield"]
        BA["Better Auth + Egyptian Phone Plugin\n(010, 011, 012, 015)"]
        DEV["Single-Device Lock Engine\n(Hardware Fingerprint + IP Binding)"]
        DRM["Dynamic Canvas Watermark Engine\n(Bouncing Name + Phone + Live IP)"]
    end

    subgraph CoreEngine ["⚡ Next.js 16 Application Services"]
        API["Next.js 16 App Router & Server Actions\n(Turbopack Engine)"]
        QUIZ["Interactive Anti-Cheat Quiz Engine\n(Tab-Blur Detection + Auto-Expiry)"]
        PEN["Canvas Pen Grader Studio\n(Multi-Page Canvas + Audio Notes)"]
        WA["Automated WhatsApp Gateway\n(HTTPS, Redacted Logs, 10s Timeout)"]
    end

    subgraph PaymentTriad ["💳 Egyptian Payment Triad"]
        PM["Paymob Direct API\n(Wallets & Meeza Cards + HMAC-SHA512)"]
        IP["InstaPay Transfer Desk\n(Receipt Screenshot Upload + Approval Queue)"]
        VC["Physical Scratch Vouchers\n(Cryptographic QR Code Generator)"]
    end

    subgraph StorageLayer ["🗄️ Persistence & Media Infrastructure"]
        DB[(Neon Serverless PostgreSQL\n+ Drizzle ORM)]
        CDN["Bunny.net Stream / Cloudflare HLS\n(Adaptive Bitrate + Native HLS fallback)"]
    end

    S --> BA --> DEV --> API
    S --> DRM --> CDN
    S --> QUIZ --> DB
    S --> PEN --> DB
    API --> PaymentTriad --> DB
    API --> WA --> P
    T --> PEN
    T --> API
```

---

## 🌟 Core Pillars & Key Features

### 1. 📱 Egyptian Mobile-First Authentication & Anti-Sharing
* **Zero-Friction Phone Sign-in:** Eliminates email requirements for elementary students. Registration and login rely directly on 11-digit Egyptian mobile numbers (`010`, `011`, `012`, `015`).
* **Hardware Single-Device Lock (فك حظر الجهاز):** Automatically binds a student’s account to their active device fingerprint. Simultaneous logins on another phone or computer are locked instantly until reset by the teacher/assistant from the backoffice.
* **Parent-Student Mobile Association:** Captures the guardian’s WhatsApp phone number at registration to form an unbreakable automated parent-communication channel.

### 2. 🎥 Anti-Piracy Video Streaming & Dynamic Canvas Watermark
* **Bunny.net / Cloudflare Stream HLS:** Adaptive bitrate streaming with automatic quality switching.
* **Bouncing Dynamic DRM Watermark:** A dedicated `<canvas>` overlays every video player frame, continuously animating the student's registered name, Egyptian phone number, and IP timestamp across the viewport to deter screen recording and piracy.
* **Egyptian Data-Saver Mode (باقة التوفير 📶):** One-click toggle that caps video quality to 360p/480p to conserve cellular data quotas for students on limited mobile bundles.

```mermaid
sequenceDiagram
    autonumber
    actor Student as 👦 Student Browser
    participant Video as 🎬 Protected Player
    participant Canvas as 🛡️ Watermark Canvas
    participant HLS as 📡 Bunny CDN Stream

    Student->>Video: Opens Lesson Video
    Video->>Canvas: Initialize Floating Watermark (Student Name + Phone + IP)
    Canvas->>Canvas: Continuous Render Loop (Dynamic Vector Overlay)
    Video->>HLS: Request Signed HLS Master Playlist (.m3u8)
    HLS-->>Video: Deliver Media Segments
    Note over Video,Canvas: If Screen Recording Attempted: Student Identifier Permanently Embedded
```

### 3. 📝 Interactive Anti-Cheat Exam Engine
* **Tab-Switch & Blur Sentry:** Monitors focus changes in real time. Switching away from the exam triggers strike warnings, with automatic forced submission upon 3 infractions.
* **Elapsed-Time Draft Recovery:** Draft answers and remaining countdown seconds are stored locally with tamper-proof timestamps. If a student closes the tab or refreshes, the elapsed seconds are deducted, preventing indefinite timer pauses.
* **Immediate Audio-Visual Celebration:** Features confetti animations, chime sound effects, XP/Streak rewards, and instant automated WhatsApp score dispatches to parents.

### 4. ✍️ Canvas Pen Grader & Oral Phonics Voice Notes
* **Teacher Canvas Pen Grader (`/admin/homework`):** Enables teachers and assistants to grade uploaded student homework sheets directly on an interactive canvas using digital pen strokes, highlighter tools, and customizable stamps.
* **Student Oral Phonics Recording:** Students can attach audio voice notes directly inside their homework submissions for oral reading and phonics assessment.
* **1-Click Fast-Queue Presets:** Pre-configured grading templates allow assistants to evaluate hundreds of submissions per hour with automated encouragement phrases.

```mermaid
flowchart LR
    A["👦 Student submits\nHomework + Voice Note"] --> B["📤 Safe Data URI / CDN\nSSRF Protected"]
    B --> C["👨‍🏫 Teacher opens\nCanvas Pen Grader"]
    C --> D["🎨 Annotates pages\nwith digital ink"]
    C --> E["🎙️ Listens to\noral pronunciation"]
    D & E --> F["⚡ 1-Click Fast Grade\n(XP + Score Awarded)"]
    F --> G["📲 WhatsApp Report\ndispatched to Parent"]
```

### 5. 💳 The Egyptian Payment Triad
* **Paymob Automated Webhook:** Instant fulfillment for Vodafone Cash, Orange Money, Etisalat Cash, WE Pay, and Meeza debit cards with strict HMAC-SHA512 cryptographic verification.
* **InstaPay & Manual Wallet Queue:** Parents who transfer funds manually via InstaPay or telecom wallets upload a receipt screenshot. Assistants review the queue with zoom tools, 1-click approvals, and instant activation.
* **Cryptographic Scratch Vouchers (كروت الشحن):** Center-based distribution using locally generated vector QR code scratch cards with cryptographic collision-resistant codes.

---

## 🔒 Security Hardening Matrix (CodeRabbit Audit Fixes)

All 17 issues identified during the comprehensive CodeRabbit code review have been resolved, verified with zero build regressions, and documented below:

| ID | Advisory | Severity | Mitigation Implemented | File Reference |
|:---|:---|:---:|:---|:---|
| **#4** | Paymob Webhook Bypass (CWE-347) | 🔴 Critical | Enforced HMAC-signed `gatewayOrderId` lookup prior to merchant fallback. | [`paymob/route.ts`](file:///C:/Users/PC/Desktop/egyptian-lms/src/app/api/webhooks/paymob/route.ts) |
| **#5** | Assistant Overview RBAC (CWE-862) | 🟡 Minor | Added `overview` to `ASSISTANT_RESTRICTED_TYPES` in admin API. | [`admin/actions/route.ts`](file:///C:/Users/PC/Desktop/egyptian-lms/src/app/api/admin/actions/route.ts) |
| **#6** | Lesson Order Race Condition | 🟠 Major | Wrapped `orderIndex` in atomic transaction with `SELECT FOR UPDATE` unit lock. | [`admin/actions/route.ts`](file:///C:/Users/PC/Desktop/egyptian-lms/src/app/api/admin/actions/route.ts) |
| **#7** | Homework Submission Validation | 🟠 Major | Added strict UUID format validation (400) and missing record guard (404). | [`homework/grade/route.ts`](file:///C:/Users/PC/Desktop/egyptian-lms/src/app/api/homework/grade/route.ts) |
| **#8** | Audio Voice Note SSRF (CWE-918) | 🟠 Major | Validated audio URLs against safe base64 audio URIs and trusted CDN storage. | [`homework/submit/route.ts`](file:///C:/Users/PC/Desktop/egyptian-lms/src/app/api/homework/submit/route.ts) |
| **#9** | Live Session Attendance UUID | 🟠 Major | Enforced UUID validation (400) to block arbitrary audit event generation. | [`live-sessions/attend/route.ts`](file:///C:/Users/PC/Desktop/egyptian-lms/src/app/api/live-sessions/attend/route.ts) |
| **#10**| Pre-Live Early Attendance Race | 🟠 Major | Blocked attendance recording outside the active 15-minute session window. | [`live-sessions/attend/route.ts`](file:///C:/Users/PC/Desktop/egyptian-lms/src/app/api/live-sessions/attend/route.ts) |
| **#11**| Information Disclosure (CWE-209) | 🟡 Minor | Omitted internal `error.message` from attendance API responses. | [`live-sessions/attend/route.ts`](file:///C:/Users/PC/Desktop/egyptian-lms/src/app/api/live-sessions/attend/route.ts) |
| **#12**| Unsatisfiable Prerequisite Lock | 🟠 Major | Gated prerequisites only when the required quiz/homework actually exists. | [`lesson/[lessonSlug]/route.ts`](file:///C:/Users/PC/Desktop/egyptian-lms/src/app/api/public/lesson/[lessonSlug]/route.ts) |
| **#13**| Quiz Parent IDOR (CWE-639) | 🟠 Major | Restricted parent notification data to authenticated `session.user.id`. | [`quiz/grade/route.ts`](file:///C:/Users/PC/Desktop/egyptian-lms/src/app/api/quiz/grade/route.ts) |
| **#14**| Webhook Audit DoS (CWE-400) | 🟠 Major | Added sliding-window rate limiting on invalid HMAC audit writes. | [`rate-limiter.ts`](file:///C:/Users/PC/Desktop/egyptian-lms/src/lib/security/rate-limiter.ts) |
| **#15**| Unauthenticated Fallback (CWE-347)| 🟠 Major | Required signed `gatewayOrderId` binding on merchant-order fallbacks. | [`paymob/route.ts`](file:///C:/Users/PC/Desktop/egyptian-lms/src/app/api/webhooks/paymob/route.ts) |
| **#16**| Stream Memory Leak on Unmount | 🟠 Major | Added `isMountedRef` and `pendingStreamRef` track cleanup in voice recorder. | [`voice-note-recorder.tsx`](file:///C:/Users/PC/Desktop/egyptian-lms/src/features/homework/components/voice-note-recorder.tsx) |
| **#17**| Stale Quiz Draft Time Recovery | 🟠 Major | Subtracted elapsed wall-clock seconds from draft time; auto-submitted expired. | [`interactive-quiz-engine.tsx`](file:///C:/Users/PC/Desktop/egyptian-lms/src/features/quiz-engine/components/interactive-quiz-engine.tsx) |
| **#18**| Storage Exception Crashes | 🟡 Minor | Wrapped browser `localStorage` reads/writes in safe `try/catch` fallbacks. | [`protected-video-player.tsx`](file:///C:/Users/PC/Desktop/egyptian-lms/src/features/video-player/components/protected-video-player.tsx) |
| **#19**| Native HLS Ineffective Data-Saver | 🟠 Major | Reset `qualityMode` to `auto` and hid controls when HLS.js is unavailable. | [`protected-video-player.tsx`](file:///C:/Users/PC/Desktop/egyptian-lms/src/features/video-player/components/protected-video-player.tsx) |
| **#20**| Schema Type Safety (`any` escape) | 🟠 Major | Replaced `any` escape with `AnyPgColumn` for self-referencing foreign keys. | [`schema.ts`](file:///C:/Users/PC/Desktop/egyptian-lms/src/lib/db/schema.ts) |

---

## 🛠️ Technology Stack Breakdown

```
egyptian-lms/
├── Core Framework      -> Next.js 16.3.4 (Turbopack Engine, App Router)
├── UI Library          -> React 19.2.8 + React DOM 19
├── Styling System      -> Tailwind CSS v4.3.3 + Cairo Font + Lucide Icons
├── Database Layer      -> Neon Serverless PostgreSQL + Drizzle ORM 0.45.2
├── Auth Engine         -> Better Auth 1.7.2 (Egyptian Phone + Single Device Plugin)
├── Media & DRM         -> Bunny.net Stream HLS + Dynamic Canvas Watermark
├── Payment Gateways    -> Paymob (Card & Wallets) + InstaPay + Local QR Vouchers
├── Notifications       -> Automated WhatsApp Bot (UltraMsg / WasAPI)
├── Testing & Quality   -> TypeScript 5.0 (Strict Mode) + ESLint 9 + Turbopack
```

---

## 📂 Project Structure

```bash
src/
├── app/                               # Next.js 16 App Router Routes
│   ├── (public)/                      # Landing page, public previews
│   ├── admin/                         # Teacher & Assistant CMS Backoffice
│   │   ├── broadcasts/                # WhatsApp Parent Broadcast Hub
│   │   ├── curriculum/                # Course & Bunny Video Manager
│   │   ├── homework/                  # Canvas Pen Grader Studio
│   │   ├── live-sessions/             # Zoom & Live Revision Manager
│   │   ├── orders/                    # InstaPay Receipt Verification Queue
│   │   ├── quizzes/                   # Question Bank & Exam Builder
│   │   ├── security/                  # Real-Time Security Audit Logs
│   │   └── settings/                  # Platform & Carousel Configuration
│   ├── api/                           # Secure Next.js API Route Handlers
│   │   ├── admin/actions/             # RBAC Protected Admin Operations
│   │   ├── homework/                  # Submit & Grade Handlers
│   │   ├── live-sessions/             # Attendance & Join Gatekeeper
│   │   ├── quiz/grade/                # Exam Correction & Scoring
│   │   └── webhooks/paymob/           # Cryptographic Webhook Listener
│   ├── portal/                        # Authenticated Student Experience
│   │   ├── dashboard/                 # Gamified Student Hub (XP, Streaks)
│   │   ├── learn/[unitSlug]/          # Unit Playlist & Curriculum Grid
│   │   ├── lesson/[lessonSlug]/       # DRM Watermarked Video Player
│   │   └── quiz/[quizId]/             # Interactive Exam Arena
│   ├── favicon.ico                    # Multi-Resolution Crisp Windows Icon
│   ├── icon.svg                       # High-DPI Vector Tab Bar Icon
│   └── layout.tsx                     # Root Layout & Dynamic Metadata
├── components/                        # Shared UI Components & Layouts
│   ├── layout/                        # Header, Footer, Admin Sidebar
│   └── ui/                            # Button, Badge, Modal, Illustrated Icons
├── features/                          # Domain-Driven Feature Modules
│   ├── admin-curriculum/              # Tus uploaders, unit managers
│   ├── canvas-grader/                 # Digital ink correction canvas
│   ├── homework/                      # Voice note recorder & submission
│   ├── live-sessions/                 # Attendance widgets & Zoom links
│   ├── quiz-engine/                   # Anti-cheat timers & audio chime
│   └── video-player/                  # DRM player & canvas watermark
└── lib/                               # Infrastructure, Database & Security
    ├── api/                           # Type-safe client fetchers
    ├── auth/                          # Better Auth server & client setup
    ├── db/                            # Drizzle Schema, Migrations & Mocks
    ├── security/                      # Rate Limiter & Audit Logger
    └── utils/                         # Image compression & WhatsApp client
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (or `v24.x`)
- **Package Manager**: `pnpm` (recommended: `pnpm@10.x`)
- **Database**: PostgreSQL instance (e.g., Neon Serverless Postgres)

### 1. Clone & Install
```bash
git clone https://github.com/galilio2023/egyptian-lms.git
cd egyptian-lms
pnpm install
```

### 2. Configure Environment Variables
Copy and configure the environment variables:
```bash
cp .env.example .env.local
```

Fill in the essential environment keys:
```env
# Database Connection (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-sample-pool.neon.tech/neondb?sslmode=require"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-super-secret-random-key"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Paymob Integration (Egyptian Payment Gateway)
PAYMOB_API_KEY="your_paymob_api_key"
PAYMOB_HMAC_SECRET="your_paymob_hmac_secret"
PAYMOB_INTEGRATION_ID_CARD="123456"
PAYMOB_INTEGRATION_ID_WALLET="654321"

# Bunny.net Stream Video Hosting (HLS DRM)
BUNNY_STREAM_API_KEY="your_bunny_stream_api_key"
BUNNY_STREAM_LIBRARY_ID="12345"

# WhatsApp Notifications Gateway
WHATSAPP_API_URL="https://api.wasapi.io/v1/messages"
WHATSAPP_API_TOKEN="your_whatsapp_gateway_token"
```

### 3. Initialize Database Schema
```bash
# Push schema directly to your development database
pnpm run db:push

# Optional: Seed initial Grade 1-6 units, lessons, and mock data
pnpm run db:seed
```

### 4. Launch Development Server
```bash
pnpm dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 🏷️ Repository Topics & Tags

For repository classification, discoverability, and SEO:

`nextjs16` • `react19` • `lms` • `edtech` • `egypt` • `arabic` • `drizzle-orm` • `better-auth` • `paymob` • `instapay` • `anti-piracy` • `video-watermark` • `hls-streaming` • `canvas-grader` • `whatsapp-notifications` • `tailwind-v4` • `turbopack` • `security-hardened`

---

## 📄 License & Attribution

Distributed under the **MIT License**. Engineered with precision for **Elite Academy** under the educational supervision of **Mr. Ahmed Abdelrahman**.
