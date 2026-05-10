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
import SectionHeader from "@/components/SectionHeader";
import {
  WorksheetCardSkeleton,
  StatCardSkeleton,
} from "@/components/skeletons/WorksheetCardSkeleton";
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

const Greeting = ({ name }: { name: string | null }) => {
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Guten Morgen" : hour < 18 ? "Hallo" : "Guten Abend";
  const display = name?.trim() ? name.split(" ").slice(-1)[0] : null;
  return (
    <h1 className="font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.025em] text-text-primary">
      {greeting}
      {display ? `, ${display}` : ""}
    </h1>
  );
};

const Avatar = ({ kuerzel }: { kuerzel: string | null }) => (
  <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-surface-2 text-[12.5px] font-medium text-text-secondary ring-hairline">
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
      {/* Editorial header */}
      <header
        className="flex items-start justify-between pb-7"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 22px)" }}
      >
        <div className="min-w-0">
          <p className="section-label">{todayLabel()}</p>
          <div className="mt-2">
            <Greeting name={profile?.name ?? null} />
          </div>
          <p className="mt-1.5 text-[14px] leading-relaxed text-text-secondary">
            Bereit, deinen Unterricht vorzubereiten?
          </p>
        </div>
        <Link to="/profile" className="mt-2">
          <Avatar kuerzel={profile?.kuerzel ?? null} />
        </Link>
      </header>

      {/* Calm CTA — soft brand surface */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <TapButton
          onClick={() => navigate("/generate")}
          className={cn(
            "relative block w-full overflow-hidden rounded-card p-5 text-left",
            "bg-gradient-to-br from-[hsl(var(--brand-soft))] to-[hsl(var(--surface-2))]",
            "ring-1 ring-brand/20 hover:ring-brand/30 transition-all",
          )}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-primary-foreground shadow-xs">
              <Sparkles size={18} />
            </div>
            <div className="flex-1">
              <p className="font-display text-[17px] font-semibold tracking-[-0.015em] text-text-primary">
                Neues Arbeitsblatt
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                Niveau, Thema, Aufgabentypen wählen — fertig in unter 30 Sekunden.
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
      <section className="mt-7">
        <SectionHeader label="Schnellaktionen" className="mb-3" />
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
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
            onClick={() => navigate("/library?tab=templates")}
          />
        </div>
      </section>

      {/* Recents */}
      <section className="mt-8">
        <SectionHeader
          label="Zuletzt erstellt"
          action={{ label: "Alle anzeigen", to: "/library" }}
        />
        {loading ? (
          <div className="-mx-5 mt-3.5 flex gap-3 overflow-x-auto px-5 pb-2">
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
                className="flex h-10 items-center gap-1.5 rounded-pill bg-brand px-4 text-[13px] font-medium text-primary-foreground hover:bg-brand-hover transition-colors"
              >
                <Plus size={14} /> Arbeitsblatt erstellen
              </TapButton>
            }
          />
        ) : (
          <motion.div
            variants={stagger(0.04)}
            initial="hidden"
            animate="show"
            className="-mx-5 mt-3.5 flex gap-3 overflow-x-auto px-5 pb-2"
            style={{
              scrollSnapType: "x mandatory",
              scrollPaddingLeft: 20,
              paddingRight: 32,
            }}
          >
            {recents.map((w) => (
              <motion.div
                key={w.id}
                variants={fadeUp}
                style={{ scrollSnapAlign: "start" }}
              >
                <WorksheetCard ws={w} variant="row" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Collections */}
      <section className="mt-8 pb-8">
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
                <TapButton className="float-card flex w-full items-center gap-3 rounded-card bg-surface-1 ring-hairline p-3.5 text-left">
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
            <div className="col-span-2 flex items-center justify-center rounded-card border border-dashed border-hairline/10 px-6 py-10 text-[13px] text-text-tertiary">
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
    className="flex h-9 shrink-0 items-center gap-2 rounded-pill bg-surface-2 ring-hairline px-3.5 text-[12.5px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors"
  >
    <span className="text-text-tertiary">{icon}</span>
    {label}
  </TapButton>
);

export default Index;
