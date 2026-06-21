# Technical Plan: Production Infrastructure & Missing Features

**Date:** 2026-06-21
**Type:** feature / infrastructure

## 1. Problem Frame
AceInterview currently operates as a highly polished client-side prototype. While the UI, AI integration (Groq), and core interview loop are functioning excellently, the application lacks the foundational backend infrastructure required for a true production SaaS. Specifically:
- Data is trapped in `localStorage`, meaning users lose their session history if they switch devices or clear their cache.
- There are no API rate limits or usage quotas, leaving the application vulnerable to LLM cost abuse.
- Sharing relies on raw text copying rather than structured public URLs.
- The onboarding experience and user profile management are completely missing.

## 2. Scope Boundaries
**In Scope:**
- Migrating `localStorage` data to Supabase Postgres.
- Implementing an API route middleware for tracking and limiting AI token usage.
- Creating a structured database schema (`profiles`, `sessions`, `answers`).
- Adding a public share route (`/share/[id]`) for completed sessions.
- Adding an onboarding flow for newly registered users.

**Out of Scope:**
- Full Stripe billing integration (we will implement the *quota* system first; payment gateways are deferred to a later plan).
- Real-time multiplayer interviewing.

## 3. Key Technical Decisions (KTDs)

### KTD 1: Supabase RLS for Data Isolation
*Decision:* Use Supabase Row Level Security (RLS) to enforce data privacy.
*Rationale:* Instead of writing backend API routes for every CRUD operation, we can safely use the Supabase JS client directly in the frontend, provided RLS policies restrict users to only `SELECT`, `INSERT`, and `UPDATE` where `user_id = auth.uid()`.

### KTD 2: Local-First to Cloud Migration Strategy
*Decision:* Maintain a local cache but push to Supabase on mutations.
*Rationale:* We don't want to break the currently fast, optimistic UI. The `storage.ts` file will be refactored into a `sync.ts` service that saves to `localStorage` immediately, then asynchronously pushes the delta to Supabase. On login, local anonymous sessions will be merged with the user's cloud account.

### KTD 3: Server-Side AI Execution with Quotas
*Decision:* All Groq AI calls must pass through Next.js API routes (Server Actions), never directly from the client.
*Rationale:* Protects the Groq API keys and allows us to decrement a `tokens_remaining` column in the user's `profiles` table.

## 4. Implementation Units

### U1: Database Schema & RLS Setup
- Create Supabase migrations for:
  - `profiles` (id, user_id, tier, tokens_remaining, created_at)
  - `sessions` (id, user_id, role, company, raw_jd, extracted_topics, completed, created_at)
  - `answers` (id, session_id, question, transcript, score, feedback, created_at)
- Write Row Level Security (RLS) policies for all tables.
- **Test Scenario:** A user can only read and write their own sessions. Unauthenticated users cannot read anything.

### U2: Storage Sync Layer (Local to Cloud)
- Refactor `src/lib/storage.ts` to integrate `@supabase/supabase-js`.
- Implement a merge strategy on login (push local anonymous sessions to the authenticated user's account).
- **Test Scenario:** Complete an interview while logged out, log in, and verify the session appears in the dashboard across different devices.

### U3: AI Quota & Rate Limiting Enforcement
- Modify `src/ai/flows/generate-panel-question.ts` and evaluation flows.
- Before calling Groq, check the user's `tokens_remaining` in Supabase.
- If depleted, return a specific error code.
- Handle the "Out of Quota" state gracefully in the `interview-client-view.tsx` UI.
- **Test Scenario:** Artificially set a user's tokens to 0 and verify the UI shows an upgrade/quota modal instead of crashing.

### U4: Public Session Sharing
- Create a new page: `src/app/share/[id]/page.tsx`.
- Add a boolean `is_public` column to the `sessions` table.
- Update RLS to allow unauthenticated `SELECT` on `sessions` and `answers` where `is_public = true`.
- Update the Dashboard "Share" button to toggle `is_public` and copy the absolute URL instead of raw text.
- **Test Scenario:** An unauthenticated incognito window can view a shared session URL but cannot modify it.

### U5: User Onboarding Flow
- Create an onboarding modal/page that triggers if `profiles.onboarding_completed` is false.
- Collect target roles, preferred difficulty, and baseline skills.
- Save to `PracticeSettings` in the cloud.
- **Test Scenario:** A brand new signup is forced through the onboarding flow before reaching the dashboard.
