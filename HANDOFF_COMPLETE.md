# 🌌 FLEXO TDS PRO — COMPLETE PROJECT HANDOFF DOCUMENT
## ⚡ COPY THIS ENTIRE FILE AND PASTE INTO YOUR NEW CHAT

---

## 1. PROJECT OVERVIEW & HISTORY

**FlexoTDS Pro** is an industrial-grade Technical Data Sheet (TDS) SaaS application designed for high-performance technical officers in the flexographic/narrow-web printing industry (Siegwerk India context).

### What Has Been Built So Far:
- ✅ Full Supabase backend with RLS policies
- ✅ Authentication with role-based access (Admin, Technical Officer, Viewer)
- ✅ Complete CRUD for Customers, Machines, TDS Records
- ✅ TDS creation wizard with 4 sections (Job Info, Substrate, Printing Units, Quality)
- ✅ Excel template injection export engine (reads `Flexo_NarrowWeb_TDS_v2.xlsx`)
- ✅ PDF and Word export generation
- ✅ Batch code lookup with autocomplete
- ✅ Auto-save functionality
- ✅ Activity logging
- ✅ User management (admin only)
- ✅ Premium dark UI with glassmorphism design system
- ✅ Custom Select inputs with "Custom" entry support
- ✅ Plate Tape color selection
- ✅ Unit sequence table with Excel paste support

---

## 2. NUCLEAR-GRADE STRICT RULES — NEVER BREAK THESE

### Terminology (Hardcoded — Do NOT Change):
- Use **"Plate Tape"** (NOT "Plate Type")
- Use **"CCM"** as default volume unit (NOT "BCM")
- All dropdowns with `allowCustom` prop MUST support custom user entry
- Batch Code Lookup MUST be embedded in final TDS view and unit edit pages

### Excel Template Parity:
- Benchmark template: `Flexo_NarrowWeb_TDS_v2.xlsx`
- Export must perfectly replicate cell formatting, merged cells, formulas, borders, column/row dimensions
- Dynamic file naming: `Flexo_TDS_{order_number}_{date}.xlsx`
- Template uploaded via Settings page to Supabase Storage bucket `templates`

### What NOT to Touch:
- DO NOT change routing structure
- DO NOT change Supabase integration or table schemas
- DO NOT change the Excel injection coordinate logic in `exportUtils.ts`
- DO NOT downgrade Tailwind (currently v3.4.17 — stable)
- DO NOT change the 4-step wizard logic
- DO NOT remove existing validation

---

## 3. EXACT TECH STACK & VERSIONS

```json
{
  "framework": "Vite ^8.0.10 + React ^19.2.5 + TypeScript ~6.0.2",
  "routing": "React Router DOM ^7.14.2",
  "database": "Supabase (@supabase/supabase-js ^2.104.1)",
  "state": "Zustand ^5.0.12",
  "styling": "Tailwind CSS ^3.4.17 + tailwindcss-animate ^1.0.7 + PostCSS ^8.5.12",
  "forms": "React Hook Form ^7.74.0 + Zod ^4.3.6 + @hookform/resolvers ^5.2.2",
  "ui": "Radix UI Primitives + Lucide React ^0.468.0 + clsx ^2.1.1 + tailwind-merge ^3.5.0",
  "export": "docx ^9.6.1 + @react-pdf/renderer ^4.5.1 + file-saver ^2.0.5 + jszip ^3.10.1 + exceljs ^4.4.0",
  "charts": "recharts ^2.15.0",
  "query": "@tanstack/react-query ^5.100.5",
  "date": "date-fns ^4.1.0"
}
```

### Fonts Used:
- **Inter** (Google Fonts) — main UI
- **Space Grotesk** (Google Fonts) — data/mono display

---

## 4. COMPLETE FILE STRUCTURE

```
flexo-tds-pro/
├── .gitignore
├── context.md                  (Project instructions)
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.cjs
├── tailwind.config.js          (THEME TOKENS — see below)
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.css
│   ├── App.tsx                 (Routes — see below)
│   ├── index.css               (CSS Variables — see below)
│   ├── main.tsx
│   ├── assets/
│   ├── components/
│   │   ├── admin/
│   │   │   └── UserManagement.tsx
│   │   ├── forms/
│   │   │   ├── BatchCodeInput.tsx
│   │   │   ├── CustomSelect.tsx
│   │   │   ├── JobInfoSection.tsx
│   │   │   ├── PlateTapeSelect.tsx
│   │   │   ├── QualitySection.tsx
│   │   │   ├── SubstrateSection.tsx
│   │   │   ├── UnitLookupSidebar.tsx
│   │   │   └── UnitSequenceTable.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── shared/
│   │   │   ├── ActivityLog.tsx
│   │   │   ├── RowActions.tsx
│   │   │   └── StatusBadge.tsx
│   │   └── ui/                 (shadcn components — standard)
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAutoSave.ts
│   │   ├── useCustomers.ts
│   │   ├── useDebounce.ts
│   │   ├── useExport.ts
│   │   ├── useMachines.ts
│   │   ├── useTDS.ts
│   │   └── useTemplates.ts
│   ├── lib/
│   │   ├── constants.ts
│   │   ├── exportUtils.ts      (CRITICAL — Excel engine)
│   │   ├── pdfExport.tsx
│   │   ├── supabase.ts
│   │   ├── utils.ts
│   │   └── wordExport.ts
│   ├── pages/
│   │   ├── Customers.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Machines.tsx
│   │   ├── Settings.tsx
│   │   ├── TDSEditor.tsx       (Main wizard)
│   │   └── TDSList.tsx
│   ├── stores/
│   │   ├── tdsFormStore.ts     (Zustand form state)
│   │   └── uiStore.ts
│   └── types/
│       ├── database.types.ts   (Supabase generated types)
│       └── tds.types.ts
└── supabase/
    ├── seed.sql
    └── migrations/
        └── 20250415000000_initial_schema.sql
```

---

## 5. CRITICAL CONFIGURATION FILES

### 5.1 `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1600px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1F4E79",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#C55A11",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#10B981",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F3F4F6",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#FEF3C7",
          foreground: "#92400E",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
```

### 5.2 `src/index.css` (CSS Variables & Utilities)
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 240 10% 4%; /* #09090b */
    --foreground: 240 5% 90%; /* #e5e1e4 */
    --card: 240 6% 10%; /* #18181b */
    --card-foreground: 240 5% 90%;
    --popover: 240 5% 16%; /* #27272a */
    --popover-foreground: 240 5% 90%;
    --primary: 235 86% 67%; /* #6366f1 Electric Indigo */
    --primary-foreground: 0 0% 100%;
    --secondary: 172 66% 50%; /* #2dd4bf Precision Teal */
    --secondary-foreground: 240 10% 4%;
    --muted: 240 6% 14%;
    --muted-foreground: 240 5% 65%; /* #a1a1aa */
    --accent: 240 6% 20%;
    --accent-foreground: 240 5% 90%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 240 6% 18%;
    --input: 240 6% 18%;
    --ring: 235 86% 67%;
    --radius: 0.25rem;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground font-sans;
    font-feature-settings: "rlig" 1, "calt" 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { @apply bg-background; }
  ::-webkit-scrollbar-thumb { @apply bg-muted-foreground/20 rounded-full; }
  ::-webkit-scrollbar-thumb:hover { @apply bg-muted-foreground/40; }
}

@layer utilities {
  .glass-panel {
    @apply bg-[#18181b]/80 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)];
  }
  .glass-modal {
    @apply bg-[#27272a]/90 backdrop-blur-lg border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)];
  }
  .data-mono {
    font-family: 'Space Grotesk', monospace;
    letter-spacing: 0.02em;
  }
  .label-caps {
    font-family: 'Space Grotesk', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.6875rem;
    font-weight: 700;
  }
  .batch-code-highlight {
    @apply bg-primary/10 border border-primary/20 text-primary font-mono;
  }
  .section-header {
    @apply text-foreground border-b border-white/5 pb-2 font-semibold text-sm flex items-center gap-2;
  }
  .status-pill {
    @apply inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border;
  }
  .status-draft { @apply bg-muted/50 text-muted-foreground border-white/10; }
  .status-completed { @apply bg-secondary/10 text-secondary border-secondary/20; }
  .status-approved { @apply bg-primary/10 text-primary border-primary/20; }
}
```

### 5.3 `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
        },
      },
    },
  },
})
```

---

## 6. DATABASE SCHEMA (Supabase PostgreSQL)

See full migration in `supabase/migrations/20250415000000_initial_schema.sql`. Key tables:

| Table | Purpose |
|-------|---------|
| `customers` | Client companies |
| `machines` | Hardware units (linked to customers) |
| `tds_records` | Main TDS data sheets |
| `tds_units` | Printing unit sequences per TDS |
| `activity_log` | Change tracking |
| `user_roles` | RBAC assignments |

### Status Flow:
```
Draft → Completed → Approved
```

### Key Constraints:
- `tds_records.num_units` CHECK (1-20)
- `tds_units.unit_no` CHECK (1-20)
- `anilox_unit` IN ('LPI', 'LCM')
- `volume_unit` IN ('CCM', 'BCM')
- `plate_tape` IN ('Red', 'Blue', 'Green', 'Orange')
- All quality tests IN ('Pass', 'Fail', 'N/A')
- `overall_result` IN ('Pass', 'Conditional', 'Fail')
- `status` IN ('Draft', 'Completed', 'Approved')
- `role` IN ('Admin', 'Technical Officer', 'Viewer')

---

## 7. ROUTING STRUCTURE

```
/login                 → Login page
/dashboard             → Dashboard (protected)
/tds                   → TDS List (protected)
/tds/new               → New TDS Editor (protected)
/tds/:id               → Edit TDS Editor (protected)
/customers             → Customer CRUD (protected)
/machines              → Machine CRUD (protected)
/settings              → Settings + Admin (protected, admin-only nav)
/                      → Redirects to /dashboard
```

---

## 8. CURRENT STATE SUMMARY

### What's Working:
- ✅ Full auth flow (login/logout)
- ✅ Role-based sidebar navigation
- ✅ Dashboard with stats cards
- ✅ TDS list with filters and pagination
- ✅ TDS editor with 4 sub-tabs (Job, Substrate, Printing, Quality)
- ✅ Unit sequence table with inline editing
- ✅ Batch code autocomplete lookup
- ✅ Plate Tape color selection
- ✅ Excel paste into unit table
- ✅ Auto-save every 1s debounce
- ✅ Export to Excel (template injection), PDF, Word
- ✅ Customer and Machine CRUD
- ✅ Activity logging
- ✅ User management (admin invite/delete)
- ✅ Settings page with template upload

### Known Issues / TODO:
- ⚠️ Add framer-motion for smoother page transitions
- ⚠️ Add more dashboard analytics charts (recharts installed)
- ⚠️ Mobile responsiveness could be improved
- ⚠️ Add keyboard shortcuts for form navigation
- ⚠️ Add bulk operations on TDS list
- ⚠️ Add print-friendly CSS view
- ⚠️ Template upload UI needs better UX
- ⚠️ Search in header is not wired to actual search
- ⚠️ Duplicate TDS option in RowActions is not implemented

---

## 9. KEY CODE PATTERNS

### Store Usage:
```typescript
const { formData, units, updateField, updateUnit, setFormData } = useTDSFormStore()
```

### Hook Pattern:
```typescript
const { data, isLoading } = useTDSRecords()
const mutation = useCreateTDS()
// mutations have onSuccess toast notifications built-in
```

### Export Flow:
```typescript
const { exportToExcel, exportToPDF, exportToWord, exporting } = useExport(tdsId)
// Template must be uploaded via Settings first
```

### Role Check:
```typescript
const { isAdmin, isTechnicalOfficer } = useAuth()
// isAdmin() → full access
// isTechnicalOfficer() → create/edit Draft, mark Completed
// Viewer → read-only
```

---

## 10. NEXT STEPS ROADMAP (GOD-LEVEL TARGET)

### Phase 1: Global Design Polish
- Upgrade glassmorphism effects
- Add page transition animations (Framer Motion)
- Improve scrollbar styling per section
- Add skeleton loading states
- Add hover micro-interactions on all cards/buttons

### Phase 2: Dashboard Supernova
- Add Recharts charts: TDS volume over time, quality pass rate %, machine performance
- Add real-time stats with auto-refresh
- Add recent activity feed widget
- Add quick-action floating button

### Phase 3: TDS Wizard Mastery
- Make unit table editable like Excel (arrow key navigation)
- Add inline validation with shake animations
- Add unit reordering via drag-and-drop
- Improve Batch Code Lookup sidebar UI
- Add "Clone TDS" functionality

### Phase 4: List & Table Excellence
- Add column sorting to all tables
- Add bulk select + bulk actions
- Add advanced filter panel (date range, multi-select)
- Add export from list view
- Add TDS detail preview drawer

### Phase 5: Performance & Polish
- Add React.memo to heavy components
- Implement virtual scrolling for long tables
- Add offline detection warning
- Add PWA support
- Add keyboard shortcuts help panel

---

## 11. ENVIRONMENT VARIABLES REQUIRED

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### To Run:
```bash
npm install
npm run dev     # Vite on port 5173
```

### To Build:
```bash
npm run build   # Output to dist/
```

---

## 12. SUPABASE STORAGE BUCKETS NEEDED

| Bucket | Purpose |
|--------|---------|
| `templates` | Stores `Flexo_NarrowWeb_TDS_v2.xlsx` for export engine |

---

## 13. CUSTOM CONSTANTS (`src/lib/constants.ts`)

```typescript
export const COLORS = {
  primary: '#1F4E79',
  secondary: '#C55A11',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  batchYellow: '#FEF3C7',
} as const

export const JOB_TYPES = ['Conversion', 'New Shift', 'Custom…'] as const
export const SHIFT_NUMBERS = ['1', '2', '3', 'General'] as const
export const ACTION_ON_JOB = ['Setup', 'Production', 'Cleanup', 'Maintenance', 'Custom…'] as const
export const SUBSTRATES = ['PET', 'BOPP', 'PE', 'Kraft', 'Custom…'] as const
export const SURFACE_TYPES = ['Corona Treated', 'Untreated', 'Primed', 'Custom…'] as const
export const TREATMENT_SIDES = ['Front', 'Back', 'Both'] as const
export const FOIL_TYPES = ['Hot Stamping', 'Cold Foil', 'None', 'Custom…'] as const
export const PLATE_TAPE_COLORS = [
  { value: 'Red', color: '#EF4444' },
  { value: 'Blue', color: '#3B82F6' },
  { value: 'Green', color: '#10B981' },
  { value: 'Orange', color: '#F97316' },
] as const
export const TEST_RESULTS = ['Pass', 'Fail', 'N/A'] as const
export const TDS_STATUSES = ['Draft', 'Completed', 'Approved'] as const
export const USER_ROLES = ['Admin', 'Technical Officer', 'Viewer'] as const
```

---

## 14. IMPORTANT FUNCTION REFERENCES

### `computeOverallResult` (src/lib/utils.ts):
```typescript
// If ANY test is Fail → "Fail"
// If ALL tests are Pass → "Pass"
// Otherwise → "Conditional"
```

### Excel Injection Row References (src/lib/exportUtils.ts):
```typescript
UNIT_TABLE_START_ROW = 19          // Unit data starts here
UNIT_TEMPLATE_ROWS = 10            // Template has 10 unit rows
QUALITY_VALUES_TEMPLATE_ROW = 32   // Quality test results row
QUALITY_NOTES_TEMPLATE_ROW = 34    // Notes row
PREPARED_BY_TEMPLATE_ROW = 36      // Footer info
PREPARED_AT_TEMPLATE_ROW = 37
```

---

## 15. WHAT TO TELL THE NEW AI

Paste this exact prompt to the new chat after pasting this file:

```
You are taking over FlexoTDS Pro. Read the HANDOFF_COMPLETE.md file carefully.

STRICT RULES:
1. NEVER change "Plate Tape" to "Plate Type"
2. NEVER change "CCM" to "BCM" as default
3. NEVER touch routing or Supabase integration
4. NEVER downgrade Tailwind (v3.4.17 is LOCKED)
5. ALWAYS preserve the Excel template injection logic
6. ALWAYS support "Custom" input on dropdowns with allowCustom=true

YOUR MISSION: Execute Phase 1 of the God-Level roadmap. Start by:
1. Reading tailwind.config.js and src/index.css
2. Establishing premium color tokens and animations
3. Upgrading the global glassmorphism design system
4. Then proceed to Phase 2 (Dashboard charts) and Phase 3 (Wizard polish)

Do you understand? Confirm and begin Phase 1 immediately.
```

---

**END OF HANDOFF DOCUMENT**
**COPY EVERYTHING ABOVE AND PASTE INTO NEW CHAT**
**SYSTEM BY IRSHAD ANSARI // PUSA INSTITUTE OF TECHNOLOGY**

