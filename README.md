# Lehrly

> Arbeitsblätter für Lehrerinnen und Lehrer — worksheet management built for teachers.

![CI](https://github.com/davudv84-lgtm/lehrly/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-backend-3ECF8E?logo=supabase&logoColor=white)

Lehrly is a mobile-first web app that lets teachers organize worksheets into collections, browse templates, and prepare for AI-powered worksheet generation. *"Lehrly"* is derived from the German word *Lehrer* (teacher).

---

## Features

- **Dashboard** — personalized greeting, recent worksheets, and quick access to collections
- **Library** — browse and manage all worksheets; mark favorites and flag solution sheets
- **Collections** — organize worksheets into color-coded, icon-labeled folders
- **Templates** — reusable starting points for common worksheet types
- **Profile** — configure school, abbreviation (*Kürzel*), default course type, and difficulty level (*Niveau*)
- **Authentication** — email/password sign-up and login via Supabase Auth
- **Onboarding** — guided first-run setup for new teachers
- **AI Generator** *(coming soon)* — generate worksheets by topic, level, and task type

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Animations | Framer Motion |
| Routing | React Router v6 |
| Data fetching | TanStack Query v5 |
| Backend / Auth / DB | Supabase (PostgreSQL) |
| Forms | React Hook Form + Zod |
| Testing | Vitest + Testing Library |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/davudv84-lgtm/lehrly.git
cd lehrly
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev        # start dev server at http://localhost:8080
npm run build      # production build
npm run preview    # preview production build locally
npm run test       # run test suite
npm run lint       # lint with ESLint
```

---

## Project Structure

```
src/
├── components/         # Shared UI components (cards, nav, badges, etc.)
│   ├── auth/           # Auth-specific components
│   └── ui/             # shadcn/ui primitives
├── context/            # React context (AuthContext)
├── hooks/              # Custom hooks
├── integrations/
│   └── supabase/       # Supabase client + generated types
├── lib/                # Utilities
└── pages/              # Route-level pages
    └── auth/           # Login + Register
```

---

## Database Schema

| Table | Description |
|---|---|
| `profiles` | Teacher profile: name, school, Kürzel, default Niveau & Kurstyp |
| `worksheets` | Individual worksheets with favorite and solution flags |
| `collections` | Named, color-coded, icon-labeled folders |
| `collection_worksheets` | Join table linking worksheets to collections |

---

## Roadmap

- [x] Worksheet library with collections
- [x] Favorites and solution flags
- [x] User authentication and onboarding
- [x] Profile settings (school, Kürzel, Niveau, Kurstyp)
- [ ] AI worksheet generator (topic, level, task type)
- [ ] PDF export
- [ ] Sharing and collaboration

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## License

[MIT](LICENSE)
