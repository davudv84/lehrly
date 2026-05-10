import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MoreHorizontal, Star } from "lucide-react";
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
  if (days < 1) return "heute";
  if (days === 1) return "gestern";
  return `vor ${days} Tagen`;
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
        className="flex items-end justify-between pb-6"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 24px)" }}
      >
        <div>
          <p className="section-label">Wiederverwendbar</p>
          <h1 className="mt-2 font-display text-[26px] font-semibold leading-tight tracking-[-0.022em] text-text-primary">
            Vorlagen
          </h1>
          <p className="mt-2 max-w-[320px] text-[14px] leading-relaxed text-text-secondary">
            Speichere deine Lieblings-Konfigurationen und starte jede Stunde in Sekunden.
          </p>
        </div>
        <button
          onClick={() => navigate("/generate")}
          className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          + Neu
        </button>
      </header>

      <div className="flex flex-col gap-3 pb-16">
        {items.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
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
          <div className="mt-10 rounded-card border border-dashed border-hairline/10 px-5 py-12 text-center">
            <p className="text-[13.5px] text-text-secondary">
              Noch keine Vorlagen — speichere deine nächste Generation als Vorlage.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const TemplateCard = ({
  template,
  onUse,
}: {
  template: Template;
  onUse: () => void;
}) => {
  const lastUsed = formatLastUsed(template.last_used_at);
  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
      className="float-card rounded-card bg-surface-1 ring-hairline p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[15px] font-medium leading-tight tracking-[-0.01em] text-text-primary">
            {template.title}
          </p>
          {template.is_new && (
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
        <NiveauBadge niveau={template.niveau} />
        {template.topic && <Tag>{template.topic}</Tag>}
        {template.task_types.slice(0, 2).map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
        <Tag>{template.task_count} Aufg.</Tag>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-hairline/5 pt-3.5">
        <div className="flex items-center gap-1.5 text-[11.5px] text-text-tertiary">
          <Star size={11} />
          <span>{template.usage_count}× verwendet</span>
          {lastUsed && (
            <>
              <span className="opacity-40">·</span>
              <span>{lastUsed}</span>
            </>
          )}
        </div>
        <TapButton
          onClick={onUse}
          className="flex items-center gap-1 text-[12.5px] font-medium text-text-primary hover:text-white transition-colors"
        >
          Verwenden <ArrowRight size={13} />
        </TapButton>
      </div>
    </motion.article>
  );
};

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className={cn(
    "inline-flex h-5 items-center rounded-pill bg-surface-2 px-2 text-[10.5px] font-medium text-text-secondary ring-hairline",
  )}>
    {children}
  </span>
);

export default Templates;
