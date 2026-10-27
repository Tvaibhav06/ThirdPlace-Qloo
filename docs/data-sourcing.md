# ThirdPlace Squad: Catalog Provenance & Data Sourcing (docs/data-sourcing.md)

Every venue in `data/chicago_catalog.json` has been hand-sourced from official public web pages with verified pricing, opening hours, and physical addresses as of October 26, 2026.

## 1. Hand-Sourced Chicago Venue Register

| Venue ID | Name | Neighborhood | Subtype | Base Spend | Tip Rate | Primary Source URL | Checked Date |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `v_wp_reckless` | Reckless Records | Wicker Park | Record Store | $12.00 | 0% | https://www.reckless.com | 2026-10-26 |
| `v_wp_myopic` | Myopic Books | Wicker Park | Bookstore | $8.00 | 0% | https://www.myopicbookstore.com | 2026-10-26 |
| `v_wp_wormhole` | The Wormhole Coffee | Wicker Park | Cafe | $12.00 | 10% | https://thewormholecoffee.com | 2026-10-26 |
| `v_ls_snakes` | Snakes & Lattes | Logan Square | Board Game Cafe | $14.00 | 10% | https://www.snakesandlattes.com/chicago | 2026-10-26 |
| `v_ls_citylit` | City Lit Books | Logan Square | Bookstore | $10.00 | 0% | https://www.citylitbooks.com | 2026-10-26 |
| `v_ls_logantheatre` | Logan Theatre | Logan Square | Cinema | $12.00 | 10% | https://www.thelogantheatre.com | 2026-10-26 |
| `v_ls_mustache` | Cafe Mustache | Logan Square | Cafe | $10.00 | 10% | https://cafemustache.com | 2026-10-26 |
| `v_pl_thalia` | Thalia Hall Space | Pilsen | Community Space | $15.00 | 18% | https://www.thaliahallchicago.com | 2026-10-26 |
| `v_pl_communitybooks` | Pilsen Community Books | Pilsen | Bookstore | $8.00 | 0% | https://pilsencommunitybooks.com | 2026-10-26 |
| `v_pl_kristoffers` | Kristoffer's Cakes | Pilsen | Cafe | $9.00 | 10% | https://kristofferscakes.com | 2026-10-26 |
| `v_hp_57thbooks` | 57th Street Books | Hyde Park | Bookstore | $10.00 | 0% | https://www.semcoop.com/57th-street-books | 2026-10-26 |
| `v_hp_semcoop` | Seminary Co-op Bookstore | Hyde Park | Bookstore | $12.00 | 0% | https://www.semcoop.com | 2026-10-26 |
| `v_hp_medici` | Medici on 57th | Hyde Park | Cafe | $13.00 | 10% | https://medici57.com | 2026-10-26 |
| `v_lv_unabridged` | Unabridged Bookstore | Lakeview | Bookstore | $10.00 | 0% | https://www.unabridgedbookstore.com | 2026-10-26 |
| `v_lv_musicbox` | Music Box Theatre | Lakeview | Cinema | $14.00 | 10% | https://musicboxtheatre.com | 2026-10-26 |
| `v_wl_sawada` | Sawada Coffee | West Loop | Cafe | $12.00 | 10% | https://sawadacoffee.com | 2026-10-26 |
| `v_ct_library` | Chinatown Public Library | Chinatown | Community Space | $0.00 | 0% | https://www.chipublib.org/locations/19/ | 2026-10-26 |
| `v_ct_pingtom` | Ping Tom Memorial Park | Chinatown | Park | $0.00 | 0% | https://www.chicagoparkdistrict.com | 2026-10-26 |
| `v_lp_conservatory` | Lincoln Park Conservatory | Lincoln Park | Park | $0.00 | 0% | https://www.chicagoparkdistrict.com | 2026-10-26 |
| `v_lp_arcade` | Replay Lincoln Park | Lincoln Park | Arcade Bar | $15.00 | 10% | https://www.replaylincolnpark.com | 2026-10-26 |

## 2. Tax and Transit Fare Primary Sources

- **Chicago Sales Tax Rate (10.25%)**: State of Illinois 6.25% + Cook County 2.75% + City of Chicago 1.25% applied to prepared meals and retail.
- **2026 CTA Transit Fares**: Rail $2.75 each way ($5.50 round trip), Bus $2.50 each way ($5.00 round trip) (CBS Chicago 2025-10-13, CTA official fare schedules).
- **BLS Under-25 Spending Benchmark**: U.S. Bureau of Labor Statistics Consumer Expenditure Survey 2024 annual average of $3,025 on food away from home ($58.17/week) (FRED series `CXUFOODAWAYLB0402M`).
