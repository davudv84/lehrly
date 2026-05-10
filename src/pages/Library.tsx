import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardCheck, FileEdit, Grid2x2, List, Search, Sparkles } from "lucide-react";
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

const FILTERS = ["Alle", "A1", "A2", "B1", "B2", "C1"] as const;
type Filter = (typeof FILTERS)[number];

const Library = () => {
  useSeedDemoOnce();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<WorksheetCardData[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("Alle");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("worksheets")
        .select("id,title,niveau,task_types,created_at")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setItems((data as WorksheetCardData[] | null) ?? []);
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
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 22px)" }}
      >
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-text-tertiary">
            {items.length} Arbeitsblätter
          </p>
          <h1 className="mt-2 font-display text-[26px] font-semibold leading-tight tracking-[-0.022em] text-text-primary">
            Bibliothek
          </h1>
        </div>
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
      </header>

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

export default Library;
