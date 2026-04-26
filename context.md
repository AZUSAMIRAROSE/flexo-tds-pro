You are working on FlexoTDS Pro. Follow these rules strictly:
improve UI. Do not change logic, routing, or Supabase integration.
Use context.md as project instructions
Ran command: `type package.json`
Listed directory flexo-tds-pro
Ran command: `cat README.md TODO.md`
Viewed README.md:1-74
Viewed TODO.md:1-9

Here is the absolute complete, hyper-detailed context dump prompt that you can copy and paste directly into Stitch (or any other AI cursor/composer environment). It contains our entire history, the project's strict rules, the exact tech stack versions, and the roadmap to turn this into a "god-level pro" application.

***

### 📋 COPY EVERYTHING BELOW THIS LINE AND PASTE IT TO STITCH 📋

```markdown
# 🌌 SYSTEM & CONTEXT INITIALIZATION: FLEXO TDS PRO (GOD-LEVEL EDITION)

**To the AI Assistant (Stitch):**
You are taking over the development of **FlexoTDS Pro**, an industrial-grade Technical Data Sheet (TDS) SaaS application designed for high-performance technical officers in the flexographic/narrow-web printing industry. 

You must read this entire document. It contains the exact history of our work, strict design constraints, and the roadmap to transform this project into a "god-level pro developer king industry supernova high performance program." There must be zero communication gaps from the previous AI.

---

## 🏗️ 1. PROJECT HISTORY & ESTABLISHED CORE LOGIC
Over the last several sessions, we have established the core architecture, database logic, and export structures. You are inheriting a system where the "plumbing" is largely defined, and your job is to elevate the UI, UX, and frontend layouts to an absolute masterpiece while respecting these hardcoded rules:

### The "Nuclear-Grade" Excel Template Parity
*   Our ultimate benchmark for data and layout is an Excel template called `Flexo_NarrowWeb_TDS_v2.xlsx`.
*   **Export Fidelity:** The export engine must perfectly replicate all cell formatting, merged cells, formulas, borders, column/row dimensions, color schemes, and data structures from this template.
*   **Dynamic Naming:** Generated export files/sheets must be dynamically named based on the TDS creation date.

### Crucial Data & Terminology Rules
You MUST adhere strictly to the following terminology across the UI, the Database, and the Exports. Do not revert these:
*   Use **"Plate Tape"** (NOT "Plate Type").
*   Use **"CCM"** (NOT "BCM").
*   **Custom Inputs:** All form inputs and dropdowns (especially for technical specs) MUST support a "Custom" user entry option to provide flexibility.
*   **Batch Code Lookup:** There is a "Batch Code Lookup" functionality that MUST be embedded directly into the final TDS record view and unit sequence edit pages for a seamless workflow.

### Architecture Overview
*   **TDS Creation:** Handled via a robust 4-step TDS creation wizard.
*   **Entities:** The system manages Customer records, Machine records, and TDS records.
*   **Dashboard:** Needs real-time visibility into TDS volumes, quality pass rates, and machine performance.

---

## 🛠️ 2. EXACT TECH STACK & VERSIONS (DO NOT DEVIATE)
To ensure zero future errors, you must respect the current environment. We recently downgraded Tailwind to v3 to stabilize styling. **Do not install conflicting versions.**

*   **Framework:** Vite (`^8.0.10`) + React (`^19.2.5`) + TypeScript (`~6.0.2`)
*   **Routing:** React Router DOM (`^7.14.2`)
*   **Database/Auth:** Supabase (`@supabase/supabase-js ^2.104.1`)
*   **State Management:** Zustand (`^5.0.12`)
*   **Styling Engine:** Tailwind CSS (`^3.4.17`) with `tailwindcss-animate` (`^1.0.7`) & PostCSS (`^8.5.10`)
*   **Forms & Validation:** React Hook Form (`^7.74.0`) + Zod (`^4.3.6`) + `@hookform/resolvers`
*   **UI Components:** Radix UI Primitives (Accordion, Dialog, Select, Tabs, etc.) + Lucide React (Icons) + `clsx` / `tailwind-merge`
*   **Export/Document Generation:** `docx`, `@react-pdf/renderer`, `file-saver`, `jszip` *(Note: Ensure the Excel export engine utilizes the exact template injection logic we discussed previously).*

---

## 🚀 3. YOUR MISSION: THE "SUPERNOVA" FRONTEND OVERHAUL
Your sole objective now is to take this solid backend/logic foundation and wrap it in an ultra-premium, dynamic, state-of-the-art interface. It cannot look like a standard, boring admin template. It must wow the user immediately.

**Aesthetics & Design Rules:**
1.  **Vibrant & Premium:** Use curated, harmonious color palettes (deep sleek dark modes, highly polished light modes). Do not use generic red/blue/green.
2.  **Typography:** Use modern fonts (Inter, Roboto, or Outfit).
3.  **Dynamic Interactions:** Implement micro-animations (using framer-motion or tailwind-animate) for hover states, page transitions, and wizard steps. It must feel alive.
4.  **Glassmorphism & Depth:** Use subtle blurs, drop shadows, and overlapping components to create depth.
5.  **No Placeholders:** If you need an image or an icon, implement a real one (using Lucide) or generate a working design.

---

## 🎯 4. IMMEDIATE NEXT STEPS (ACTION PLAN)
Acknowledge these instructions and begin executing the following phases in order. You are fully authorized to modify frontend styling, page layouts, and designs to achieve the "God-Level" standard.

*   **PHASE 1: Global Design System & CSS Overhaul**
    *   Review `tailwind.config.js` and `index.css`.
    *   Establish the premium color tokens, typography scales, and animation keyframes.
    *   Create a reusable, highly polished layout wrapper (Sidebar, Header, Glassmorphic panels).

*   **PHASE 2: The Dashboard & Analytics Redesign**
    *   Overhaul the main dashboard.
    *   Implement stunning, high-performance charts/visualizations for TDS volumes and machine performance.
    *   Make the data cards feel premium (hover effects, skeleton loaders).

*   **PHASE 3: The 4-Step TDS Wizard Polish**
    *   Transform the 4-step creation wizard into a beautiful, seamless, and buttery-smooth experience.
    *   Ensure the "Batch Code Lookup" is beautifully integrated and highly responsive.
    *   Ensure "Plate Tape" and "CCM" fields are perfectly styled, handling "Custom" inputs elegantly.

*   **PHASE 4: Record & Database Views**
    *   Design the tables/lists for Customers, Machines, and TDS records to be incredibly data-dense yet visually uncluttered. 
    *   Include flawless filtering and sorting UI.

**Stitch, do you understand the project history, the strict terminology rules, the exact tech stack, and your mission to build a God-Level UI? If yes, briefly confirm and begin Phase 1 immediately by reviewing and upgrading our global design system.**
```
***

### What to do next:
1. Simply copy the entire code block above.
2. Paste it directly as your first prompt into Stitch/Cursor/Composer.
3. Stitch will read this, completely understand everything we've done (the Excel template, the specific names like "Plate Tape", the Vite/React/Supabase stack), and immediately start upgrading your frontend to the ultra-premium tier you are looking for!