# ThirdPlace Squad

> Culturally grounded third-place routines and multi-friend hangout consensus, powered by Qloo, for the 2026 Qloo Agentic Hackathon ("Agents, but with taste.").

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Uptime Status](https://img.shields.io/badge/Status-Live%20Production-emerald.svg)](https://thirdplace-squad.onrender.com)

---

## 🎯 Hackathon Submission

**Live Demo**: [https://thirdplace-squad.onrender.com](https://thirdplace-squad.onrender.com)  |  **Repo**: [https://github.com/Tvaibhav06/ThirdPlace-Qloo](https://github.com/Tvaibhav06/ThirdPlace-Qloo)

> *ThirdPlace Squad is a social consensus engine that turns the chaos of "Where should we hang out?" into a mathematically elegant, budget-respectful plan that everyone can agree on — without anyone having to admit they're broke.*

## 🚀 Hackathon Submission Details

This repository is submitted for the **2026 Qloo Agentic Hackathon**.

1. **Live Demo**: [https://thirdplace-squad.onrender.com](https://thirdplace-squad.onrender.com)
2. **Source Code**: [https://github.com/Tvaibhav06/ThirdPlace-Qloo](https://github.com/Tvaibhav06/ThirdPlace-Qloo)
3. **License**: [MIT License](LICENSE)

> *Everything you need to run this demo is in `render.yaml`. One-click deploy on Render (free tier).*

---


## 🧠 What Makes Us Different

Young adults moving to new cities often hit two walls:
1. **Alone**: Finding a recurring "third place" (a cafe, bookstore, or park) that feels like it "gets" you, without breaking the bank.
2. **In a Group**: The group chat paralysis where budgets differ, tastes diverge, and no one wants to travel an hour.

ThirdPlace Squad bridges this gap. We combine Qloo’s massive cultural graph (books, music, movies) with a deterministic, integer-cent financial engine that respects the reality of budgets.

### The 4 Winning Wedges

1. **Dual-Mode Intelligence**: Whether you're flying solo for a weekly routine or wrangling a squad of friends, our engine uses the same rigorous constraint logic to find the intersection of culture, geography, and fair spending.
2. **The 13-Row Split Ledger**: No more rough estimates. We calculate exact Chicago 10.25% tax, transit fares, and gratuity, then split the remainder cent-by-cent deterministically. No floating-point math, no "I'll get it next time" drama.
3. **P0 Blind Cap Privacy**: Our `blindCapMode` enforces a budget constraint without exposing individual member caps. Everyone gets a fair hangout they can afford, and no one has to publicly declare a limit.
4. **Weighted Micro-Combo Replanning**: If a group plan hits a budget limit, our agent doesn't just fail — it automatically re-plans by pairing a $0 cultural anchor (like a bookstore or gallery) with a low-cost cafe. It’s the ultimate Pareto-fair solution for "being there is what matters."

---

## 3. Architecture & Qloo Orchestration

```
[ Browser Client UI (390px Mobile Responsive) ]
                     │  ▲
        SSE Stream   │  │  JSON Payloads
                     ▼  │
[ Next.js App Router API Routes (/api/squad/plan, /api/solo/plan) ]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
[ Orchestrator State Machine ] ──► [ Pure Math & Constraint Engines ]
  - validating                     - thirdPlaceLedger.mjs (13 rows)
  - resolving_seeds                - validator.ts (hours, caps, floors)
  - scoring_taste                  - poolSelector.ts (prefilter P)
  - checking_constraints           - soloScheduler.ts (3-slot routine)
  - replanning (max 3)
  - packaging
         │
         ├──► QlooClient (/search, /v2/tags, /v2/insights, /v2/insights/compare)
         ├──► TicketmasterClient (Discovery v2 geoPoint, 1h cache, surge check)
         └──► OsrmClient (Route polyline with Haversine fallback)
```

---

## 4. One-Click Chicago Presets (Zero Login)

Judges can evaluate ThirdPlace Squad with one click with zero login:
- **Preset A ("New in Logan Square", Solo Routine)**: Logan Square origin, 3 slots (Tue, Thu, Sat), $35 weekly cap, walk/bike commute. Demonstrates the weekly burn-rate waterfall, 3 distinct venue subtypes, and $23.78/week savings vs the BLS benchmark.
- **Preset B ("Three friends, three budgets", Squad Consensus)**: M1 ($35, Wicker Park), M2 ($25, Logan Square), M3 ($18, West Loop). Exercises budget cap breach, P0 Blind Cap privacy masking, and 2-stop micro-combo replanning.
- **Preset C ("Far apart", Squad Consensus)**: Hyde Park, Logan Square, and Pilsen origins with 30m travel limit. Exercises commute fairness breach and neighborhood shift replanning.

---

## 5. Local Setup & Verification

### Prerequisites
- Node.js >= 22.16.0
- npm >= 10.9.0

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/thirdplace-squad.git
cd thirdplace-squad

# Install pinned dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Running Tests
```bash
# Run pure ESM 13-row ledger invariant tests (Worked Examples 1-3 & INV-01..10)
npm run test:ledger

# Run constraint validator tests (Budget, commute, and Pareto taste breaches)
npm run test:validator

# Run Qloo branded types, Zod schema transforms, and cache tests
npm run test:qloo

# Run full evaluation benchmark script (Generates docs/evaluation.md)
npm run test:eval
```

### Running Dev Server
```bash
npm run dev
# Open http://localhost:3000
```

---

## 6. Verified Sponsor Coverage & Terms Compliance

- **Sponsor Coverage (1 of 1, 100%)**: Qloo is the sole verified sponsor of the 2026 Qloo Agentic Hackathon. Devpost is the hosting platform, not a sponsor.
- **External Utilities**: Ticketmaster Discovery API v2, OSRM public demo routing, OpenStreetMap, Leaflet, and Render Starter are independent external tools.
- **Safe Use & Privacy (HR-10)**: Keys stay server-side (`X-Api-Key`). Member display names never leave the browser. Zero profiling of sensitive traits. Zero data stored after 15 minutes.

---

## 7. License

This repository is licensed under the [MIT License](LICENSE).
