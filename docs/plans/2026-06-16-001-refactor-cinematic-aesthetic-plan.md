# Refactor to Cinematic Minimalist Aesthetic

**Type:** Refactor
**Date:** 2026-06-16
**Status:** Draft

## Problem Frame & Scope
The application's current UI heavily relies on a dense, macOS-inspired "Apple" aesthetic with a bottom dock and complex frosted-glass cards. The user has requested a complete teardown and redesign to match a new "cinematic and minimalist" vibe established by the `PrismaHero` component on the landing page.

**Scope:**
- **In Scope:** Complete overhaul of `AppShell`, Dashboard, New Interview form, and Interview Session UI. Implementation of a new design token system centered around `#E1E0CC` text, dark immersive backgrounds, and pill-shaped elements.
- **Out of Scope:** Core backend logic, database schema, and Playwright testing infrastructure (though tests may need selector updates in a subsequent PR).

## Key Technical Decisions
1. **Navigation Paradigm:** Drop the macOS bottom dock entirely. Use a floating, pill-shaped minimalist top navbar (matching `PrismaHero`) across the app.
2. **Design Tokens:**
   - Background: Solid `#080808` or full-bleed atmospheric imagery with `mix-blend-overlay` noise.
   - Primary Text: `#E1E0CC` (Warm Off-White).
   - Secondary Text: `white/60` or `white/40`.
   - Containers: `bg-white/[0.02]` or `bg-white/5` with `border border-white/10` and `rounded-2xl` or `rounded-3xl` radii.
   - Buttons: Pill-shaped (`rounded-full`) with high contrast (e.g., `#E1E0CC` background with black text for primary CTAs).
3. **Immersive Interview Session:** The actual interview session should pivot away from a dense chat/video split-pane to an immersive, distraction-free environment (e.g., a dark screen with a central audio visualizer and large, elegant typography for transcriptions).

## Implementation Units

### U1: Global Layout & Navigation Refactor
**Goal:** Establish the new shell and remove old AppShell traces.
- **Files:** `src/components/app-shell.tsx`, `src/app/layout.tsx`
- **Details:** 
  - Delete `AppDock` entirely.
  - Create a new `CinematicNav` component: a floating top pill menu centered on the screen.
  - Apply the noise overlay and dark background globally via `layout.tsx`.

### U2: Dashboard Overhaul
**Goal:** Redesign the dashboard to match the immersive vibe.
- **Files:** `src/app/dashboard/page.tsx`, `src/components/dashboard/*`
- **Details:**
  - Replace dense data grids with large, breathing stat cards (`bg-white/[0.02]`).
  - Use massive typography for key numbers.
  - Implement a cinematic hero header for the dashboard ("Welcome back").

### U3: Interview Setup (New Interview) Redesign
**Goal:** Simplify the setup wizard into an elegant, focused form.
- **Files:** `src/app/interview/new/page.tsx`
- **Details:**
  - Convert multi-step forms into a single, beautifully spaced page.
  - Use large pill-shaped toggle buttons for role and persona selection instead of standard select boxes.
  - Primary CTA matches the `PrismaHero` "Start Practicing" button.

### U4: Immersive Interview Session UI
**Goal:** Redesign the active interview screen for deep focus.
- **Files:** `src/app/interview/start/page.tsx`
- **Details:**
  - Remove sidebars and headers.
  - Dark canvas with a central element (e.g., glowing orb or subtle waveform) indicating AI listening/speaking.
  - Display transcript text as large, cinematic subtitles anchored to the bottom of the screen.

## Risks & Edge Cases
- **Accessibility:** Ensure the `#E1E0CC` text on `white/[0.02]` backgrounds maintains sufficient contrast.
- **Responsive Design:** Cinematic full-bleed elements must be carefully managed on mobile so typography scales correctly without overflowing.
