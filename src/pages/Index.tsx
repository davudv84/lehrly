import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Folder, Library as LibraryIcon, Plus, Sparkles, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSeedDemoOnce } from "@/hooks/useSeedDemoOnce";
import { supabase } from "@/integrations/supabase/client";
import TapButton from "@/components/TapButton";
import WorksheetCard, { type WorksheetCardData } from "@/components/WorksheetCard";
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

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ data: ws }, { data: cols }] = await Promise.all([
        supabase
          .from("worksheets")
          .select("id,title,niveau,task_types,created_at")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("collections")
          .select("id,title,icon,color,collection_worksheets(count)")
          .order("created_at", { ascending: true }),
      ]);
      if (cancelled) return;
      setRecents((ws as WorksheetCardData[] | null) ?? []);
      setCollections(
        (cols ?? []).map((c: any) => ({
          id: c.id,
          title: c.title,
          icon: c.icon,
          color: c.color,
          count: c.collection_worksheets?.[0]?.count ?? 0,
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="px-5">
      {/* Header row */}
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

      {/* Hero CTA card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <TapButton
          onClick={() => navigate("/generate")}
          className="relative block w-full overflow-hidden rounded-large p-5 text-left shadow-brand-glow"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--brand)) 0%, hsl(var(--brand-hover)) 100%)",
          }}
        >
          <div
            aria-hidden
            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl"
          />
          <div className="relative flex items-start gap-3">
            <Sparkles size={22} className="mt-0.5 text-white" />
            <div className="flex-1">
              <p className="text-[20px] font-bold tracking-[-0.01em] text-white">
                Neues Arbeitsblatt
              </p>
              <p className="mt-1 text-[13px] text-white/80">
                In unter 30 Sekunden druckfertig.
              </p>
            </div>
          </div>
        </TapButton>
      </motion.div>

      {/* Recents */}
      <section className="mt-7">
        <div className="flex items-center justify-between px-1">
          <p className="section-label">Zuletzt erstellt</p>
          <Link to="/library" className="text-[13px] font-medium text-brand hover:text-brand-hover">
            Alle anzeigen →
          </Link>
        </div>
        <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-2">
          {recents.length === 0 ? (
            <div className="flex h-32 flex-1 items-center justify-center rounded-card border border-dashed border-white/10 text-[13px] text-text-tertiary">
              Noch nichts erstellt — drück auf das ✨
            </div>
          ) : (
            recents.map((w) => <WorksheetCard key={w.id} ws={w} variant="row" />)
          )}
        </div>
      </section>

      {/* Collections */}
      <section className="mt-7 pb-6">
        <div className="flex items-center justify-between px-1">
          <p className="section-label">Sammlungen</p>
          <button
            onClick={() => {
              /* phase 4 */
            }}
            className="text-[13px] font-medium text-brand hover:text-brand-hover"
          >
            + Neu
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {collections.map((c) => {
            const Icon = ICON_MAP[c.icon] ?? Folder;
            return (
              <TapButton
                key={c.id}
                className="flex items-center gap-3 rounded-card border border-white/[0.06] bg-surface p-3.5 text-left"
              >
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-md", COLOR_MAP[c.color] ?? COLOR_MAP.brand)}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-text-primary">
                    {c.title}
                  </p>
                  <p className="text-[11px] text-text-tertiary">{c.count} Blätter</p>
                </div>
              </TapButton>
            );
          })}
          {collections.length === 0 && (
            <div className="col-span-2 flex items-center justify-center rounded-card border border-dashed border-white/10 p-6 text-[13px] text-text-tertiary">
              Sammlungen erscheinen hier.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
