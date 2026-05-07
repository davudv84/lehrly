import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MoreHorizontal, Plus, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSeedDemoOnce } from "@/hooks/useSeedDemoOnce";
import { supabase } from "@/integrations/supabase/client";
import NiveauBadge from "@/components/NiveauBadge";
import TapButton from "@/components/TapButton";
import { cn } from "@/lib/utils";

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

const formatLastUsed = (iso: string | null) => {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return "Zuletzt: heute";
  if (days === 1) return "Zuletzt: gestern";
  return `Zuletzt: vor ${days} Tagen`;
};

const Templates = () => {
  useSeedDemoOnce();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Template[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("templates")
        .select("*")
        .order("usage_count", { ascending: false });
      if (!cancelled) setItems((data as Template[] | null) ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="relative px-5">
      <header
        className="pb-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
      >
        <h1 className="text-h1 text-text-primary">Vorlagen</h1>
        <p className="mt-2 text-[14px] leading-snug text-text-secondary">
          Speichere deine Lieblings-Konfigurationen und starte jede Stunde in Sekunden.
        </p>
      </header>

      <div className="flex flex-col gap-3 pb-24">
        {items.map((t, i) => (
          <TemplateCard
            key={t.id}
            template={t}
            featured={i === 0}
            onUse={() =>
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
          />
        ))}
        {items.length === 0 && (
          <div className="mt-10 rounded-card border border-dashed border-white/10 px-5 py-10 text-center">
            <p className="text-[14px] text-text-secondary">
              Noch keine Vorlagen — speichere deine nächste Generation als Vorlage.
            </p>
          </div>
        )}
      </div>

      {/* Floating + */}
      <TapButton
        onClick={() => navigate("/generate")}
        aria-label="Neue Vorlage"
        className="absolute bottom-2 right-5 flex h-12 w-12 items-center justify-center rounded-pill bg-brand-gradient text-white shadow-brand-glow"
      >
        <Plus size={20} strokeWidth={2.5} />
      </TapButton>
    </div>
  );
};

const TemplateCard = ({
  template,
  featured,
  onUse,
}: {
  template: Template;
  featured?: boolean;
  onUse: () => void;
}) => {
  const lastUsed = formatLastUsed(template.last_used_at);
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
      className={cn(
        "float-card rounded-card border bg-surface p-4",
        featured
          ? "border-brand/30 shadow-[0_0_30px_-10px_hsl(var(--brand)/0.45)]"
          : "border-white/[0.06]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-semibold leading-tight text-text-primary">
          {template.title}
          {template.is_new && (
            <span className="ml-2 inline-flex h-5 items-center rounded-pill border border-brand/30 bg-brand/15 px-2 text-[10px] font-bold uppercase tracking-wide text-brand">
              Neu
            </span>
          )}
        </p>
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:text-text-secondary">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <NiveauBadge niveau={template.niveau} />
        {template.topic && <Tag>{template.topic}</Tag>}
        {template.task_types.slice(0, 2).map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
        <Tag>{template.task_count} Aufg.</Tag>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-1.5 text-[12px] text-text-tertiary">
          <Star size={12} />
          <span>{template.usage_count}× verwendet</span>
          {lastUsed && (
            <>
              <span className="text-white/20">·</span>
              <span>{lastUsed}</span>
            </>
          )}
        </div>
        <TapButton
          onClick={onUse}
          className="flex items-center gap-1 text-[13px] font-semibold text-brand hover:text-brand-hover"
        >
          Verwenden <ArrowRight size={14} />
        </TapButton>
      </div>
    </motion.article>
  );
};

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex h-5 items-center rounded-pill border border-white/10 bg-white/[0.04] px-2 text-[11px] font-medium text-text-secondary">
    {children}
  </span>
);

export default Templates;
