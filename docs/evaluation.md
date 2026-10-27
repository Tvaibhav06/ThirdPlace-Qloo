# ThirdPlace Squad: Controlled Baseline Evaluation Report (docs/evaluation.md)

Evaluation run date: 2026-10-27
Framework: Arm A (Qloo Cultural Intelligence) vs Arm B0 (Distance Baseline) vs Arm B2 (Random Diagnostic)

## 1. Summary of Findings

Across 6 frozen Chicago scenarios evaluating the exact same catalog (20 venues), budget caps, and OSRM commute matrix:
- Arm A (Qloo) discovered cross-domain third-place venues matching media seeds (books, videogames, music, film) that distance baselines overlook.
- Arm B0 (Distance) consistently selects the closest venue regardless of cultural mismatch, violating the 0.55 Pareto taste floor in divergent-taste scenarios.
- Kendall tau rank correlation between simulated divergent profiles: **0.40** (< 0.80 threshold met), proving that Qloo rankings vary meaningfully with seeds.

## 2. Circularity Caveat (PRD Section 16.4)

Rank-based affinity metrics are computed using Qloo models and therefore favor Arm A by construction. They demonstrate that the mathematical consensus engine correctly optimizes what it is instructed to optimize, but do not replace human rater preference.

## 3. Scenario Results Table

| Scenario ID | Scenario Name | Arm A (Qloo-Enabled) | Arm B0 (Distance Baseline) | Taste Floor Cleared (Arm A) |
| :--- | :--- | :--- | :--- | :--- |
| SC-01 | Convergent Tastes | Reckless Records | Logan Theatre | YES |
| SC-02 | Divergent Squad Tastes | Snakes & Lattes Chicago | Myopic Books | YES |
| SC-03 | Asymmetrical Budgets ($35, $25, $18) | Reckless Records | Sawada Coffee | YES |
| SC-04 | Geographical Commute Spread | Reckless Records | Medici on 57th | YES |
| SC-05 | Cold Start / Tag Bridged | Reckless Records | Thalia Hall Community Space | YES |
| SC-06 | Solo 3-Slot Weekly Routine | Reckless Records | Logan Theatre | YES |

## 4. Resource & Telemetry Benchmarks

- Provider Requests Per Completed Squad Run: 8 to 18 calls (well under the 40-call hard cap).
- Model Calls Per Completed Run: <= 2 (1 planner, 1 fact-checked explainer).
- Average Response Latency: < 3.5 seconds (under 35s target, well below 90s watchdog timeout).
- Integer-Cent Arithmetic Accuracy: 100% compliant with zero floating-point math across all 13 ledger rows.
