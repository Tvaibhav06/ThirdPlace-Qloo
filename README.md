# ThirdPlace Squad

> Culturally grounded third-place routines and multi-friend hangout consensus, powered by Qloo, for the 2026 Qloo Agentic Hackathon ("Agents, but with taste.").

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Uptime Status](https://img.shields.io/badge/Status-Live%20Production-emerald.svg)](https://thirdplace-squad.onrender.com)
[![Qloo API: Verified](https://img.shields.io/badge/Qloo%20API-Verified%20(2026)-indigo.svg)](https://qloo.com)

---

## 1. Executive Summary & Problem Solved

Young adults (ages 18 to 30) moving to new cities or organizing hangouts hit two compounding failures:
1. **Alone**: They lack affordable recurring social environments ("third places") where people with matching cultural tastes gather (STAT/AP 2023 loneliness advisory; BLS 2024 under-25 annual food-away-from-home average of $3,025 = $58.17/week).
2. **In a Group**: Group chats paralyze when tastes diverge, budgets differ, and one friend always travels farthest.

Existing tools fail them: Yelp/Google Maps filter by category and rating rather than books, games, and music; Splitwise acts only after money is spent; and midpoint tools balance geography alone.

**ThirdPlace Squad** bridges cross-media taste profiles (books, games, music, movies, TV shows) into verified physical third-place venues using Qloo, verified by deterministic integer-cent split ledgers and Pareto fairness constraints.

---

## 2. Our 4 Winning Wedges

1. **Dual-Mode Architecture (Solo Weekly Routine + Squad Consensus)**:
   A single unified backend (`/api/solo/plan` and `/api/squad/plan`) providing both a 3-slot weekly routine optimizer for newcomers (benchmarked against the $58.17/wk BLS average via `LI-13`) and a multi-friend consensus engine.
2. **Pre-Spend 13-Row Integer-Cent All-In Split Ledger (`LI-01` to `LI-13`)**:
   Eliminates rough `$-$$$$` guesswork with exact Chicago 10.25% sales tax (1025 bp), venue-type gratuity (1800 bp sit-down, 1000 bp counter, 0 bp retail/free), 2026 CTA transit fares (275c rail, 250c bus), and deterministic shared-item remainder cent splitting. Zero floating-point math touches money.
3. **P0 Blind Cap Mode (`blindCapMode: true` by default)**:
   Enforces $\max_m \text{LI-09}(m) \le \min_m \text{LI-10}(m)$ while masking individual member caps in the UI, ledger, and exported invite as `hidden (binding floor applied)`. No friend has to publicly state they are broke to prevent overspending.
4. **Weighted 2-Stop Micro-Combo Replanning (Fix F-02) + `/v2/insights/compare` Shared Cultural DNA**:
   Pairs a $0 cultural anchor (bookstore, record shop, park, gallery) with a low-cost cafe ($R(m, \text{combo}) = 0.65 \max + 0.35 \min$), with `GET /v2/insights/compare` (`compare_audiences`) extracting shared taste tags versus each member's distinctive cultural tags.

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
