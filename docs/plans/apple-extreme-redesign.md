# Extreme Apple UI Overhaul & Animation Plan

## Problem Frame
The current UI has the basic Apple tokens and layouts, but lacks the high-end "wow factor" of a true Apple product page. The user wants to integrate extreme internet-sourced Apple components (e.g., Safari mockups, macOS Docks, iPhone mockups, complex Framer Motion scroll hijacking) and completely change the color palette to a hyper-premium "Titanium/Space Black" aesthetic.

## Skill Integrations
- **Animation Designer:** We will use advanced `framer-motion` concepts (staggered children, 3D transforms, sticky scroll-jacking, `useScroll` with `useTransform` for parallax).
- **Apple Craft / HIG Input Design:** We will implement an Apple Dock for navigation and Safari/iPhone mockup wrappers for the dashboard and interview views.

## Scope & Boundaries
- **In Scope:** 
  1. A complete color palette shift to "Space Black" (`#0A0A0A`) with "Titanium" accents (`#878681`).
  2. A macOS-style Dock component for global navigation.
  3. A new Landing Page featuring a 3D scroll-reveal Safari Browser mockup containing the app.
  4. Radical CSS-driven Apple-style gradient text and "glow" components.
- **Out of Scope:** Altering the AI backend or database logic.

---

## Phase 1: Extreme Palette & Global Layout (The "Space Black" Theme)
- **Files:** `src/app/globals.css`, `tailwind.config.ts`, `src/components/app-shell.tsx`
- **Action:**
  - Change global colors to a "Space Black" theme. Deep true blacks with very subtle gray/titanium borders.
  - Replace the current `<AppShell>` Tab Bar / Sidebar with an animated **macOS Dock** component at the bottom of the screen (using Framer Motion for magnification on hover).

## Phase 2: Internet Components - The Apple Mockups
- **Files:** `src/components/magic/safari-mockup.tsx`, `src/components/magic/iphone-mockup.tsx`
- **Action:**
  - Build reusable, high-fidelity Safari and iPhone mockup wrappers using pure Tailwind CSS and Framer Motion. These will frame the actual application content on the landing page to show off the "product".

## Phase 3: The "Scrollytelling" Landing Page
- **Files:** `src/app/page.tsx`
- **Action:**
  - Implement a massive scroll-linked animation sequence:
    1. **Intro:** A giant "Hello." or "Ace Interview." text that fades and scales out as you scroll down.
    2. **Product Reveal:** The `SafariMockup` component rises from the bottom of the screen, tilting in 3D (`rotateX`) as it comes into view, snapping to the center of the screen.
    3. **Feature Wipes:** Scroll-jacking sections where the background stays fixed while new "Titanium" glass cards slide in from the sides.

## Phase 4: The Hyper-Tactile Interview Interface
- **Files:** `src/components/interview-client-view.tsx`
- **Action:**
  - Replace the current UI with a layout mimicking the **iOS Voice Memos** app or **Siri overlay**.
  - Add a pulsing, fluid audio visualizer animation (using Framer Motion) when the user is speaking.
  - Make the "Dynamic Island" toolbar heavily animated—expanding and contracting based on whether the AI is speaking, the user is recording, or it's loading.

---

## Test Scenarios
1. **The "Scroll" Test:** The landing page must have 60fps smooth 3D transformations on scroll, mirroring an Apple product launch site.
2. **The "Dock" Test:** The macOS navigation dock must correctly magnify icons on mouse hover.
3. **The "Titanium" Test:** The color palette must look incredibly premium, discarding all standard web grays for true blacks and metallic accents.
