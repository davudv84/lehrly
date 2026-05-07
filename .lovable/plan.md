# Lehrly — Premium Design Refactor

Ziel: ruhiges, editorial-professionelles Design (Apple Education / Linear / Notion). Kein Neon, kein Spielzeug, weniger visuelle Lautstärke.

Da der Scope sehr groß ist, schlage ich vor, in **3 fokussierten Phasen** zu arbeiten. Diese Runde liefere ich **Phase 1 + 2 komplett**. Phase 3 (neue Features wie Mappen/Wochenplan/Versionen/QR/Teilen) als separate Runde, weil dort Datenbank-Änderungen + neue Routes nötig sind.

---

## Phase 1 — Design-System-Foundation (in dieser Runde)

**`src/index.css` — Token-Refactor**
- Softeres Dark: `--background` von reinem Schwarz auf `222 18% 7%`, Surface-Layer (`--surface-1/2/3`) für Tiefe statt harter Borders
- Ruhigere Brand-Farbe: Grün auf `152 60% 48%` (weniger Neon), `--brand-soft` für Hintergründe
- Borders: `--border` auf `220 12% 18%` (weicher), zusätzlich `--hairline` für 0.5px-Effekte
- Shadows neu: `--shadow-xs/sm/md` als sehr weiche, niedrig-opake Layer (kein harter Drop)
- Radius-Skala konsolidieren (8/12/16/20)
- Glass-Utility verfeinern: `backdrop-blur-xl` + 6 % Weiß, statt 12 %

**Typografie**
- `Inter Tight` für Display (Headlines), `Inter` für Body — bereits im Projekt, neu strukturiert in `font-display` / `font-sans`
- `Source Serif 4` für Worksheet-Inhalt (Lesetext + Aufgaben) → editorial Look
- Type-Scale: `text-display`, `text-h1/h2/h3`, `text-body`, `text-caption` als Utility-Klassen in `index.css`
- Weniger Bold: Default `font-medium`, Bold nur für Display
- Line-Heights großzügiger (1.6 Body, 1.2 Display)

**`tailwind.config.ts`**
- Neue Token-Aliasse (surface-1/2/3, hairline, brand-soft)
- `fontFamily.display`, `fontFamily.serif`
- Radius-Skala

## Phase 2 — Komponenten & Screens (in dieser Runde)

**Atomare Komponenten überarbeiten**
- `Card`: keine harte Border, stattdessen `bg-surface-1` + 1px hairline + `shadow-xs`
- `Button` Varianten: `default` (brand, sanfter), `ghost` (mehr Padding, subtilere Hover), neue `soft`-Variante (brand-soft Hintergrund)
- `Badge` / `NiveauBadge`: ruhiger, kleinerer Text, mehr Padding
- `Input`: keine harte Border, `bg-surface-2`, focus mit brand-ring statt outline
- `Chip` (Generate-Sheet): eleganter, weniger Kontrast im Default-Zustand

**`WorksheetCard`**
- Weniger visuelle Elemente, ruhigeres Paper-Preview
- Editorial: Titel groß und klar, Meta in Caption-Größe, Trennlinie als Hairline
- Hover: minimal (translate-y-0.5 + shadow-sm), kein Glow

**`WorksheetSheet` (Druck-Layout)**
- Source Serif für Aufgabentexte, Inter Tight für Headlines
- Großzügigere Aufgabenblöcke, dezenter linker Kompetenzstreifen (2px)
- Section-Labels in Caps + Tracking
- Hairline-Divider zwischen Aufgaben statt Boxen
- Mehr Schreibraum, perfekt druckbar

**Bottom Navigation**
- Floating Pill mit Glass-Effekt, weniger Höhe, sanftere aktive States
- Safe-Area-Padding (`pb-[env(safe-area-inset-bottom)]`)

**`Index.tsx` (Home)**
- Editorial-Header: Großer ruhiger Title, „Heute, 7. Mai" Caption
- StatRow ruhiger (keine Glows, hairline statt Border)
- Quick Actions als minimale Pills mit Icon
- AI-Empfehlung-Card („Für morgen vorbereiten") als hervorgehobene Soft-Brand-Surface
- Section-Headers: Caps + Tracking, dezent

**`Generate.tsx` + `GenerationOverlay`**
- Loading-Texte verfeinern: „Wortschatz wird ausgewählt" → „Pädagogische Progression wird optimiert" → „Lösungen werden geprüft"
- Ruhigere Animation: subtile Pulse statt großem Glow, monochromer Spinner mit Brand-Akzent
- Stepper als minimale Liste mit Hairline-Verbinder

**`Library.tsx`**
- Filter-Pills ruhiger, Grid/List-Toggle (lokaler State)
- Search mit Soft-Focus
- Tag-Vorschläge unter Search

**`WorksheetDetail.tsx`**
- Sticky Action Bar als floating Glass-Pill (statt Bar)
- Lehrer/Schüler-Toggle als Segmented Control
- Aktionen: Drucken, Duplizieren, Favorit, Mit Lösung exportieren (toggle)

## Phase 3 — Neue Features (NÄCHSTE Runde, nicht jetzt)

Brauchen DB-Migration + neue Routes:
- Unterrichtsmappen / Wochenplanung
- Versionen / Verlauf
- QR-Codes & Teilen
- Kompetenztracking
- Auto-Save & „Für morgen"-Workflow

Diese würde ich nach Approval in einer dedizierten Runde umsetzen, damit Phase 1 + 2 sauber landen.

---

## Geplante Datei-Änderungen (Phase 1+2)

**Edit:** `src/index.css`, `tailwind.config.ts`, `index.html` (Source Serif laden), `src/components/ui/{card,button,badge,input}.tsx`, `src/components/{WorksheetCard,NiveauBadge,BottomNav,GenerationOverlay,StatCard,EmptyState}.tsx`, `src/components/worksheet/WorksheetSheet.tsx`, `src/pages/{Index,Generate,Library,Templates,WorksheetDetail}.tsx`

**Neu:** `src/components/ui/segmented.tsx` (Lehrer/Schüler-Toggle), `src/components/ui/section-header.tsx`

**Nicht angefasst:** Edge Function, DB-Schema, Auth-Flow, Routes.

---

Soll ich so loslegen? Falls du eine andere Reihenfolge willst (z. B. **nur Worksheet-Druck-Look** zuerst, oder **Phase 3-Features sofort statt Polish**), sag kurz Bescheid.
