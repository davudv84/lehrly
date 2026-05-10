import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bookmark, ClipboardCheck, FileEdit, Grid2x2, List, MoreHorizontal, Search, Sparkles, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSeedDemoOnce } from "@/hooks/useSeedDemoOnce";
import { supabase } from "@/integrations/supabase/client";
import Chip from "@/components/Chip";
import WorksheetCard, { type WorksheetCardData } from "@/components/WorksheetCard";
import NiveauBadge from "@/components/NiveauBadge";
import TapButton from "@/components/TapButton";
import EmptyState from "@/components/EmptyState";
import { WorksheetCardSkeleton } from "@/components/skeletons/WorksheetCardSkeleton";
import { stagger, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Correction = {
  id: string;
  student_name: string | null;
  score: number;
  max_score: number;
  grade: number | null;
  created_at: string;
  exercise_breakdown: { title?: string } | null;
};

type Template = {
  id: string;
  title: string;
  niveau: string;
  topic: string | null;
  task_types: string[];
  task_count: number;
  is_new: boolean;
  usage_count: number;
  last_used_at: string | null;
};

const FILTERS = ["Alle", "A1", "A2", "B1", "B2", "C1"] as const;
type Filter = (typeof FILTERS)[number];
type Tab = "worksheets" | "corrections" | "templates";

const Library = () => {
  useSeedDemoOnce();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialTab = (params.get("tab") as Tab) || "worksheets";
  const [items, setItems] = useState<WorksheetCardData[]>([]);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tab, setTabState] = useState<Tab>(initialTab);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("Alle");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  const setTab = (t: Tab) => {
    setTabState(t);
    if (t === "worksheets") params.delete("tab");
    else params.set("tab", t);
    setParams(params, { replace: true });
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data }, { data: corr }, { data: tpl }] = await Promise.all([
        supabase
          .from("worksheets")
          .select("id,title,niveau,task_types,created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("corrections")
          .select("id,student_name,score,max_score,grade,created_at,exercise_breakdown")
          .order("created_at", { ascending: false }),
        supabase
          .from("templates")
          .select("*")
          .order("usage_count", { ascending: false }),
      ]);
      if (cancelled) return;
      setItems((data as WorksheetCardData[] | null) ?? []);
      setCorrections((corr as unknown as Correction[] | null) ?? []);
      setTemplates((tpl as Template[] | null) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filtered = useMemo(() => {
    let list = items;
    if (filter !== "Alle") {
      list = list.filter((w) => w.niveau === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.task_types.join(" ").toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, filter, search]);

  const isEmpty = !loading && items.length === 0;

  return (
    <div className="px-5">
      <header
        className="flex items-end justify-between pb-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 24px)" }}
      >
        <div>
          <p className="section-label">{items.length} Arbeitsblätter</p>
          <h1 className="mt-2 font-display text-[26px] font-semibold leading-tight tracking-[-0.022em] text-text-primary">
            Bibliothek
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/generate")}
            className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            + Neu
          </button>
          <div className="flex items-center gap-1 rounded-pill bg-surface-2 ring-hairline p-1">
            <ToggleIconButton
              active={view === "grid"}
              onClick={() => setView("grid")}
              label="Raster-Ansicht"
            >
              <Grid2x2 size={14} />
            </ToggleIconButton>
            <ToggleIconButton
              active={view === "list"}
              onClick={() => setView("list")}
              label="Listen-Ansicht"
            >
              <List size={14} />
            </ToggleIconButton>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-pill bg-surface-2 ring-hairline p-1">
        <TabButton active={tab === "worksheets"} onClick={() => setTab("worksheets")}>
          Arbeitsblätter
        </TabButton>
        <TabButton active={tab === "corrections"} onClick={() => setTab("corrections")}>
          <ClipboardCheck size={13} /> Korrekturen
          {corrections.length > 0 && (
            <span className="ml-1 rounded-pill bg-surface-3 px-1.5 text-[10px] text-text-secondary">{corrections.length}</span>
          )}
        </TabButton>
        <TabButton active={tab === "templates"} onClick={() => setTab("templates")}>
          <Bookmark size={13} /> Vorlagen
        </TabButton>
      </div>

      {tab === "corrections" ? (
        <CorrectionsTab corrections={corrections} loading={loading} navigate={navigate} />
      ) : tab === "templates" ? (
        <TemplatesTab templates={templates} navigate={navigate} />
      ) : (
        <>
      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suche nach Titel, Typ, Niveau…"
          className="h-11 w-full rounded-input bg-surface-2 pl-10 pr-4 text-[14px] text-text-primary placeholder:text-text-tertiary outline-none ring-hairline transition-shadow focus:bg-surface-3 focus:ring-2 focus:ring-brand/30"
        />
      </div>

      {/* Filters */}
      <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pt-1 pb-2">
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)} size="sm">
            {f}
          </Chip>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between px-1 pb-3">
        <span className="text-[12px] text-text-tertiary">
          {loading
            ? "Lädt…"
            : `${filtered.length} ${filtered.length === 1 ? "Blatt" : "Blätter"}`}
        </span>
        <button className="text-[12px] text-text-tertiary hover:text-text-primary transition-colors">
          Neueste zuerst
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-3 pb-8">
          {[0, 1, 2, 3].map((i) => (
            <WorksheetCardSkeleton key={i} />
          ))}
        </div>
      )}

      {isEmpty && (
        <EmptyState
          icon={<FileEdit size={22} className="text-brand-hover" />}
          title="Hier landet alles, was du erstellst."
          description="Lass uns dein erstes Arbeitsblatt bauen — es dauert keine 30 Sekunden."
          action={
            <TapButton
              onClick={() => navigate("/generate")}
              className="flex h-11 items-center gap-1.5 rounded-pill bg-brand px-5 text-[13.5px] font-medium text-primary-foreground hover:bg-brand-hover transition-colors"
            >
              <Sparkles size={14} /> Erstellen
            </TapButton>
          }
        />
      )}

      {!isEmpty && !loading && (
        <motion.div
          variants={stagger(0.03)}
          initial="hidden"
          animate="show"
          className={cn(
            "pb-8",
            view === "grid" ? "grid grid-cols-2 gap-3" : "flex flex-col gap-2",
          )}
        >
          {filtered.map((w) => (
            <motion.div key={w.id} variants={fadeUp}>
              {view === "grid" ? <WorksheetCard ws={w} /> : <ListRow ws={w} />}
            </motion.div>
          ))}
        </motion.div>
      )}
        </>
      )}
    </div>
  );
};

const CorrectionsTab = ({
  corrections,
  loading,
  navigate,
}: {
  corrections: Correction[];
  loading: boolean;
  navigate: (path: string) => void;
}) => {
  if (loading) return <div className="py-10 text-center text-text-tertiary text-[13px]">Lädt…</div>;
  if (corrections.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardCheck size={22} className="text-brand-hover" />}
        title="Noch keine Korrekturen"
        description="Scanne ein ausgefülltes Arbeitsblatt — die KI korrigiert es in Sekunden."
        action={
          <TapButton
            onClick={() => navigate("/scan")}
            className="flex h-11 items-center gap-1.5 rounded-pill bg-brand px-5 text-[13.5px] font-medium text-primary-foreground hover:bg-brand-hover transition-colors"
          >
            Arbeitsblatt scannen
          </TapButton>
        }
      />
    );
  }
  return (
    <div className="flex flex-col gap-2 pb-8">
      {corrections.map((c) => {
        const pct = c.max_score > 0 ? Math.round((Number(c.score) / Number(c.max_score)) * 100) : 0;
        return (
          <Link
            key={c.id}
            to={`/corrections/${c.id}`}
            className="float-card flex items-center gap-3.5 rounded-card bg-surface-1 ring-hairline p-3.5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-surface-2 text-text-primary text-[13px] font-semibold ring-hairline">
              {c.grade ?? "—"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium text-text-primary">
                {c.student_name?.trim() || "Unbenannt"}
              </p>
              <p className="mt-0.5 text-[11.5px] text-text-tertiary">
                {c.exercise_breakdown?.title ?? "Korrektur"} · {c.score}/{c.max_score} ({pct}%)
              </p>
            </div>
            <span className="text-[11px] text-text-tertiary">
              {new Date(c.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

const ToggleIconButton = ({
  active,
  onClick,
  children,
  label,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) => (
  <TapButton
    onClick={onClick}
    aria-label={label}
    className={cn(
      "flex h-7 w-7 items-center justify-center rounded-pill transition-colors",
      active
        ? "bg-surface-3 text-text-primary shadow-xs"
        : "text-text-tertiary hover:text-text-secondary",
    )}
  >
    {children}
  </TapButton>
);

const ListRow = ({ ws }: { ws: WorksheetCardData }) => (
  <a
    href={`/worksheets/${ws.id}`}
    className="float-card flex items-center gap-3.5 rounded-card bg-surface-1 ring-hairline p-3.5"
  >
    <NiveauBadge niveau={ws.niveau} />
    <div className="min-w-0 flex-1">
      <p className="truncate text-[13.5px] font-medium text-text-primary">
        {ws.title}
      </p>
      <p className="mt-0.5 text-[11.5px] text-text-tertiary">
        {ws.task_types.join(" · ")}
      </p>
    </div>
  </a>
);

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-pill text-[12.5px] font-medium transition-colors",
      active ? "bg-surface-3 text-text-primary shadow-xs" : "text-text-tertiary hover:text-text-secondary",
    )}
  >
    {children}
  </button>
);

const TemplatesTab = ({
  templates,
  navigate,
}: {
  templates: Template[];
  navigate: (path: string, opts?: unknown) => void;
}) => {
  if (templates.length === 0) {
    return (
      <div className="mt-6 rounded-card border border-dashed border-hairline/10 px-5 py-12 text-center">
        <p className="text-[13.5px] text-text-secondary">
          Noch keine Vorlagen — speichere deine nächste Generation als Vorlage.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 pb-8">
      {templates.map((t) => {
        const lastUsed = t.last_used_at
          ? (() => {
              const d = Math.floor((Date.now() - new Date(t.last_used_at!).getTime()) / 86400000);
              return d < 1 ? "heute" : d === 1 ? "gestern" : `vor ${d} Tagen`;
            })()
          : null;
        return (
          <motion.article
            key={t.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
            className="float-card rounded-card bg-surface-1 ring-hairline p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-[15px] font-medium leading-tight tracking-[-0.01em] text-text-primary">
                  {t.title}
                </p>
                {t.is_new && (
                  <span className="mt-1.5 inline-flex h-5 items-center rounded-pill bg-surface-2 ring-hairline px-2 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                    Neu
                  </span>
                )}
              </div>
              <button className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-2 hover:text-text-secondary transition-colors">
                <MoreHorizontal size={15} />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <NiveauBadge niveau={t.niveau} />
              {t.topic && <TplTag>{t.topic}</TplTag>}
              {t.task_types.slice(0, 2).map((tt) => (
                <TplTag key={tt}>{tt}</TplTag>
              ))}
              <TplTag>{t.task_count} Aufg.</TplTag>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-hairline/5 pt-3.5">
              <div className="flex items-center gap-1.5 text-[11.5px] text-text-tertiary">
                <Star size={11} />
                <span>{t.usage_count}× verwendet</span>
                {lastUsed && (<><span className="opacity-40">·</span><span>{lastUsed}</span></>)}
              </div>
              <TapButton
                onClick={() =>
                  navigate("/generate", {
                    state: {
                      prefill: {
                        niveau: t.niveau,
                        topics: t.topic ? [t.topic] : [],
                        taskTypes: t.task_types,
                        count: t.task_count,
                        templateId: t.id,
                      },
                    },
                  })
                }
                className="flex items-center gap-1 text-[12.5px] font-medium text-text-primary hover:text-white transition-colors"
              >
                Verwenden <ArrowRight size={13} />
              </TapButton>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
};

const TplTag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex h-5 items-center rounded-pill bg-surface-2 px-2 text-[10.5px] font-medium text-text-secondary ring-hairline">
    {children}
  </span>
);

export default Library;
