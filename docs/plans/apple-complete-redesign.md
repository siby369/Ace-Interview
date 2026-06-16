# Apple Ecosystem Complete Website Redesign Plan

## Problem Frame
The current Ace Interview platform implements baseline Apple HIG tokens but still retains the generic structure and aesthetic of a standard shadcn/ui application. To truly capture the "Apple Magic" (Apple website marketing aesthetic combined with native iOS/macOS application feel), a complete top-to-bottom rewrite of the UI components and pages is required.

## Scope & Boundaries
- **In Scope:** Complete structural and visual redesign of the Landing Page, Dashboard, Interview Setup, and Interview Client View. Implementation of Apple-style scroll animations, bento-box layouts, modal sheets, native-feeling navigation, and expressive typography.
- **Out of Scope:** Core Genkit AI backend flows, database logic.
- **Guiding Principles:** 
  1. *Apple UI Design System:* Stark contrast, premium minimalism, San Francisco-esque typography hierarchy.
  2. *Apple HIG:* 44px touch targets, squircles, context menus, and sheets.
  3. *Liquid Glass:* Heavy use of `backdrop-blur` with varying translucencies.

---

## Phase 1: Foundation & Typography Overhaul
*Dependencies: None*
- **File:** `src/app/globals.css`, `tailwind.config.ts`
- **Action:**
  - Update typography to perfectly mimic Apple's San Francisco Pro scaling. Use tight tracking (`tracking-tight` to `tracking-tighter`) for display headers, and slightly loose tracking for body text.
  - Implement Apple's dynamic system colors (System Blue, System Gray 1-6) as Tailwind utilities.

## Phase 2: The "Apple Event" Landing Page Redesign
*Dependencies: Phase 1*
- **File:** `src/app/page.tsx`
- **Action:**
  - **Hero Section:** Rebuild to resemble an iPhone/Mac product launch page. Massive, centered, glowing typography fading in on scroll.
  - **Bento Grid:** Replace the standard 3-column feature list with an asymmetrical Apple-style "Bento Box" grid using frosted glass cards (`bg-white/5 backdrop-blur-xl border border-white/10`).
  - **Scroll Animations:** Deepen the Framer Motion integration. Elements should reveal dynamically via scroll tracking (opacity, scale, and subtle Y-translation) similar to the AirPods or Mac Pro landing pages.
  - **Header:** Implement a sleek, sticky, translucent top navigation bar that collapses smoothly.

## Phase 3: The "iOS App" Dashboard
*Dependencies: Phase 1*
- **File:** `src/app/dashboard/page.tsx`, `src/components/app-shell.tsx`
- **Action:**
  - Redesign the Dashboard to feel like a native macOS/iPadOS app.
  - **Sidebar (macOS style):** Translucent vibrancy sidebar (`bg-card/30 backdrop-blur-3xl`).
  - **Content Area:** Use a grouped inset-list style (like iOS Settings or Mail) for displaying past interview sessions.
  - **Cards:** Replace flat cards with deeply shadowed, high-radius (16px - 24px) floating cards.

## Phase 4: Interview Setup (Wizard)
*Dependencies: Phase 1*
- **File:** `src/app/interview/new/page.tsx`, `src/components/role-selection-form.tsx`
- **Action:**
  - Convert the step-by-step process into an Apple "Sheet" or "Page Transition" flow.
  - Replace the generic grid of roles with oversized, highly-tactile buttons that scale down slightly on press (`active:scale-95`).
  - Introduce subtle haptic-like visual feedback (quick flash/glow) when a role or difficulty is selected.

## Phase 5: The "FaceTime-style" Interview Client
*Dependencies: Phase 1*
- **File:** `src/components/interview-client-view.tsx`
- **Action:**
  - Rebuild the interview interface to mimic a polished FaceTime or Voice Memos application.
  - **Controls:** Move mic, language, and submit controls into a floating pill-shaped "Dynamic Island" or bottom toolbar (like the iOS Camera app).
  - **Question Display:** Center the AI's question with large, readable, immersive typography.
  - **Feedback Delivery:** Deliver AI feedback in a clean, threaded "Messages" or "Notes" app style, removing standard boxed alerts.

## Phase 6: Polish & Micro-interactions
*Dependencies: Phases 2-5*
- **Action:**
  - Apply `overscroll-behavior-y: none` to prevent rubber-banding on desktop, but allow it natively on iOS.
  - Ensure all hover states use a smooth `ease-out` transition (`duration-300` or `duration-500`).
  - Add "skeuomorphic" lighting touches (a 1px top inner border of pure white on glass components) to create physical depth.

---

## Test Scenarios
1. **The "Marketing" Test:** The landing page must feel indistinguishable in quality from a modern Apple product page.
2. **The "Native App" Test:** The dashboard and interview UI must feel like native installed applications on iPadOS and macOS.
3. **The "Tactile" Test:** Every button must react to clicks with appropriate scaling and focus-rings deferring to the HIG.
