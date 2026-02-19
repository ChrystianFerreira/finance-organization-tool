# Finance Organizer Tool

A personal finance organizer web app in Brazilian Portuguese (pt-BR). It walks users through a 4-step wizard to input income, expenses, installments, and then view a dashboard summary with weekly budget calculations.

## Tech Stack

- **Next.js 15** (App Router, Turbopack dev server) with **React 19** and **TypeScript 5**
- **Tailwind CSS v4** (CSS-first config in `globals.css`, no `tailwind.config.js`)
- **next-themes** for dark/light mode (`attribute="class"`)
- **lucide-react** for icons
- **react-currency-input-field** for BRL currency inputs (wrapped by `CurrencyInput.tsx`)
- **uuid** v4 for unique IDs on expenses and installments
- **shadcn/ui** configured (`components.json`) but no shadcn components added yet
- Path alias: `@/*` → `./src/*`

## Commands

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run lint       # ESLint
npm run lint:fix   # ESLint auto-fix
npm run format     # Prettier format
```

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Tailwind v4 config, CSS custom properties, dark mode
│   ├── layout.tsx           # Root layout: fonts + ThemeProvider
│   └── page.tsx             # Renders <FinancialOrganizer />
├── components/
│   ├── FinancialOrganizer.tsx  # Root orchestrator: state, step routing, context provider
│   ├── IncomeForm.tsx          # Step 0: income type (fixed/variable) and amounts
│   ├── ExpensesForm.tsx        # Step 1: fixed expenses by category
│   ├── InstallmentsForm.tsx    # Step 2: credit card installments
│   ├── Dashboard.tsx           # Step 3: summary, weekly budget, savings goal
│   ├── DataControls.tsx        # Header: JSON export/import buttons
│   └── CurrencyInput.tsx       # Reusable BRL currency input wrapper
├── context/
│   └── FinancialContext.ts     # React Context + useFinancial() hook
├── hooks/
│   └── useLocalStorage.ts      # Generic localStorage-backed useState (SSR-safe)
├── types/
│   └── index.ts                # All TypeScript types
└── utils/
    ├── index.ts                # formatCurrency, parseCurrency, calculateTotalExpenses, calculateWeeklyBudget
    └── defaultExpenses.ts      # Pre-seeded expense categories for new users
```

## Architecture

### 4-Step Wizard Flow

1. **Renda (Income)** — user picks `fixed` or `variable` income, enters amounts
2. **Gastos (Expenses)** — categorized expense items (add/remove items and categories)
3. **Parcelamentos (Installments)** — credit card installment plans with remaining months
4. **Resultado (Dashboard)** — summary cards, weekly budget, savings goal editor

Navigation: each step has "Voltar" (back) and "Continuar" (next) buttons. The step index is persisted in localStorage.

### State Management

No external state library. Three layers:

1. **`useLocalStorage` hook** — all top-level state in `FinancialOrganizer.tsx` is backed by localStorage:
   - `financial-organizer-step` (number) — current wizard step
   - `financial-organizer-scenario` (`'optimistic' | 'pessimistic'`) — for variable income
   - `financial-organizer-data` (`FinancialData` object) — all financial data
2. **React Context** (`FinancialContext`) — provides `data`, `updateData`, `scenario`, `setScenario` to all child components
3. **Local `useState`** — ephemeral form state within each step component

`updateData` does a shallow merge: `setData(prev => ({ ...prev, ...newData }))`.

### Data Model (`src/types/index.ts`)

```ts
FinancialData {
  income: { type: 'fixed' | 'variable', fixedAmount?, minAmount?, maxAmount? }
  fixedExpenses: ExpenseCategory[]   // { category: string, items: ExpenseItem[] }
  savingsGoal: number
  installments: Installment[]        // { id, description, totalAmount, remainingInstallments, monthlyAmount }
}
```

- All monetary values are numbers (BRL)
- IDs are UUIDv4 strings
- `ExpenseItem`: `{ id, name, amount }`
- Variable income supports optimistic (maxAmount) and pessimistic (minAmount) scenarios

### Data Persistence

- All state auto-saves to localStorage via `useLocalStorage` hook
- Export: downloads `financas-YYYY-MM-DD.json` with the full `FinancialData` object
- Import: reads a JSON file, validates it has the 4 expected keys, loads it, jumps to Dashboard

### Styling Conventions

- Tailwind CSS v4 with inline utility classes (no CSS modules)
- Color tokens defined as OKLCH CSS custom properties in `globals.css`
- Primary accent: green-600 (`bg-green-600`, `text-green-600`) — money/finance theme
- Prettier auto-sorts Tailwind classes (`prettier-plugin-tailwindcss`)
- All UI text is in **Brazilian Portuguese**

## Key Patterns

- All components are functional with hooks, using `'use client'` directive
- Currency formatting: use `formatCurrency()` from `@/utils` for display, `CurrencyInput` component for form inputs
- New expense/installment items get a `uuidv4()` ID
- Default expense categories are defined in `utils/defaultExpenses.ts` — edit this file to change what new users see
- The `calculateWeeklyBudget` utility divides monthly surplus by 5 (weeks per month)

## Language

The entire UI is in Brazilian Portuguese. All labels, buttons, placeholders, and messages should be in pt-BR. Variable names and code comments can be in English or Portuguese (the codebase mixes both — prefer English for new code).
