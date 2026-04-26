import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Maximize2,
  MoreHorizontal,
  Printer,
  Share2,
  Star,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import NiveauBadge from "@/components/NiveauBadge";
import TapButton from "@/components/TapButton";
import Chip from "@/components/Chip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Exercise = {
  type: string;
  instruction: string;
  content: string;
  solution: string;
};

type Worksheet = {
  id: string;
  title: string;
  niveau: string;
  topic: string | null;
  task_types: string[];
  task_count: number;
  has_solution: boolean;
  is_favorite: boolean;
  created_at: string;
  content: { title?: string; exercises?: Exercise[] } | null;
};

const formatRelative = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `vor ${Math.max(1, mins)} Minuten`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `vor ${hrs} Stunden`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "gestern";
  return `vor ${days} Tagen`;
};

const WorksheetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [ws, setWs] = useState<Worksheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSolutions, setShowSolutions] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("worksheets")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!cancelled) {
        setWs((data as Worksheet | null) ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!ws) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: ws.title, text: ws.title, url });
      } catch {
        /* user cancelled */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link kopiert");
    } catch {
      toast.error("Konnte Link nicht kopieren");
    }
  };

  const handleDuplicate = async () => {
    if (!ws || !user) return;
    const { data, error } = await supabase
      .from("worksheets")
      .insert({
        user_id: user.id,
        title: `${ws.title} (Kopie)`,
        niveau: ws.niveau,
        topic: ws.topic,
        task_types: ws.task_types,
        task_count: ws.task_count,
        has_solution: ws.has_solution,
        content: ws.content ?? {},
      })
      .select("id")
      .single();
    if (error || !data) {
      toast.error("Duplizieren fehlgeschlagen");
      return;
    }
    toast.success("Kopie erstellt");
    navigate(`/worksheets/${data.id}`);
  };

  const toggleFavorite = async () => {
    if (!ws) return;
    const next = !ws.is_favorite;
    setWs({ ...ws, is_favorite: next });
    const { error } = await supabase
      .from("worksheets")
      .update({ is_favorite: next })
      .eq("id", ws.id);
    if (error) {
      setWs({ ...ws, is_favorite: !next });
      toast.error("Konnte nicht speichern");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-text-tertiary">
        Lädt…
      </div>
    );
  }
  if (!ws) {
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center">
        <p className="text-h3 text-text-primary">Arbeitsblatt nicht gefunden</p>
        <button
          onClick={() => navigate("/library")}
          className="mt-4 text-brand"
        >
          Zur Bibliothek
        </button>
      </div>
    );
  }

  const exercises = ws.content?.exercises ?? [];
  const schoolLabel = profile?.school?.trim() || "Lehrly";
  const initialsLabel = profile?.kuerzel?.slice(0, 1).toUpperCase() || "L";

  return (
    <>
      <div className="px-5 print:hidden">
        <header
          className="flex items-center justify-between gap-3 pb-4"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)" }}
        >
          <TapButton
            onClick={() => navigate(-1)}
            aria-label="Zurück"
            className="h-9 w-9 rounded-pill bg-surface text-text-secondary"
          >
            <ArrowLeft size={18} />
          </TapButton>
          <h1 className="flex-1 truncate text-center text-[16px] font-semibold text-text-primary">
            {ws.title}
          </h1>
          <div className="flex items-center gap-2">
            <TapButton
              onClick={handleShare}
              aria-label="Teilen"
              className="h-9 w-9 rounded-pill bg-surface text-text-secondary"
            >
              <Share2 size={16} />
            </TapButton>
            <TapButton
              onClick={toggleFavorite}
              aria-label="Favorit"
              className={cn(
                "h-9 w-9 rounded-pill bg-surface",
                ws.is_favorite ? "text-amber-400" : "text-text-secondary",
              )}
            >
              <Star size={16} fill={ws.is_favorite ? "currentColor" : "none"} />
            </TapButton>
            <TapButton
              onClick={() => toast("Mehr-Optionen folgen bald.")}
              aria-label="Mehr"
              className="h-9 w-9 rounded-pill bg-surface text-text-secondary"
            >
              <MoreHorizontal size={16} />
            </TapButton>
          </div>
        </header>

        {/* Sheet preview card (white paper) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-card border border-white/[0.06] bg-white text-zinc-900 shadow-2xl"
        >
          <div className="flex items-center justify-between gap-2 border-b border-zinc-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand text-[11px] font-bold text-white">
                {initialsLabel}
              </div>
              <span className="text-[12px] font-medium text-zinc-700">
                {schoolLabel}
              </span>
            </div>
            <span className="rounded-pill bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
              Niveau {ws.niveau}
            </span>
          </div>
          <div className="px-5 pb-5 pt-4">
            <h2 className="text-[15px] font-bold leading-tight text-zinc-900">
              {ws.content?.title || ws.title}
            </h2>
            <ol className="mt-3 space-y-3">
              {exercises.slice(0, fullscreen ? exercises.length : 4).map((ex, i) => (
                <li key={i} className="text-[12px] text-zinc-700">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                    {i + 1}. {ex.type}
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-zinc-800">
                    {ex.instruction}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-zinc-700">
                    {ex.content}
                  </p>
                  {showSolutions && (
                    <p className="mt-1 rounded bg-brand/10 px-2 py-1 text-[11px] text-brand">
                      Lösung: {ex.solution}
                    </p>
                  )}
                </li>
              ))}
              {!fullscreen && exercises.length > 4 && (
                <li className="text-[11px] italic text-zinc-400">
                  … +{exercises.length - 4} weitere Aufgaben
                </li>
              )}
            </ol>
          </div>
          <button
            onClick={() => setFullscreen((v) => !v)}
            className="absolute bottom-3 right-3 flex items-center gap-1 rounded-pill bg-brand/10 px-3 py-1 text-[11px] font-semibold text-brand"
          >
            <Maximize2 size={11} /> {fullscreen ? "Kompakt" : "Vollbild"}
          </button>
          <div className="absolute bottom-3 left-3 text-[10px] text-zinc-400">
            1/{Math.max(1, Math.ceil(exercises.length / 4))}
          </div>
        </motion.div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          <NiveauBadge niveau={ws.niveau} />
          {ws.topic && <SmallTag>{ws.topic}</SmallTag>}
          {ws.task_types.map((t) => (
            <SmallTag key={t}>{t}</SmallTag>
          ))}
        </div>

        {/* Meta */}
        <p className="mt-3 text-[12px] text-text-tertiary">
          Erstellt {formatRelative(ws.created_at)} · {ws.task_count} Aufgaben
          {ws.has_solution ? " · Mit Lösungsblatt" : ""}
        </p>

        {/* Solution toggle */}
        {ws.has_solution && exercises.length > 0 && (
          <div className="mt-3">
            <Chip
              size="sm"
              active={showSolutions}
              onClick={() => setShowSolutions((v) => !v)}
            >
              {showSolutions ? "Lösungen verbergen" : "Lösungen anzeigen"}
            </Chip>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-5 grid grid-cols-3 gap-3 pb-8">
          <ActionButton icon={<Printer size={20} />} label="Drucken" onClick={handlePrint} />
          <ActionButton icon={<Share2 size={20} />} label="Teilen" onClick={handleShare} />
          <ActionButton icon={<Copy size={20} />} label="Duplizieren" onClick={handleDuplicate} />
        </div>
      </div>

      {/* Print-only layout */}
      <div className="hidden print:block bg-white text-black p-8">
        <div className="mb-6 flex items-center justify-between border-b pb-3">
          <div>
            <p className="text-xs font-semibold">{schoolLabel}</p>
            <h1 className="text-xl font-bold">{ws.content?.title || ws.title}</h1>
          </div>
          <span className="rounded border px-2 py-1 text-xs">Niveau {ws.niveau}</span>
        </div>
        <ol className="space-y-4">
          {exercises.map((ex, i) => (
            <li key={i}>
              <p className="text-xs font-bold uppercase">
                {i + 1}. {ex.type}
              </p>
              <p className="font-medium">{ex.instruction}</p>
              <p>{ex.content}</p>
            </li>
          ))}
        </ol>
        {ws.has_solution && (
          <div className="mt-10 border-t pt-4">
            <h2 className="mb-3 text-lg font-bold">Lösungen</h2>
            <ol className="space-y-2 text-sm">
              {exercises.map((ex, i) => (
                <li key={i}>
                  <span className="font-semibold">{i + 1}.</span> {ex.solution}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </>
  );
};

const ActionButton = ({
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
    className="flex flex-col items-center justify-center gap-2 rounded-card border border-white/[0.06] bg-surface px-3 py-4"
  >
    <div className="text-brand">{icon}</div>
    <span className="text-[12px] font-medium text-text-primary">{label}</span>
  </TapButton>
);

const SmallTag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex h-6 items-center rounded-pill border border-white/10 bg-white/[0.04] px-2.5 text-[11px] font-medium text-text-secondary">
    {children}
  </span>
);

export default WorksheetDetail;
