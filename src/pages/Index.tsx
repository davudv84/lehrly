import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  ClipboardCheck,
  Copy,
  FileCheck2,
  Folder,
  Library as LibraryIcon,
  Plus,
  Sparkles,
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
  const greeting = hour < 12 ? "Guten Morgen" : hour <= 18 ? "Hallo" : "Guten Abend";
  const display = name?.trim() ? name.split(" ").slice(-1)[0] : null;
  return (
    <h1 className="font-display text-[32px] font-bold leading-[1.1] tracking-[-0.025em] text-text-primary">
      {greeting}
      {display ? `, ${display}` : ""}
    </h1>
  );
};

const Avatar = ({ kuerzel }: { kuerzel: string | null }) => (
  <div className="flex h-9 w-9 items-center justify-center rounded-pill bg-surface-2 text-[12px] font-medium text-text-secondary ring-hairline">
    {kuerzel?.slice(0, 2).toUpperCase() || "L"}
  </div>
);

const scrollRowStyle: React.CSSProperties = {
  scrollSnapType: "x mandatory",
  paddingLeft: 16,
  paddingRight: 24,
  scrollbarWidth: "none",
};

const Index = () => {
  useSeedDemoOnce();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [recents, setRecents] = useState<WorksheetCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ today: 0, week: 0, favs: 0 });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: ws } = await supabase
        .from("worksheets")
        .select("id,title,niveau,task_types,created_at,is_favorite")
        .order("created_at", { ascending: false })
        .limit(20);
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
  ].filter((s) => s.value > 0);

  return (
    <div>
      {/* Top bar: date + avatar */}
      <header
        className="flex items-center justify-between px-5 pb-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 22px)" }}
      >
        <p className="section-label">{todayLabel()}</p>
        <Link to="/profile" aria-label="Profil">
          <Avatar kuerzel={profile?.kuerzel ?? null} />
        </Link>
      </header>

      {/* Headline */}
      <div className="px-5 pb-6">
        <Greeting name={profile?.name ?? null} />
        <p className="mt-1.5 text-[16px] font-normal leading-relaxed text-white/60">
          Was bereitest du heute vor?
        </p>
      </div>

      {/* Two hero cards */}
      <section className="px-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <TapButton
              onClick={() => navigate("/generate")}
              className={cn(
                "relative flex h-full min-h-[148px] w-full flex-col justify-between rounded-[12px] p-6 text-left",
                "bg-gradient-to-br from-[hsl(var(--brand-soft))] to-[hsl(var(--surface-2))]",
                "ring-1 ring-brand/30 hover:ring-brand/50 transition-all",
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-primary-foreground shadow-xs">
                <Sparkles size={18} />
              </div>
              <div className="mt-4">
                <p className="font-display text-[17px] font-semibold tracking-[-0.015em] text-text-primary">
                  Neues Arbeitsblatt
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                  In 30 Sekunden druckfertig
                </p>
              </div>
            </TapButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <TapButton
              onClick={() => navigate("/scan")}
              className="relative flex h-full min-h-[148px] w-full flex-col justify-between rounded-[12px] p-6 text-left transition-all hover:bg-[#1F2024]"
              style={{
                backgroundColor: "#1A1B1E",
                border: "1px solid rgba(16,185,129,0.4)",
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-3 text-brand ring-1 ring-brand/30">
                <ClipboardCheck size={18} />
              </div>
              <div className="mt-4">
                <p className="font-display text-[17px] font-semibold tracking-[-0.015em] text-text-primary">
                  Korrektur starten
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                  Foto scannen, Note erhalten
                </p>
              </div>
            </TapButton>
          </motion.div>
        </div>
      </section>

      {/* Schnellaktionen */}
      <section className="mt-7">
        <div className="px-5">
          <SectionHeader label="Schnellaktionen" className="mb-3" />
        </div>
        <div
          className="flex gap-3 overflow-x-auto pb-1 no-scrollbar"
          style={scrollRowStyle}
        >
          <QuickAction icon={<Copy size={14} />} label="Letztes duplizieren" onClick={duplicateLast} />
          <QuickAction
            icon={<Calendar size={14} />}
            label="Morgen vorbereiten"
            onClick={() => navigate("/generate")}
          />
          <QuickAction
            icon={<FileCheck2 size={14} />}
            label="Aus Vorlage erstellen"
            onClick={() => navigate("/library?tab=templates")}
          />
        </div>
      </section>

      {/* Stats strip — minimal, only if any > 0 */}
      {statItems.length > 0 && (
        <section className="mt-7 px-5">
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
      )}

      {/* Recents */}
      <section className="mt-8 pb-8">
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
    style={{ scrollSnapAlign: "start", flexShrink: 0 }}
    className="flex h-10 items-center gap-2 rounded-pill bg-surface-2 ring-hairline px-4 text-[12.5px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors"
  >
    <span className="text-text-tertiary">{icon}</span>
    {label}
  </TapButton>
);

export default Index;
