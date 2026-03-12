# Finance Organizer Tool

A personal finance organizer web app that helps you plan your monthly budget and track real spending against it. The UI is entirely in Brazilian Portuguese (pt-BR).

## Features

### Budget Wizard

A 4-step wizard to set up your monthly budget:

1. **Income** - Fixed or variable income (optimistic/pessimistic scenarios)
2. **Fixed Expenses** - Categorized expense items (rent, utilities, subscriptions, etc.)
3. **Installments** - Credit card installment plans with remaining months
4. **Dashboard** - Summary cards, weekly budget calculation, and savings goal

### Expense Tracking

Import your bank statement (Nubank CSV) and categorize each transaction against your budget:

- Auto-categorization based on previously mapped transaction titles
- Fingerprint-based deduplication for safe re-imports
- Per-item spending progress bars (budgeted vs actual)
- Monthly savings comparison (actual vs goal)
- Month selector for reviewing past data

## Tech Stack

- **Next.js 15** (App Router, Turbopack) with **React 19** and **TypeScript 5**
- **Tailwind CSS v4** (CSS-first config)
- **next-themes** for dark/light mode
- **lucide-react** for icons
- All data persisted in **localStorage** (no backend)

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run lint       # ESLint
npm run lint:fix   # ESLint auto-fix
npm run format     # Prettier format
npm run typecheck  # TypeScript type checking
```
