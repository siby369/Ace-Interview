# Apple HIG & Web Standards UI/UX Refactor Plan

## Problem Frame
The Ace Interview application currently employs a standard Next.js + Tailwind CSS (shadcn/ui) dark theme. To elevate the user experience to a premium, native-feeling level, the entire UI/UX must be refactored to adhere strictly to Apple's Human Interface Guidelines (HIG) across Mobile, iPad, and Desktop breakpoints, while also maintaining web accessibility standards and proper PWA capabilities.

## Scope & Boundaries
- **In Scope:** Visual UI changes, layout updates, CSS token migration, responsive adaptations (sidebar for desktop/iPad, tab bar for mobile), touch target auditing, PWA manifest configuration, and asset generation.
- **Out of Scope:** Refactoring backend services, Genkit AI business logic, API integrations, and database schemas.
- **Origin:** Driven by the `hig-ui-pass`, `apple-ui-design-system`, and `liquid-glass` aesthetics skills.

## Implementation Sequencing

The work will be executed sequentially to ensure foundational tokens are in place before components are audited.

### Phase 1: Foundational CSS Tokens & Tailwind Config
*Dependencies: None*
- **File:** `src/app/globals.css`
- **Action:** Replace hardcoded static values with the required HIG-compliant primitives:
  - `--space-unit`, `--radius-base`, `--tab-bar-height`, `--top-bar-height`, `--sidebar-width`, `--tab-bar-label-size`, `--breakpoint-lg`.
  - Establish Apple-like system grays and dynamic brand hue/chroma values for glassmorphism effects (e.g., `backdrop-blur-md bg-white/70 dark:bg-black/75`).
  - Add HIG base classes (`overscroll-behavior: none`, `-webkit-tap-highlight-color: transparent`).
- **File:** `tailwind.config.ts`
- **Action:** Map the new CSS variables to Tailwind utility scales (e.g., extend `spacing`, `borderRadius`, `colors`) so they can be consumed via utility classes without hardcoding magic numbers.

### Phase 2: Component Hardcoding Audit & Refactor
*Dependencies: Phase 1*
- **Files:** `src/components/ui/*.tsx`, `src/components/*.tsx`
- **Action:** 
  - Audit all components for magic numbers (`h-[52px]`, `text-[11px]`, `w-60`).
  - Migrate all hardcoded pixel values to the newly defined Tailwind scale tied to the HIG CSS tokens.
  - Apply strict `<button>` and `<input>` touch target rules (minimum `44px` or `min-h-11` in Tailwind).
  - Implement focus rings strictly aligned with HIG deference (subtle contrasting rings).

### Phase 3: Mobile Layout & Navigation Compliance
*Dependencies: Phase 2*
- **Files:** `src/app/layout.tsx`, `src/components/interview-client-view.tsx`
- **Action:**
  - Implement a dynamic bottom Tab Bar layout for screens `< 1024px`.
  - Ensure tab bar labels adhere to the minimum size (`--tab-bar-label-size`).
  - Add Safe Area Inset padding using `env(safe-area-inset-bottom, 20px)`.

### Phase 4: iPad & Desktop Layout Compliance
*Dependencies: Phase 3*
- **Files:** `src/app/layout.tsx`, `src/components/interview-client-view.tsx`
- **Action:**
  - Implement a persistent Sidebar layout for screens `≥ 1024px`.
  - Hide the mobile bottom Tab Bar on larger viewports.
  - Introduce hover micro-interactions (liquid glass subtle scaling, opacity transitions) for pointer devices.
  - Implement Stage Manager responsive guards (`max-w-*` wrappers for wide screens).

### Phase 5: Web Standards Layer (Forms & Accessibility)
*Dependencies: Phase 4*
- **Files:** `src/components/role-selection-form.tsx`, `src/components/difficulty-selector.tsx`
- **Action:**
  - Audit form inputs: verify explicit `type` attributes, `autocomplete` enabled, and error messages rendered inline below the inputs.
  - Verify APCA contrast for text overlaying the frosted glass backgrounds.
  - Add optimistic loading states and visual spinners for async operations like AI feedback generation.

### Phase 6: PWA Asset Generation
*Dependencies: Phase 1 (Logo required)*
- **Files:** `public/icons/`, `public/manifest.json`, `src/app/layout.tsx`
- **Action:**
  - Identify the primary project logo.
  - Use `npx pwa-asset-generator` to auto-generate all required Apple touch icons, maskable icons, and splash screens for various iPhone and iPad form factors.
  - Configure `apple-mobile-web-app-capable` and `theme-color` meta tags.

## Test Scenarios

1. **Mobile Layout Check:** 
   - Load application at 390px viewport (iPhone 14 width).
   - *Verify:* Bottom tab bar is visible, safe area padding is applied, no sidebar is rendered.
   - *Verify:* All buttons and clickable surfaces are at least 44x44px.

2. **Desktop & iPad Layout Check:**
   - Load application at 1024px+ viewport.
   - *Verify:* Sidebar is visible (240px wide mapped from `--sidebar-width`), mobile bottom tab bar is hidden.
   - *Verify:* Window resizing triggers the breakpoint smoothly without intermediate layout breakage.

3. **Visual Quality Check:**
   - Review primary interactive components (cards, start buttons, feedback panels).
   - *Verify:* Glassmorphism is applied (translucent backgrounds with blur), borders are subtle system grays, and the `--radius-base` (10px) is respected across the board.

4. **Web Standards & Form Check:**
   - Attempt form submission via 'Enter' key.
   - Trigger an error state in form inputs.
   - *Verify:* Errors are inline, fields have correct autocompletes, keyboard tabbing follows a logical sequence with visible focus rings.

5. **PWA Integration Check:**
   - Run a Lighthouse audit on the dev server.
   - *Verify:* PWA criteria are met, Apple Touch Icons are present, and standalone display mode is declared in the manifest.
