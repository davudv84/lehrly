import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  GraduationCap,
  Printer,
  Share2,
  Star,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TapButton from "@/components/TapButton";
import WorksheetSheet, {
  type WorksheetData,
} from "@/components/worksheet/WorksheetSheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DBWorksheet = {
  id: string;
  title: string;
  niveau: string;
  topic: string | null;
  task_types: string[];
  task_count: number;
  has_solution: boolean;
  is_favorite: boolean;
  created_at: string;
  content: {
    title?: string;
    exercises?: WorksheetData["exercises"];
    competencies?: string[];
    duration_min?: number;
  } | null;
};

const WorksheetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [ws, setWs] = useState<DBWorksheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSolutions, setShowSolutions] = useState(false);
  const [view, setView] = useState<"teacher" | "student">("student");
  const [printSolutions, setPrintSolutions] = useState(false);

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
        setWs((data as DBWorksheet | null) ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  const meta = useMemo(
    () => ({
      schoolLabel: profile?.school?.trim() || "Lehrly",
      authorInitials:
        profile?.kuerzel?.slice(0, 2).toUpperCase() ||
        profile?.name?.slice(0, 1).toUpperCase() ||
        "L",
      worksheetId: ws?.id ?? "",
      createdAt: ws?.created_at ?? new Date().toISOString(),
    }),
    [profile, ws],
  );

  const sheet: WorksheetData | null = ws
    ? {
        title: ws.content?.title || ws.title,
        niveau: ws.niveau,
        topic: ws.topic,
        task_count: ws.task_count,
        competencies: ws.content?.competencies ?? [],
        duration_min: ws.content?.duration_min ?? null,
        exercises: ws.content?.exercises ?? [],
      }
    : null;

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
    if (error || !data) return toast.error("Duplizieren fehlgeschlagen");
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
  if (!ws || !sheet) {
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

  return (
    <>
      {/* On-screen UI */}
      <div className="px-5 pb-32 no-print">
        {/* Top bar */}
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
          <h1 className="flex-1 truncate text-center text-[15px] font-semibold text-text-primary">
            {ws.title}
          </h1>
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
        </header>

        {/* View toggle */}
        <div className="mb-3 flex gap-2">
          <ViewTab
            active={view === "student"}
            onClick={() => setView("student")}
            icon={<UserIcon size={14} />}
            label="Schüler-Ansicht"
          />
          <ViewTab
            active={view === "teacher"}
            onClick={() => {
              setView("teacher");
              setShowSolutions(true);
            }}
            icon={<GraduationCap size={14} />}
            label="Lehrer-Ansicht"
          />
        </div>

        {/* Sheet preview */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <WorksheetSheet
            ws={sheet}
            meta={meta}
            studentView={view === "student"}
            showSolutions={view === "teacher" && showSolutions}
          />
        </motion.div>

        {/* Quick options card */}
        <div className="mt-4 rounded-card border border-white/[0.06] bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-text-primary">
                Lösungen anzeigen
              </p>
              <p className="text-[11.5px] text-text-tertiary">
                {view === "teacher"
                  ? "Aktiv in der Lehrer-Ansicht."
                  : "Wechsle zur Lehrer-Ansicht, um Lösungen zu sehen."}
              </p>
            </div>
            <button
              onClick={() => {
                if (view === "student") setView("teacher");
                setShowSolutions((v) => !v);
              }}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-pill px-3 text-[12px] font-semibold transition-colors",
                view === "teacher" && showSolutions
                  ? "bg-brand text-white"
                  : "bg-white/5 text-text-secondary",
              )}
            >
              {showSolutions && view === "teacher" ? (
                <>
                  <Eye size={13} /> An
                </>
              ) : (
                <>
                  <EyeOff size={13} /> Aus
                </>
              )}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
            <div>
              <p className="text-[13px] font-semibold text-text-primary">
                Lösungen separat drucken
              </p>
              <p className="text-[11.5px] text-text-tertiary">
                Lösungsblatt auf eigene Seite.
              </p>
            </div>
            <button
              onClick={() => setPrintSolutions((v) => !v)}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-pill px-3 text-[12px] font-semibold transition-colors",
                printSolutions
                  ? "bg-brand text-white"
                  : "bg-white/5 text-text-secondary",
              )}
            >
              {printSolutions ? <Check size={13} /> : null}
              {printSolutions ? "Mit Lösungen" : "Nur Aufgaben"}
            </button>
          </div>
        </div>

        {/* Meta tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {ws.topic && <Tag>{ws.topic}</Tag>}
          {ws.task_types.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </div>

      {/* Sticky action bar */}
      <div
        className="fixed inset-x-0 bottom-16 z-40 mx-auto max-w-md px-5 no-print"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex items-center gap-2 rounded-pill border border-white/[0.08] bg-bg-elevated/95 p-1.5 shadow-2xl backdrop-blur-md">
          <ActionPill icon={<Share2 size={15} />} label="Teilen" onClick={handleShare} />
          <ActionPill icon={<Copy size={15} />} label="Kopie" onClick={handleDuplicate} />
          <button
            onClick={handlePrint}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-pill bg-brand-gradient text-[13.5px] font-semibold text-white shadow-brand-glow"
          >
            <Printer size={16} /> PDF / Drucken
          </button>
        </div>
      </div>

      {/* Print-only A4 layout */}
      <div className="print-root hidden print:block">
        <WorksheetSheet
          ws={sheet}
          meta={meta}
          studentView
          className="!shadow-none !border-0 !rounded-none !aspect-auto"
        />
        {printSolutions && ws.has_solution && (
          <div className="page-break-before paper px-7 pt-6">
            <header className="border-b border-zinc-200 pb-3">
              <p className="ui text-[11px] uppercase tracking-[0.12em] text-zinc-400">
                Lösungsblatt
              </p>
              <h1 className="mt-1 text-[20px] font-bold text-zinc-900">
                {ws.title} — Lösungen
              </h1>
            </header>
            <ol className="mt-4 space-y-3">
              {sheet.exercises.map((ex, i) => (
                <li key={i} className="avoid-break">
                  <p className="ui text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                    Aufgabe {i + 1} · {ex.type}
                  </p>
                  <p className="mt-0.5 text-[13.5px] text-zinc-900">
                    <span className="font-semibold">Lösung:</span> {ex.solution}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </>
  );
};

const ViewTab = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-pill border text-[12px] font-semibold transition-colors",
      active
        ? "border-brand/40 bg-brand-muted text-brand"
        : "border-white/10 bg-surface text-text-secondary",
    )}
  >
    {icon}
    {label}
  </button>
);

const ActionPill = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex h-11 items-center gap-1.5 rounded-pill px-3.5 text-[12.5px] font-medium text-text-primary hover:bg-white/5"
  >
    {icon}
    {label}
  </button>
);

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex h-6 items-center rounded-pill border border-white/10 bg-white/[0.04] px-2.5 text-[11px] font-medium text-text-secondary">
    {children}
  </span>
);

export default WorksheetDetail;
