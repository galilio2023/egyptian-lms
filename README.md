# 🚀 Elite Academy LMS — Next.js 16 + Tailwind v4 + Drizzle + Better Auth

A high-performance, full-stack educational Learning Management System (LMS) specifically architected for the Egyptian education market (Grade 1 through Grade 6 English curriculum with Mr. Ahmed Abdelrahman).

---

## 🌟 Key Highlights & Architectural Advantages

1. **Egyptian Mobile-First Authentication (Better Auth):**
   - Eliminates student email friction; authenticates directly via 11-digit Egyptian phone numbers (`010`, `011`, `012`, `015`).
   - Links **Student Mobile** and **Parent Mobile** (WhatsApp).
   - Enforces **Single Active Device** locking to eliminate account sharing.

2. **Advanced Video Anti-Piracy & DRM:**
   - Powered by **Bunny.net Stream / Cloudflare Stream** HLS playback.
   - Dynamic canvas watermarking that floats continuously across the video displaying the student's full name, phone number, and IP timestamp.

3. **Dual Egyptian Payment Engine:**
   - **Paymob Integration:** Automated instant checkout for Egyptian Mobile Wallets (Vodafone Cash, Orange, Etisalat, WE) and Meeza cards.
   - **InstaPay / Manual Wallet Transfer Queue:** Allows parents to upload transaction receipts/screenshots with 1-click admin assistant approval.

4. **Interactive Anti-Cheat Exam Engine:**
   - Tab-switch and window-blur detector (3 strikes auto-submits).
   - Live countdown timer with auto-submit.
   - Immediate scoring, confetti animations, and simulated WhatsApp score delivery to parent phone.

5. **Teacher & Assistant CMS Backoffice (`/admin`):**
   - **Curriculum Studio:** Add/edit grades and units, upload Bunny Stream videos, attach PDF worksheets.
   - **Question Bank:** Visual question builder (Multiple choice, true/false, listening audio tests).
   - **Student & Device Manager:** Search by Egyptian phone, 1-click **"Reset Device Lock"** (فك حظر الجهاز).
   - **InstaPay Verification Queue:** Review uploaded screenshots with zoom, 1-click **"Approve & WhatsApp Notify"**, and **"Reject"**.
   - **Parent WhatsApp Broadcasts:** Send grade-filtered announcements to parent WhatsApp numbers.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.3.4 (App Router, Server Components, Turbopack) |
| **Styling** | Tailwind CSS v4.3.3 + Cairo Arabic Typography + Native RTL |
| **Auth** | Better Auth 1.7.2 + Egyptian Phone Plugin + Single-Device Lock |
| **Database** | Neon Serverless PostgreSQL + Drizzle ORM 0.45.2 |
| **Video** | Bunny.net Stream HLS + Dynamic Canvas Watermarking |
| **Gamification** | Canvas Confetti + Streak & XP Tracker |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
cd C:\Users\PC\Desktop\egyptian-lms
pnpm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root:
```env
DATABASE_URL="postgresql://user:password@ep-sample-pool.neon.tech/neondb?sslmode=require"
BETTER_AUTH_SECRET="your-super-secret-better-auth-key"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional Egyptian Integrations
PAYMOB_API_KEY="your_paymob_api_key"
BUNNY_STREAM_API_KEY="your_bunny_api_key"
WHATSAPP_API_KEY="your_wasapi_or_ultramsg_key"
```

### 3. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Routes Overview

- `/` — Marketing Landing Page (Hero, Video Bio, Grade selector, Features)
- `/student-login` — Student Egyptian Mobile Login
- `/student-register` — Student Registration (Governorates, Parent Mobile)
- `/portal/dashboard` — Student Hub (Active units, XP points, Streaks)
- `/portal/learn/[unitSlug]` — Unit syllabus & lesson playlist
- `/portal/lesson/[lessonSlug]` — DRM Video player with dynamic student watermark
- `/portal/quiz/[quizId]` — Interactive Anti-Cheat Exam Engine
- `/admin` — CMS Dashboard Overview & Revenue KPIs
- `/admin/curriculum` — Curriculum Studio & Bunny Video Uploader
- `/admin/quizzes` — Question Bank Builder
- `/admin/students` — Student Directory & 1-Click Device Unlock
- `/admin/orders` — InstaPay & Wallet Receipt Review Queue
- `/admin/broadcasts` — Parent WhatsApp Blast Center
