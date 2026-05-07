import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Copy,
  FileCheck2,
  Folder,
  Library as LibraryIcon,
  Plus,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSeedDemoOnce } from "@/hooks/useSeedDemoOnce";
import { supabase } from "@/integrations/supabase/client";
import TapButton from "@/components/TapButton";
import WorksheetCard, { type WorksheetCardData } from "@/components/WorksheetCard";
import StatCard from "@/components/StatCard";
import { WorksheetCardSkeleton, StatCardSkeleton } from "@/components/skeletons/WorksheetCardSkeleton";
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
  brand: "bg-brand-muted text-brand",
  amber: "bg-amber-500/10 text-amber-400",
  muted: "bg-white/[0.06] text-text-secondary",
};

const Greeting = ({ name }: { name: string | null }) => {
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Guten Morgen" : hour < 18 ? "Hallo" : "Guten Abend";
  const display = name?.trim() ? name.split(" ").slice(-1)[0] : null;
  return (
    <p className="text-[22px] font-bold tracking-[-0.02em] text-text-primary">
      {greeting}
      {display ? `, ${display}` : ""} <span className="inline-block">👋</span>
    </p>
  );
};

const Avatar = ({ kuerzel }: { kuerzel: string | null }) => (
  <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-brand/15 text-[13px] font-semibold text-brand ring-1 ring-brand/30">
    {kuerzel?.slice(0, 2).toUpperCase() || "L"}
  </div>
);

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
    const { data, error } = await supabase
      .from("worksheets")
      .select("*")
      .eq("id", last.id)
      .maybeSingle();
    if (error || !data) return toast.error("Fehler beim Kopieren");
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

  return (
    <div className="px-5">
      <header
        className="flex items-start justify-between pb-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
      >
        <div className="min-w-0">
          <Greeting name={profile?.name ?? null} />
          <p className="mt-1 text-[14px] text-text-secondary">Bereit für heute?</p>
        </div>
        <Link to="/profile">
          <Avatar kuerzel={profile?.kuerzel ?? null} />
        </Link>
      </header>

      {/* Hero CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <TapButton
          onClick={() => navigate("/generate")}
          className="relative block w-full overflow-hidden rounded-large p-5 text-left shadow-brand-glow animate-pulse-glow"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--brand)) 0%, hsl(var(--brand-hover)) 100%)",
          }}
        >
          <div
            aria-hidden
            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl"
          />
          <div
            aria-hidden
            className="absolute -left-6 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative flex items-start gap-3">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={22} className="mt-0.5 text-white" />
            </motion.div>
            <div className="flex-1">
              <p className="text-[20px] font-bold tracking-[-0.01em] text-white">
                Neues Arbeitsblatt
              </p>
              <p className="mt-1 text-[13px] text-white/85">
                In unter 30 Sekunden druckfertig.
              </p>
            </div>
          </div>
        </TapButton>
      </motion.div>

      {/* Stats */}
      <section className="mt-5 flex gap-2.5">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Heute" value={stats.today} icon={Clock} accent="brand" delay={0} />
            <StatCard label="Diese Woche" value={stats.week} icon={TrendingUp} accent="sky" delay={0.05} />
            <StatCard label="Favoriten" value={stats.favs} icon={Star} accent="amber" delay={0.1} />
          </>
        )}
      </section>

      {/* Quick actions */}
      <section className="mt-5">
        <p className="section-label mb-2.5 px-1">Schnellaktionen</p>
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1">
          <QuickAction icon={<Copy size={14} />} label="Letztes duplizieren" onClick={duplicateLast} />
          <QuickAction
            icon={<Calendar size={14} />}
            label="Morgen vorbereiten"
            onClick={() => navigate("/generate")}
          />
          <QuickAction
            icon={<Star size={14} />}
            label="Favoriten"
            onClick={() => navigate("/library")}
          />
          <QuickAction
            icon={<FileCheck2 size={14} />}
            label="Vorlagen"
            onClick={() => navigate("/templates")}
          />
        </div>
      </section>

      {/* Recents */}
      <section className="mt-7">
        <div className="flex items-center justify-between px-1">
          <p className="section-label">Zuletzt erstellt</p>
          <Link to="/library" className="text-[13px] font-medium text-brand hover:text-brand-hover">
            Alle anzeigen →
          </Link>
        </div>
        {loading ? (
          <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-2">
            {[0, 1, 2].map((i) => (
              <WorksheetCardSkeleton key={i} row />
            ))}
          </div>
        ) : recents.length === 0 ? (
          <EmptyState
            title="Noch nichts erstellt"
            description="Erstelle dein erstes Arbeitsblatt — in unter 30 Sekunden."
            action={
              <TapButton
                onClick={() => navigate("/generate")}
                className="flex h-10 items-center gap-1.5 rounded-pill bg-brand-gradient px-4 text-[13px] font-semibold text-white shadow-brand-glow"
              >
                <Plus size={14} /> Arbeitsblatt erstellen
              </TapButton>
            }
          />
        ) : (
          <motion.div
            variants={stagger(0.05)}
            initial="hidden"
            animate="show"
            className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-2"
          >
            {recents.map((w) => (
              <motion.div key={w.id} variants={fadeUp}>
                <WorksheetCard ws={w} variant="row" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Collections */}
      <section className="mt-7 pb-6">
        <div className="flex items-center justify-between px-1">
          <p className="section-label">Sammlungen</p>
          <button
            onClick={() => toast.info("Bald verfügbar")}
            className="text-[13px] font-medium text-brand hover:text-brand-hover"
          >
            + Neu
          </button>
        </div>
        <motion.div
          variants={stagger(0.04)}
          initial="hidden"
          animate="show"
          className="mt-3 grid grid-cols-2 gap-3"
        >
          {collections.map((c) => {
            const Icon = ICON_MAP[c.icon] ?? Folder;
            return (
              <motion.div key={c.id} variants={fadeUp}>
                <TapButton className="float-card flex w-full items-center gap-3 rounded-card border border-white/[0.06] bg-surface p-3.5 text-left">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-md",
                      COLOR_MAP[c.color] ?? COLOR_MAP.brand,
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-text-primary">
                      {c.title}
                    </p>
                    <p className="text-[11px] text-text-tertiary">{c.count} Blätter</p>
                  </div>
                </TapButton>
              </motion.div>
            );
          })}
          {collections.length === 0 && !loading && (
            <div className="col-span-2 flex items-center justify-center rounded-card border border-dashed border-white/10 p-6 text-[13px] text-text-tertiary">
              Sammlungen erscheinen hier.
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
};

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
    className="flex h-10 shrink-0 items-center gap-2 rounded-pill border border-white/[0.08] bg-surface px-3.5 text-[12.5px] font-medium text-text-secondary hover:border-white/15 hover:text-text-primary"
  >
    <span className="text-brand">{icon}</span>
    {label}
  </TapButton>
);

export default Index;
