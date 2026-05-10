## Two new features for Lehrly

Both features run via **Lovable AI** (built-in gateway, no external API keys, no user setup). Onboarding, dashboard layout, and worksheet generation logic stay untouched except where explicitly noted.

---

### Feature 1 — Arbeitsblatt scannen & korrigieren

**Database** (new migration)
- `corrections` table: `id`, `user_id`, `worksheet_id` (nullable), `student_name`, `score`, `max_score`, `grade` (1–6), `exercise_breakdown` jsonb, `image_path` (storage), `created_at`, `updated_at`
- RLS: owner-only select/insert/update/delete
- Storage bucket `correction-uploads` (private), with RLS so users only access their own folder

**Edge function** `correct-worksheet`
- Accepts `{ worksheetId?, imageBase64, mimeType, studentName? }`
- Loads original worksheet (if `worksheetId` given) for the solution key
- Calls Lovable AI with `google/gemini-2.5-pro` (vision-capable) using the exact prompt from the spec, structured tool-call output: `total_score`, `max_score`, `grade`, `exercises[]` (`number`, `score`, `max`, `wrong_answers[]` with `student`/`correct`)
- If no worksheetId, returns `{ needsOriginal: true }` so the client can show the picker
- Inserts into `corrections` and returns the row

**Frontend**
- New `Schnellaktion` on dashboard: camera-icon button "Arbeitsblatt scannen" (added to the existing Quick Actions row — no layout change to the dashboard structure)
- New route `/scan` → `Scan.tsx`:
  1. File/camera input (`<input capture="environment" accept="image/*,application/pdf">`)
  2. Optional original-worksheet picker (auto-suggested by recent + manual select)
  3. Loading state "Korrigiere Arbeitsblatt…"
  4. Calls `correct-worksheet` edge function
- New route `/corrections/:id` → `CorrectionResult.tsx`:
  - Header: worksheet title + editable student name
  - Score card: "X / Y Punkte" + percentage + Note
  - Per-exercise list with green ✓ or strike-through wrong → green correct
  - "Als PDF exportieren" (uses existing print css pattern) + "Korrektur speichern"
- New "Korrekturen" tab inside Bibliothek (Library.tsx gets a top-level tabs switch: Arbeitsblätter / Korrekturen) listing saved corrections

---

### Feature 2 — Klassenbucheintrag

**Database** (same migration)
- `klassenbuch_entries`: `id`, `user_id`, `worksheet_id`, `content` jsonb, `homework` text (nullable), `created_at`, `updated_at` — RLS owner-only

**Edge function**
- Extend `generate-worksheet` to accept `generateKlassenbuch: boolean`
- After worksheet insert, if true, makes a second Lovable AI call (`google/gemini-2.5-flash`) using the exact spec prompt with structured output: `lerninhalt`, `behandelte_aufgaben[]`, `sprachliche_schwerpunkte`, `kompetenzbereiche[]`, `datum`
- Inserts into `klassenbuch_entries`, returns `klassenbuchId` alongside worksheet id

**Frontend**
- `Generate.tsx` form: add toggle "Klassenbucheintrag generieren" (default ON) in a new Section block
- `CompletionOverview` (worksheet/CompletionOverview.tsx): add tab switch "Arbeitsblatt | Klassenbuch" when a Klassenbuch entry exists. Klassenbuch tab renders white-card academic style with: Datum, Niveau, Thema, Lerninhalt, Behandelte Aufgaben, Sprachliche Schwerpunkte, Kompetenzbereiche, editable Hausaufgabe textarea, footer with "In Klassenbuch-Format kopieren" (clipboard) and "Als PDF exportieren" (print)
- `WorksheetDetail.tsx`: same tab switch when a Klassenbuch entry exists for that worksheet

---

### What stays unchanged
- Onboarding (`FirstLaunch`, gate logic)
- Dashboard layout (only adding one Quick Action chip)
- Worksheet generation prompt/logic — only adds an optional secondary call
- Auth, routing guards, design tokens

### Tech notes
- All AI via existing `https://ai.gateway.lovable.dev/v1/chat/completions` pattern using `LOVABLE_API_KEY` (already configured)
- New deps: none required (image upload via native `<input type="file">`, base64 in browser); jsPDF/print uses existing print.css pattern
- Will surface 402/429 errors via toasts as in current edge function
