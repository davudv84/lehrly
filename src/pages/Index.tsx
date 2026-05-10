import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  ClipboardCheck,
  Copy,
  FileCheck2,
  FileText,
  Folder,
  Library as LibraryIcon,
  Plus,
  Star,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSeedDemoOnce } from "@/hooks/useSeedDemoOnce";
import { supabase } from "@/integrations/supabase/client";
import TapButton from "@/components/TapButton";
import WorksheetCard, { type WorksheetCardData } from "@/components/WorksheetCard";
import SectionHeader from "@/components/SectionHeader";
import { WorksheetCardSkeleton } from "@/components/skeletons/WorksheetCardSkeleton";
import EmptyState from "@/components/EmptyState";
import { stagger, fadeUp } from "@/lib/motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Collection = {
  id: string;
  title: string;
  icon: string;
  color: string;
  count: number;
};

const ICON_MAP: Record<string, typeof Folder> = {
  library: LibraryIcon,
  star: Star,
  calendar: Calendar,
  folder: Folder,
};

const COLOR_MAP: Record<string, string> = {
  brand: "bg-brand-soft text-brand-hover",
  amber: "bg-amber-400/10 text-amber-300",
  muted: "bg-surface-3 text-text-secondary",
};

const todayLabel = () => {
  const d = new Date();
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const greetingFor = (name: string | null) => {
  const hour = new Date().getHours();
  const g = hour < 12 ? "Guten Morgen" : hour <= 18 ? "Hallo" : "Guten Abend";
  const display = name?.trim() ? name.split(" ").slice(-1)[0] : null;
  return display ? `${g}, ${display}` : g;
};

const Avatar = ({ kuerzel }: { kuerzel: string | null }) => (
  <div className="flex h-9 w-9 items-center justify-center rounded-pill bg-surface-2 text-[12px] font-medium text-text-secondary ring-hairline">
    {kuerzel?.slice(0, 2).toUpperCase() || "L"}
  </div>
);

const scrollRowStyle: React.CSSProperties = {
  scrollSnapType: "x mandatory",
  paddingLeft: 20,
  paddingRight: 28,
  scrollbarWidth: "none",
};

const Index = () => {
  useSeedDemoOnce();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [recents, setRecents] = useState<WorksheetCardData[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ today: 0, week: 0, favs: 0 });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: ws }, { data: cols }] = await Promise.all([
        supabase
          .from("worksheets")
          .select("id,title,niveau,task_types,created_at,is_favorite")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("collections")
          .select("id,title,icon,color,collection_worksheets(count)")
          .order("created_at", { ascending: true }),
      ]);
      if (cancelled) return;
      const list = (ws as (WorksheetCardData & { is_favorite: boolean })[] | null) ?? [];
      setRecents(list.slice(0, 8));
      const now = Date.now();
      const dayMs = 86400000;
      setStats({
        today: list.filter((w) => now - new Date(w.created_at).getTime() < dayMs).length,
        week: list.filter((w) => now - new Date(w.created_at).getTime() < dayMs * 7).length,
        favs: list.filter((w) => w.is_favorite).length,
      });
      setCollections(
        (cols ?? []).map((c: any) => ({
          id: c.id,
          title: c.title,
          icon: c.icon,
          color: c.color,
          count: c.collection_worksheets?.[0]?.count ?? 0,
        })),
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const duplicateLast = async () => {
    const last = recents[0];
    if (!last || !user) return toast.info("Noch nichts zu duplizieren.");
    const { data } = await supabase.from("worksheets").select("*").eq("id", last.id).maybeSingle();
    if (!data) return toast.error("Fehler beim Kopieren");
    const { data: created } = await supabase
      .from("worksheets")
      .insert({
        user_id: user.id,
        title: `${data.title} (Kopie)`,
        niveau: data.niveau,
        topic: data.topic,
        task_types: data.task_types,
        task_count: data.task_count,
        has_solution: data.has_solution,
        content: data.content ?? {},
      })
      .select("id")
      .single();
    if (created) {
      toast.success("Kopie erstellt");
      navigate(`/worksheets/${created.id}`);
    }
  };

  const statItems = [
    { label: "Heute", value: stats.today },
    { label: "Diese Woche", value: stats.week },
    { label: "Favoriten", value: stats.favs },
  ];

  return (
    <div>
      {/* Top bar: date + avatar */}
      <header
        className="flex items-center justify-between px-5 pb-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 22px)" }}
      >
        <div className="min-w-0">
          <p className="section-label">{todayLabel()}</p>
          <p className="mt-1 text-[13px] text-text-secondary">
            {greetingFor(profile?.name ?? null)}
          </p>
        </div>
        <Link to="/profile" aria-label="Profil">
          <Avatar kuerzel={profile?.kuerzel ?? null} />
        </Link>
      </header>

      {/* Hero card — product promise + two compact actions inside */}
      <section className="px-5 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
          className="surface-card overflow-hidden bg-surface-1 ring-hairline"
        >
          <div className="px-5 pb-4 pt-5">
            <h1 className="font-display text-[22px] font-semibold leading-[1.2] tracking-[-0.02em] text-text-primary">
              Deine nächste Stunde.
              <br />
              <span className="text-text-secondary">In Minuten vorbereitet.</span>
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-text-tertiary">
              Erstelle Arbeitsblätter, Klassenbucheinträge und Korrekturen für DaF/DaZ-Kurse.
            </p>
          </div>

          <div className="border-t border-hairline/8 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-hairline/8">
            <PrimaryAction
              onClick={() => navigate("/generate")}
              icon={<FileText size={16} />}
              title="Arbeitsblatt erstellen"
              subtitle="Niveau, Thema, Aufgaben wählen"
              accent
            />
            <PrimaryAction
              onClick={() => navigate("/scan")}
              icon={<ClipboardCheck size={16} />}
              title="Korrektur starten"
              subtitle="Foto scannen, Bewertung erhalten"
            />
          </div>
        </motion.div>
      </section>

      {/* Quick actions — wrap to second line so nothing clips */}
      <section className="mt-7 px-5">
        <SectionHeader label="Schnellaktionen" className="mb-3" />
        <div className="flex flex-wrap gap-2">
          <QuickAction icon={<Copy size={13} />} label="Letztes duplizieren" onClick={duplicateLast} />
          <QuickAction
            icon={<FileCheck2 size={13} />}
            label="Vorlage verwenden"
            onClick={() => navigate("/library?tab=templates")}
          />
          <QuickAction
            icon={<Calendar size={13} />}
            label="Morgen vorbereiten"
            onClick={() => navigate("/generate")}
          />
        </div>
      </section>

      {/* Compact stats */}
      <section className="mt-6 px-5">
        <div className="border-y border-hairline/10 py-3">
          <div className="flex items-stretch justify-between">
            {statItems.map((s, i) => (
              <div
                key={s.label}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center px-2",
                  i > 0 && "border-l border-hairline/10",
                )}
              >
                <span
                  className="text-[11px] font-medium uppercase text-text-tertiary"
                  style={{ letterSpacing: "0.06em" }}
                >
                  {s.label}
                </span>
                <span className="mt-1 font-display text-[22px] font-semibold leading-none tracking-[-0.02em] text-text-primary tabular-nums">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recents */}
      <section className="mt-7">
        <div className="px-5">
          <SectionHeader
            label="Zuletzt erstellt"
            action={{ label: "Alle anzeigen", to: "/library" }}
          />
        </div>
        {loading ? (
          <div
            className="mt-3.5 flex gap-3 overflow-x-auto pb-2 no-scrollbar"
            style={scrollRowStyle}
          >
            {[0, 1, 2].map((i) => (
              <WorksheetCardSkeleton key={i} row />
            ))}
          </div>
        ) : recents.length === 0 ? (
          <div className="px-5">
            <EmptyState
              title="Noch nichts erstellt"
              description="Erstelle dein erstes Arbeitsblatt — in unter 30 Sekunden."
              action={
                <TapButton
                  onClick={() => navigate("/generate")}
                  className="flex h-10 items-center gap-1.5 rounded-pill bg-brand px-4 text-[13px] font-medium text-primary-foreground hover:bg-brand-hover transition-colors"
                >
                  <Plus size={14} /> Arbeitsblatt erstellen
                </TapButton>
              }
            />
          </div>
        ) : (
          <motion.div
            variants={stagger(0.04)}
            initial="hidden"
            animate="show"
            className="mt-3.5 flex gap-3 overflow-x-auto pb-2 no-scrollbar"
            style={scrollRowStyle}
          >
            {recents.map((w) => (
              <motion.div
                key={w.id}
                variants={fadeUp}
                style={{ scrollSnapAlign: "start", flexShrink: 0 }}
                className="w-[160px] sm:w-[180px]"
              >
                <WorksheetCard ws={w} variant="row" className="!w-full" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Sammlungen */}
      <section className="mt-7 px-5 pb-8">
        <SectionHeader
          label="Sammlungen"
          action={{ label: "Neu", onClick: () => toast.info("Bald verfügbar") }}
        />
        <motion.div
          variants={stagger(0.04)}
          initial="hidden"
          animate="show"
          className="mt-3.5 grid grid-cols-2 gap-3"
        >
          {collections.map((c) => {
            const Icon = ICON_MAP[c.icon] ?? Folder;
            return (
              <motion.div key={c.id} variants={fadeUp}>
                <TapButton className="float-card flex w-full items-center gap-3 rounded-card bg-surface-1 ring-hairline p-3 text-left">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      COLOR_MAP[c.color] ?? COLOR_MAP.brand,
                    )}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-text-primary">
                      {c.title}
                    </p>
                    <p className="text-[11.5px] text-text-tertiary">{c.count} Blätter</p>
                  </div>
                </TapButton>
              </motion.div>
            );
          })}
          {collections.length === 0 && !loading && (
            <div className="col-span-2 flex items-center justify-center rounded-card border border-dashed border-hairline/10 px-6 py-8 text-[12.5px] text-text-tertiary">
              Sammlungen erscheinen hier.
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
};

const PrimaryAction = ({
  icon,
  title,
  subtitle,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  accent?: boolean;
}) => (
  <TapButton
    onClick={onClick}
    className="group flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-2"
  >
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
        accent
          ? "bg-brand text-primary-foreground"
          : "bg-surface-3 text-text-primary ring-1 ring-hairline/15",
      )}
    >
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[14px] font-semibold tracking-[-0.005em] text-text-primary">
        {title}
      </p>
      <p className="mt-0.5 truncate text-[12px] text-text-tertiary">{subtitle}</p>
    </div>
    <ArrowRight
      size={15}
      className="shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5"
    />
  </TapButton>
);

const QuickAction = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <TapButton
    onClick={onClick}
    className="flex h-9 items-center gap-1.5 rounded-pill bg-surface-2 ring-hairline px-3.5 text-[12.5px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors"
  >
    <span className="text-text-tertiary">{icon}</span>
    {label}
  </TapButton>
);

export default Index;
