## Lehrly Premium Polish Pass

Ziel: Lehrly fühlt sich nach diesem Pass „lebendig", hochwertig und ruhig-professionell an — Linear/Notion + Apple Education Vibe, nicht verspielt.

### 1. Motion-System (Framer Motion, zentral)

Neue Datei `src/lib/motion.ts` mit wiederverwendbaren Variants:
- `fadeUp` (opacity + y:8 → 0, 280 ms, easeOut)
- `staggerChildren` (40 ms)
- `cardFloat` (whileHover y:-2, shadow up)
- `softPress` (whileTap scale 0.98)

Anwendung:
- `PageTransition`: feinere Kurve, kein x-Shift mehr (zu „mobile"), nur opacity + 4 px y.
- Listen in Index/Library/Templates → `motion.ul` mit Stagger.
- WorksheetCard → `whileHover` (float + glow), Skeleton → shimmer.

### 2. Skeletons & Empty States

- `src/components/ui/Skeleton` already vorhanden — neuer `WorksheetCardSkeleton`, `CollectionSkeleton`, `StatCardSkeleton`.
- `src/components/EmptyState.tsx` — Illustration (Sparkles + soft brand glow), Headline, Subline, Primary CTA. Verwendet in Library/Templates/Index.

### 3. Dashboard (`Index.tsx`) ausbauen

Neue Struktur:
```
Header (greeting + avatar)
Hero CTA
Stat-Row: [Heute erstellt] [Diese Woche] [Favoriten]   ← StatCard
Quick Actions: [Letztes duplizieren] [Morgen vorbereiten] [Favoriten öffnen]
Zuletzt erstellt (horizontal scroll, mit float-cards)
Sammlungen
```
- StatCard: Zahl + Label + Mini-Icon, glas-Hintergrund, sanfter Brand-Glow links.
- Quick Actions: pill-buttons mit Icon, navigieren zu sinnvollen Routen / triggern Toast wenn nicht ready.

### 4. WorksheetCard upgrade

- Mini-Paper-Preview: A4-aspect, weiße Seite, fake Linien, Niveau-Stripe oben in Kompetenzfarbe.
- Hover: float + brand-glow ring.
- Footer-Row: Niveau-Badge, Aufgabentyp-Icons, Stern wenn favorit.
- Loading: Shimmer-Variant.

### 5. AI-Generation Feeling (`Generate.tsx`)

Während der Edge-Function-Call läuft:
- Modal-Overlay mit pulsierendem Sparkles-Icon (brand-glow).
- Status-Stepper, der durch Phasen tickt (visuell, nicht real-time): „Thema analysieren" → „Wortschatz aufbauen" → „Aufgaben formulieren" → „Lösungen prüfen" → „PDF vorbereiten". Schritte mit Check-Animation.
- Bei Erfolg: kurze Success-Animation (scale-in Check, 600 ms), dann navigate.

### 6. Worksheet Detail Premium

- Sticky Action Bar: leichter Glass (backdrop-blur, border, shadow-lg) — schon da, jetzt mit `motion` slide-in von unten beim Mount.
- Nach `handlePrint`: Success-Toast custom („Arbeitsblatt druckbereit ✓") + optional Sheet mit Optionen Teilen/Speichern/Duplizieren.
- Buttons mit `softPress`.

### 7. Visuelle Tokens (`index.css` + tailwind)

- Neue Utility-Klassen: `.glass` (bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]), `.glow-brand` (shadow brand 0/30%), `.float-card` (transition shadow + transform).
- Subtile noise/grain als optional `bg-grain` (data-uri svg) für Hero-Card.
- Shadow-Scale erweitert: `shadow-soft`, `shadow-float`, `shadow-brand-glow` (vorhanden, verfeinern).

### 8. Performance

- `framer-motion` `LazyMotion` + `domAnimation` features in `main.tsx`.
- Recents/Library: `loading="lazy"` auf evtl. Bilder.
- Keine Layout-Shift: feste Höhen für Cards.

### 9. Scope nicht enthalten

- Keine Schema-Änderungen.
- Keine neuen Routen außer evtl. `/favorites` (oder gefiltert in Library — wir filtern in Library).
- Keine Edge-Function-Logik-Änderungen — nur UI-Status.

### Dateien (neu/edit)

Neu:
- `src/lib/motion.ts`
- `src/components/EmptyState.tsx`
- `src/components/StatCard.tsx`
- `src/components/skeletons/WorksheetCardSkeleton.tsx`
- `src/components/GenerationOverlay.tsx`

Edit:
- `src/index.css` (glass/glow utilities)
- `src/components/PageTransition.tsx`
- `src/components/WorksheetCard.tsx`
- `src/pages/Index.tsx`
- `src/pages/Generate.tsx`
- `src/pages/WorksheetDetail.tsx`
- `src/pages/Library.tsx`
- `src/pages/Templates.tsx`
- `src/main.tsx` (LazyMotion)

### Verifikation

- Build/Typecheck (automatisch).
- Preview check Index + Generate Flow + Detail.
- Print-Layout darf nicht regressen (no-print Klassen bleiben).
