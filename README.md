# Lehrly

A modern worksheet management app built for teachers. Organize your materials into collections, browse templates, and get ready for AI-powered worksheet generation — all in a clean, mobile-first interface.

> "Lehrly" is derived from the German word *Lehrer* (teacher).

---

## Features

- **Dashboard** — greeting, recent worksheets, and quick access to collections
- **Library** — browse and manage all your worksheets with favorite and solution flags
- **Collections** — organize worksheets into color-coded, icon-labeled folders
- **Templates** — reusable starting points for common worksheet types
- **Profile** — set your school, abbreviation (*Kürzel*), default course type, and difficulty level (*Niveau*)
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
| Backend / Auth / DB | Supabase |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Testing | Vitest + Testing Library |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/your-username/lehrly.git
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
npm run dev
```

The app runs at `http://localhost:8080` by default.

### Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
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
├── lib/                # Utility functions
└── pages/              # Route-level page components
    └── auth/           # Login + Register pages
```

---

## Database Schema (Supabase)

| Table | Description |
|---|---|
| `profiles` | Teacher profile: name, school, Kürzel, default Niveau & Kurstyp |
| `worksheets` | Individual worksheets with favorite flag and solution indicator |
| `collections` | Named, colored, icon-labeled folders |
| `collection_worksheets` | Join table linking worksheets to collections |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

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

## License

MIT
