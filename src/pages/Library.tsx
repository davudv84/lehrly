import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileEdit, Grid3x3, List, Search, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSeedDemoOnce } from "@/hooks/useSeedDemoOnce";
import { supabase } from "@/integrations/supabase/client";
import Chip from "@/components/Chip";
import WorksheetCard, { type WorksheetCardData } from "@/components/WorksheetCard";
import TapButton from "@/components/TapButton";
import EmptyState from "@/components/EmptyState";
import { WorksheetCardSkeleton } from "@/components/skeletons/WorksheetCardSkeleton";
import { stagger, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

const FILTERS = ["Alle", "A1", "A2", "B1", "B2", "C1", "Aufgaben"] as const;
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
    if (filter !== "Alle" && filter !== "Aufgaben") {
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
        className="flex items-center justify-between pb-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
      >
        <h1 className="text-h1 text-text-primary">Bibliothek</h1>
        <div className="flex h-10 items-center gap-1 rounded-pill border border-white/[0.06] bg-surface p-1">
          <ToggleIconButton
            active={view === "grid"}
            onClick={() => setView("grid")}
            label="Raster-Ansicht"
          >
            <Grid3x3 size={16} />
          </ToggleIconButton>
          <ToggleIconButton
            active={view === "list"}
            onClick={() => setView("list")}
            label="Listen-Ansicht"
          >
            <List size={16} />
          </ToggleIconButton>
        </div>
      </header>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suche nach Thema, Niveau, Datum…"
          className="h-11 w-full rounded-input border border-white/10 bg-surface pl-10 pr-4 text-[14px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-white/25"
        />
      </div>

      {/* Filters */}
      <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Chip>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between px-1 pb-3">
        <span className="text-[12px] text-text-tertiary">
          {loading ? "Lädt…" : `${filtered.length} ${filtered.length === 1 ? "Blatt" : "Blätter"}`}
        </span>
        <button className="text-[12px] font-medium text-text-secondary hover:text-text-primary">
          Sortieren: <span className="text-brand">Neueste ▾</span>
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-3 pb-6">
          {[0, 1, 2, 3].map((i) => (
            <WorksheetCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <EmptyState
          icon={<FileEdit size={26} className="text-brand" />}
          title="Hier landet alles, was du erstellst."
          description="Lass uns dein erstes Arbeitsblatt bauen — es dauert keine 30 Sekunden."
          action={
            <TapButton
              onClick={() => navigate("/generate")}
              className="flex h-11 items-center gap-1.5 rounded-pill bg-brand-gradient px-5 text-[14px] font-semibold text-white shadow-brand-glow"
            >
              <Sparkles size={14} /> Erstellen
            </TapButton>
          }
        />
      )}

      {/* Grid / list */}
      {!isEmpty && !loading && (
        <motion.div
          variants={stagger(0.04)}
          initial="hidden"
          animate="show"
          className={cn(
            "pb-6",
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
      "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
      active ? "bg-brand text-white" : "text-text-tertiary hover:text-text-secondary",
    )}
  >
    {children}
  </TapButton>
);

const ListRow = ({ ws }: { ws: WorksheetCardData }) => (
  <a
    href={`/worksheets/${ws.id}`}
    className="flex items-center gap-3 rounded-card border border-white/[0.06] bg-surface p-3"
  >
    <div className="h-10 w-10 shrink-0 rounded bg-gradient-to-br from-white/[0.06] to-white/[0.02]" />
    <div className="min-w-0 flex-1">
      <p className="truncate text-[14px] font-semibold text-text-primary">{ws.title}</p>
      <p className="mt-0.5 text-[11px] text-text-tertiary">
        {ws.task_types.join(" · ")}
      </p>
    </div>
  </a>
);

export default Library;
