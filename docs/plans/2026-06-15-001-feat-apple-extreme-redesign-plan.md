---
title: "feat: Extreme Apple-Inspired UI Redesign with MagicUI & Aceternity Components"
date: 2026-06-15
type: feat
depth: Deep
---

# Plan: Complete Apple-Inspired UI Overhaul

## Problem Frame
The current UI has inconsistent animations, generic color choices, and lacks the premium "wow factor" of top-tier Apple-inspired web apps. The user wants a complete redesign using real internet components from MagicUI, Aceternity, react-bits, and 21st.dev — not hand-crafted approximations.

## Scope
- **In:** New `src/components/magic/` library with copy-paste internet components, complete page overhaul (Landing, Dashboard, Interview Setup, Interview), new global CSS theme
- **Out:** AI backend, data models, API routes — zero changes

---

## Phase 1: Magic Component Library (`src/components/magic/`)

These are all **self-contained, zero-dependency** components (pure Tailwind + Framer Motion). Each is sourced from proven internet libraries.

### U1: `aurora-background.tsx`
- **Source:** MagicUI `Aurora` background
- **Technique:** CSS `animate-aurora` keyframe on a conic gradient, radial mask
- **Use:** Landing page hero background

### U2: `shimmer-button.tsx`
- **Source:** MagicUI `ShimmerButton`
- **Technique:** `--cut` CSS var, `conic-gradient` sweep animation, `background-position-spin` keyframe
- **Use:** Primary CTAs ("Practice Now", "Start Interview")

### U3: `animated-grid-pattern.tsx`
- **Source:** MagicUI `AnimatedGridPattern`
- **Technique:** SVG `<rect>` elements with staggered Framer Motion fade-in, uses `useId` for SVG clip paths
- **Use:** Dashboard & Interview page backgrounds

### U4: `blur-fade.tsx`
- **Source:** MagicUI `BlurFade`
- **Technique:** Framer Motion `initial={opacity:0, filter:'blur(6px)'}` → `animate` with spring + delay offset
- **Use:** Wraps every content section for page-load reveal

### U5: `word-pull-up.tsx`
- **Source:** MagicUI `WordPullUp`  
- **Technique:** Splits text by word, each word animates `y: 40 → 0, opacity: 0 → 1` with stagger
- **Use:** Landing page headline "Ace Your Interview."

### U6: `text-reveal.tsx`
- **Source:** react-bits "Text Reveal on Scroll"
- **Technique:** `useScroll + useTransform` maps scroll progress to character opacity, creating a "writing" effect
- **Use:** Landing page feature text blocks

### U7: `bento-grid.tsx`
- **Source:** MagicUI `BentoGrid` / `BentoCard`
- **Technique:** CSS grid with `span-col` variants, glass card backgrounds, `group-hover` opacity animations on inner description
- **Use:** Landing page "Features" section

### U8: `dock.tsx` *(macOS Dock)*
- **Source:** MagicUI `Dock` + `DockIcon`
- **Technique:** `useMotionValue(Infinity)` for mouse X, `useTransform(distance, [-150,0,150], [40,80,40])` for width magnification via spring
- **Use:** Global app navigation in `AppShell`

### U9: `safari.tsx`
- **Source:** MagicUI `Safari` component
- **Technique:** Pure Tailwind, SVG traffic lights, URL bar, inner content slot
- **Use:** Landing page product screenshot wrapper

---

## Phase 2: New Global Theme

### U10: `globals.css` overhaul
- **Colors:** True neutral blacks (oklch-based), no more HSL blobs
- **Radius:** 24px base for cards (`--radius-card`), 999px for pills
- **Font:** SF Pro Display emulation via system-ui + weight trick
- **Keyframes:** Add `aurora`, `shimmer-slide`, `background-position-spin` from MagicUI source

---

## Phase 3: Page Rewrites

### U11: Landing Page (`src/app/page.tsx`)
Layout: Aurora bg → BlurFade logo/nav → WordPullUp title → Safari mockup → BentoGrid features → ShimmerButton CTA

### U12: Interview Setup (`src/app/interview/new/page.tsx`)
Layout: AnimatedGridPattern bg → BlurFade step headers → Apple-style role cards with `group-hover` border gradient

### U13: Dashboard (`src/app/dashboard/page.tsx`)
Layout: AnimatedGridPattern bg → BlurFade stats → Bento-style session history

### U14: `AppShell` → MagicUI Dock navigation

---

## Test Scenarios
1. Aurora animation runs at 60fps (no jank)
2. ShimmerButton sweep completes on a 300ms cycle
3. Dock magnification works smoothly on mouse move
4. BlurFade stagger chain visible on page load (0 → 400ms)
5. Safari mockup renders correctly at all viewport sizes
