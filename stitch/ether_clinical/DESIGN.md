# Design System Specification: The Clinical Ethereal

## 1. Overview & Creative North Star
**The Creative North Star: "The Clinical Ethereal"**

This design system moves away from the sterile, rigid grids of legacy medical software and toward a high-end, "Editorial SaaS" experience. The goal is to reduce cognitive load for healthcare providers while instilling a sense of calm and precision for patients. 

We break the "template" look through **The Layered Sanctuary** approach: using intentional asymmetry, generous breathing room (whitespace), and tonal depth. By avoiding harsh structural lines and embracing soft, overlapping surfaces, the UI feels less like a database and more like a curated, responsive environment. It is "medical-grade" through its clarity, but "premium-humanist" through its soft edges and fluid transitions.

---

## 2. Colors & Surface Philosophy

### The Palette
The palette is rooted in `primary` (#004ac6) and `secondary` (#006a61), but its soul lies in the neutral "Surface" tokens which provide the necessary clinical cleanliness.

*   **Primary (Medical Blue):** `primary` (#004ac6) and `primary_container` (#2563eb). Used for core actions and brand presence.
*   **Secondary (Healing Teal):** `secondary` (#006a61) for success states, health indicators, and "calm" callouts.
*   **Tertiary (Deep Lavender):** `tertiary` (#3e3fcc) for secondary data points or role-specific navigation elements.

### The "No-Line" Rule
**Standard 1px borders are strictly prohibited for sectioning.** 
Structural boundaries must be defined solely through background color shifts. To separate the sidebar from the main content, or a queue list from a detail view, transition from `surface` to `surface_container_low`. This creates a sophisticated, "borderless" interface that feels modern and expansive.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine paper or frosted glass.
*   **Base Layer:** `surface` (#f7f9fb)
*   **Content Areas:** `surface_container_low` (#f2f4f6)
*   **Elevated Cards:** `surface_container_lowest` (#ffffff)
*   **Interactive Overlays:** Use `surface_bright` with a 80% opacity and a `20px` backdrop-blur (Glassmorphism).

### Signature Textures
Main CTAs and Hero sections should utilize a subtle linear gradient: `primary` to `primary_container` (135deg). This adds "visual soul" and prevents the flat, utilitarian look of standard buttons.

---

## 3. Typography
We utilize a dual-font system to balance authority with approachability.

*   **Display & Headlines (Manrope):** Chosen for its geometric modernism. Used for large data points (e.g., "Current Queue Number") and page titles. Its wide apertures feel welcoming yet precise.
*   **Body & Labels (Inter):** The workhorse for legibility. Used for patient names, medical notes, and navigation. Inter’s tall x-height ensures readability even at `body-sm` (0.75rem).

**Hierarchy as Identity:**
- **Primary Focus:** `display-lg` for real-time queue counters.
- **Sectional Authority:** `headline-sm` in `on_surface_variant` for dashboard widgets.
- **Instructional Clarity:** `label-md` in `medium` weight for all form labels and metadata.

---

## 4. Elevation & Depth

### The Layering Principle
Instead of shadows, use **Tonal Stacking**. A `surface_container_lowest` card sitting on a `surface_container` background creates a natural "lift." This is the preferred method for 90% of the UI.

### Ambient Shadows
When a floating effect is required (e.g., a modal or a primary action card), use an "Ambient Shadow":
- **Blur:** 32px to 64px.
- **Opacity:** 4% - 6%.
- **Color:** Use a tinted version of `on_surface` (e.g., `rgba(25, 28, 30, 0.06)`). Never use pure black.

### The "Ghost Border" Fallback
If accessibility requirements demand a border (e.g., in high-contrast needs), use a "Ghost Border": `outline_variant` at **15% opacity**. It should be felt, not seen.

### Glassmorphism
For role-based navigation overlays or "Quick View" patient drawers, use:
- **Background:** `surface_container_lowest` (Alpha: 70%)
- **Backdrop Blur:** 12px
- **Border:** 1px solid `surface_container_highest` (Alpha: 20%)

---

## 5. Components

### Buttons
- **Primary:** Gradient-filled (`primary` to `primary_container`), `xl` (1.5rem) corner radius. Use `on_primary` text.
- **Secondary:** `surface_container_highest` background with `primary` text. No border.
- **Tertiary:** Transparent background, `on_surface_variant` text, reveals `surface_container_low` on hover.

### Cards & Lists
- **The Divider Ban:** Strictly forbid `hr` lines. Separate patient records in a list using 16px of vertical whitespace (`spacing-md`) and a subtle shift to `surface_container_low` on hover.
- **Radius:** All cards must use `xl` (1.5rem) rounding to maintain the "Clinical Ethereal" softness.

### Real-Time Indicators (Chips)
- **Status Chips:** Use `secondary_container` for "In Progress" and `primary_fixed` for "Waiting." 
- **Shape:** Full pill (`full` radius: 9999px).
- **Animation:** Use a subtle "pulse" opacity animation (0.8 to 1.0) for the primary status indicator to signal "Live" data.

### Input Fields
- **Style:** Background-filled (`surface_container_high`) rather than outlined. 
- **Focus State:** Transitions to `surface_container_lowest` with a 2px `primary` "Ghost Border" (20% opacity).

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a functional tool. If a screen feels cluttered, increase the padding to `xl` (1.5rem) or `2xl` (2rem).
*   **DO** use `secondary` (Teal) for all health-positive actions (Check-in complete, vitals recorded).
*   **DO** ensure all transitions (hover, modal entry) use a `300ms cubic-bezier(0.4, 0, 0.2, 1)` easing for a "premium" feel.

### Don't
*   **DON'T** use 100% black text. Use `on_surface` (#191c1e) for high contrast and `on_surface_variant` (#434655) for secondary info.
*   **DON'T** use sharp corners (`none` or `sm`). This breaks the approachable "healing" aesthetic.
*   **DON'T** use standard "Alert Red" for everything. Reserve `error` (#ba1a1a) only for critical system failures or high-risk medical alerts. For "Empty States," use soft grays and `tertiary_fixed`.

---

## 7. App-Specific Patterns

### The "Queue Flow" Timeline
To represent the journey of a patient, use a vertical "soft-link" connector. Instead of a solid line, use a wide (4px) track in `surface_container_highest` with `primary` nodes. This reinforces the "No-Line" rule while providing clear directional guidance.

### Role-Based Dashboarding
- **Doctor View:** High-density, prioritizing `title-sm` and `body-sm` to show maximum patient data.
- **Patient View:** Low-density, prioritizing `display-sm` and `headline-lg` to show their specific queue number and estimated wait time clearly from a distance.