# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build (validates TypeScript + routes)
npm run lint     # ESLint
```

## What this is

**Quo Investor OS v1** — a stateless, client-side-only 6-screen decision wizard for California residential property investors (up to 4 units). No backend, no auth, no database. URL-encoded deal state enables bookmarking/sharing.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS · lz-string (URL compression)

## Architecture

### Data flow

```
useDeal (useReducer) → QuoDeal object
    → URL sync on every change (lib/encoding.ts)
    → each screen receives deal + typed dispatch
    → results screen runs computeResults(deal) → DerivedResults
```

### Core types (`lib/types.ts`)

`QuoDeal` is the single Offer Object. Everything flows through it. It is designed to map cleanly to licensed forms or a Quo purchase agreement later — no structural changes needed.

`RiskFlag` has `severity` (red/orange), `category`, `headline`, `explanation`, `dependency`, `clearedBy`, `unverifiedAssumption`, and `suppressedByAggressiveness`.

### Flag engine (`lib/flags.ts`)

`computeResults(deal: QuoDeal): DerivedResults` — pure function, no side effects.

- **Red flags** are never suppressed regardless of risk posture
- **Orange flags** can be `suppressedByAggressiveness = true` when aggressiveness is "aggressive" — still rendered, labeled "noted", do not count toward the signal
- Signal logic: any red → "no-go" · any unsuppressed orange → "caution" · none → "go"

### State management (`hooks/useDeal.ts`)

Single `useReducer` with action types per section (`SET_BASICS`, `SET_CONDITION`, `SET_UNIT_STRATEGY`, `SET_UNVERIFIED`, `SET_RISK_POSTURE`, `SET_OFFER_INTENT`, `LOAD`, `RESET`). URL sync happens in `useEffect` on every state change.

### Step 3 — ADU strategy

The `unitStrategy.unverified` block tracks zoning/approval fields that Quo cannot determine. On the Results screen (Step 6), these fields are editable in local state with real-time flag re-computation. Changes sync back to global deal state via `dispatchUnverified`.

### UI components (`components/ui/`)

- `ToggleGroup` — single-select horizontal buttons, generic `<T extends string>`
- `ChipSelect` — multi-select chip toggles, generic
- `NumberInput` — currency/number with prefix/suffix, formats with commas
- `FillInLaterBlock` — amber-background ADU verification block
- `RiskFlagCard` — renders one flag with severity styling + suppressed state
- `SignalBadge` — large Go/Caution/No-Go badge
- `StepShell` — wraps each step with title, subtitle, Continue button (disableable)

## Key constraints (do not violate)

- Do NOT assume exact renovation pricing or use the 70% rule / MAO math
- Do NOT determine zoning feasibility, unit counts, or ADU construction costs
- Do NOT generate CAR form language or legal contract terms
- Red flags must never be suppressed regardless of aggressiveness setting
- Offer range is always free-entry — no anchoring to ARV or asking price
- California-only (county selector is locked to CA counties)
- v1 is stateless — no login, no saved deals, no exports/PDFs
