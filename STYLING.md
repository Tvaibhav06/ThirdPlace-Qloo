# ThirdPlace Squad: Editorial Research Terminal Styling Specification
# Reference System: Chokepoint Dossier & Intelligence Laboratory Aesthetic

## 1. Aesthetic Philosophy & Visual Identity

The visual language of ThirdPlace Squad is transformed from generic dark-mode SaaS into an **Editorial Research Terminal / Paper and Ink Intelligence Dossier**. This design evokes the authoritative rigor of an academic research laboratory, high-stakes security triage console, and bespoke print publication.

### Key Visual Pillars
1. **Warm Parchment Canvas**: High-comfort, tactile ivory/linen backgrounds (`#f6f4ee` and `#ece7dc`) replacing sterile dark themes.
2. **Ink and Obsidian Accents**: Crisp 1px solid charcoal borders (`#262624` and `#d5cfc1`), solid obsidian black primary action buttons (`#121212`), and deliberate typography hierarchy.
3. **Dual Typeface System**:
   - **Serif Display**: Classic editorial serif (Newsreader / Playfair / Georgia) for the brand masthead, high-impact thesis statements, venue titles, and giant metric figures.
   - **Monospace Telemetry**: Precise monospace (JetBrains Mono / IBM Plex Mono / Consolas) for line items (`LI-01` to `LI-13`), coordinates, CTA transit fares, confidence scores, and status pings.
4. **Editorial Boxed Dossiers**: Content modules styled as numbered analytical panels (`01 THE SQUAD DOSSIER`, `02 THE GRAPH VIEW`, `03 TASTE SCORECARD`, `04 ITEMISED LEDGER`) with 1px borders, subtle duration stamps (`38ms`), and clear taxonomy headers.
5. **High-Density Data Tables**: Monospace tabular alignments with crisp column lines, subtle alternating row highlights, and high-visibility status badges (`[ PASS ]`, `[ EXPLOITABLE ]`, `[ BINDING FLOOR APPLIED ]`, `[ KEV ]`).

---

## 2. Design Tokens & Color Palette

### 2.1 Surfaces & Backgrounds
- Canvas Background: `#f6f4ee` (Warm Ivory Parchment)
- Panel / Box Background: `#efeae1` (Muted Linen)
- Card / Nested Container: `#e6e0d4` (Paper Alabaster)
- Active Row Highlight: `#ded7c7` (Subtle Ink Wash)
- Border Primary: `#1c1917` (Deep Charcoal Ink, 1px solid)
- Border Muted: `#d4cdbe` (Subtle Ledger Grid Line, 1px solid)

### 2.2 Typography Colors
- Ink Text Primary: `#18181b` (Near Black Charcoal)
- Ink Text Secondary: `#57534e` (Muted Warm Slate)
- Ink Text Tertiary / Metadata: `#857f72` (Subtle Timestamp / Coordinates)
- Inverted Text (on obsidian buttons): `#f8fafc`

### 2.3 Status & Telemetry Accents
- Crimson / Rust Alert: `#b91c1c` (Breach alert, binding floor active, KEV indicator)
- Crimson Background Pill: `#fee2e2` with `#b91c1c` border
- Forest / Sage Green: `#15803d` (Consensus verified, BLS savings positive, pass status)
- Green Background Pill: `#dcfce7` with `#16a34a` border
- Ochre / Amber: `#b45309` (Replanning warning, transit unmodeled notice)
- Amber Background Pill: `#fef3c7` with `#d97706` border
- Navy Transit / Polyline: `#1e3a8a` (CTA rail lines and route maps)

---

## 3. Typography Hierarchy

| Role | Font Family | Size | Weight / Style | Tracking | Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Brand Masthead** | Serif | 28px - 34px | Bold | `tracking-wider` | `THIRDPLACE SQUAD` |
| **Top Subtitle** | Monospace | 11px | Medium, Uppercase | `tracking-widest` | `CULTURAL CONSENSUS • QLOO TASTE ENGINE` |
| **Status Bar Telemetry** | Monospace | 11px | Regular | `tracking-normal` | `■ qloo ok • 20 venues ■ blind cap active` |
| **Header Navigation Tabs** | Monospace | 12px | Bold, Uppercase | `tracking-wider` | `CONSENSUS   SOLO ROUTINE   EVALS` |
| **Hero Statement / Thesis** | Serif | 24px - 30px | Semi-Bold, Editorial | Normal | `Stop guessing hangouts. Start computing consensus.` |
| **Hero Narrative** | Serif / Sans | 13px - 14px | Regular, Book | Normal | `A budget breach of $1.50 turns a hangout into awkward debt...` |
| **Big KPI Metrics** | Serif / Tabular | 36px - 44px | Bold | Tight | `205`, `18`, `74.1`, `$18.05` |
| **KPI Metric Labels** | Monospace | 10px - 11px | Medium, Uppercase | `tracking-widest` | `SQUAD CONSENSUS`, `WEEKLY SAVINGS` |
| **Panel Box Headers** | Monospace | 11px - 12px | Bold, Uppercase | `tracking-wider` | `01 THE SQUAD DOSSIER`, `02 AGENT TRACE` |
| **Table Data & Line Items** | Monospace | 11px - 12px | Regular / Bold | Normal | `LI-01 Base Venue Spend: $12.00` |

---

## 4. Layout Architecture

### 4.1 Header Bar
- Top line: Left-aligned bold serif title `THIRDPLACE SQUAD` with small caps subtitle `CULTURAL CONSENSUS • QLOO ENGINE`.
- Telemetry strip inline: Square indicators `■ qloo ok • 20 venues ■ mcp ok • 6 tools ■ blind cap on ■ cta $2.75`.
- Top right navigation: Plain uppercase text links (`CONSENSUS`, `SOLO ROUTINE`, `EVALUATION`, `INVITE`) with a 2px solid black underline beneath the active view.

### 4.2 Hero Thesis & KPI Banner
- Left column: Editorial thesis headline in serif:
  *"Stop guessing group hangouts. Start computing cultural consensus."*
  Followed by narrative explanation highlighting the mathematical wedge (budget breach, Pareto floor, integer-cent split).
- Right column: Clean summary statistics in the Chokepoint style:
  - Giant numbers (`74.1`, `$18.05`, `100%`, `13`, `0`).
  - Small uppercase mono labels underneath (`CONSENSUS SCORE`, `BLS SAVINGS`, `SPONSOR COVERAGE`, `LEDGER ROWS`, `FLOAT LEAKS`).

### 4.3 Numbered Analytical Dossier Panels
Every major section is wrapped in a bordered dossier card:
- `01 PRESET SQUAD TRIAGE`: 3 one-click scenario cards with vintage ledger borders.
- `02 INPUT DOSSIER`: Squad Member configuration with M1..M4 tabs, origin stations, and cultural seeds.
- `03 AGENT EXECUTION TRACE`: Chokepoint-style toolbelt showing live stage execution, provider call counts, and replan iterations.
- `04 RECOMMENDED CONSENSUS PLAN`: Featured venue card with editorial typography, tags, and action buttons (`Compare Without Qloo`, `Copy Invite`).
- `05 TASTE & COMMUTE FAIRNESS SCORECARD`: Monospace table with per-member rankings, commute times, and Blind Cap status badges.
- `06 13-ROW PRE-SPEND SPLIT LEDGER`: Comprehensive line-item arithmetic table with integer-cent formatting.
- `07 CORRIDOR & VENUE GEOGRAPHY`: Leaflet map styled in an archival bordered container with Chicago coordinates.

---

## 5. Component Transformation Matrix

| Component | Dark Theme Pattern | Chokepoint Editorial Pattern |
| :--- | :--- | :--- |
| `ModeSelector` | Pill toggle with blue background | Top-right clean text tabs with 2px solid black active underline |
| `PresetBar` | Dark glowing cards | Parchment dossier cards with 1px dark borders and mono tags |
| `ExecutionTrace` | Blue pulsing dots | Monospace toolbelt tree (`01 VALIDATING`, `02 RESOLVING SEEDS`, counts) |
| `FairnessScorecard` | Dark slate table | Archival ledger table with KEV-style red/green status badges |
| `SplitLedgerTable` | Slate zebra stripes | Off-white paper table with thin charcoal borders and mono figures |
| `WeeklyBurnWaterfall` | Dark cards with green badges | Numbered slots (`01`, `02`, `03`) with BLS $58.17 benchmark bar |
| `SharedCulturalDnaCard` | Indigo glass card | Ivory research card with Qloo affinity pill tags |
| `LeafletMap` | Slate 900 container | Parchment-framed map with crisp 1px charcoal border and coordinate label |
| Primary Buttons | Indigo gradient rounded pill | Solid obsidian rectangle (`#121212`) with white mono text |

---

## 6. Standalone Instruction Prompt for AI & UI Designers

```markdown
You are a Principal UI/UX Architect and Design Systems Specialist.
Transform the frontend UI of ThirdPlace Squad to match the exact aesthetic of the 'Chokepoint Dossier & Intelligence Laboratory' reference screenshots while strictly maintaining 100% of the underlying business logic, mathematical formulas, and PRD invariants:

1. Color System:
   - Replace generic dark mode (`bg-slate-950`) with a warm paper/parchment background (`#f6f4ee`).
   - Use muted linen (`#efeae1`) and alabaster (`#e6e0d4`) for card and dossier surfaces.
   - Use crisp 1px solid charcoal borders (`#1c1917` and `#d4cdbe`) for all panel containers and tables.
   - Use solid obsidian black (`#121212`) for primary action buttons with crisp white text.
   - Use KEV-style crimson badges (`#fee2e2` with `#b91c1c` text) for breaches and binding cap notices.
   - Use forest sage badges (`#dcfce7` with `#15803d` text) for verified passes and savings.

2. Typography:
   - Brand title, thesis statements, venue names, and hero metrics must use an Editorial Serif typeface (Newsreader, Playfair Display, or Georgia).
   - Line items, coordinates, status indicators, table data, and metadata must use Monospace (JetBrains Mono, IBM Plex Mono, or Consolas).
   - Subtitle and taxonomy labels must use uppercase tracked monospace (`text-xs font-mono uppercase tracking-widest`).

3. Header & Navigation:
   - Header title: 'THIRDPLACE SQUAD' in bold serif with tracking.
   - Subtitle: 'CULTURAL CONSENSUS • QLOO TASTE ENGINE'.
   - Telemetry strip: '■ qloo ok • 20 venues ■ blind cap active • privacy on ■ 13-row ledger verified ■ CTA transit $2.75'.
   - Top-right navigation: 'CONSENSUS', 'SOLO ROUTINE', 'EVALUATION', 'AUDIT' with a bold black bottom border on the active tab.

4. Layout Structure:
   - Hero Section: Editorial statement ('Stop guessing group hangouts. Start computing cultural consensus.') paired with a 5-column giant serif metric counter (`74.1`, `$18.05`, `100%`, `13`, `0`).
   - Module Panels: Prefix every section with numbered index headers: `01 PRESET SQUAD TRIAGE`, `02 INPUT DOSSIER`, `03 AGENT EXECUTION TRACE`, `04 RECOMMENDED CONSENSUS PLAN`, `05 TASTE & COMMUTE SCORECARD`, `06 13-ROW SPLIT LEDGER`, `07 CORRIDOR GEOGRAPHY`.
   - Data Tables: High-density monospace table with 1px ledger dividers and zero rounded pills.

5. Invariants Preservation:
   - All 13 line items (`LI-01` to `LI-13`) must remain strictly integer-cent calculated.
   - P0 Blind Cap Mode masking (`hidden (binding floor applied)`) must remain intact.
   - All API routes, SSE streams, disambiguation modals, and evaluation baselines must function without alteration.
```
