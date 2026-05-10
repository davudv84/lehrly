import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  ClipboardCopy,
  Copy,
  FileText,
  GraduationCap,
  Printer,
  Share2,
  Star,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TapButton from "@/components/TapButton";
import Segmented from "@/components/ui/segmented";
import WorksheetSheet, {
  type WorksheetData,
} from "@/components/worksheet/WorksheetSheet";
import PrintWorksheetView from "@/components/worksheet/PrintWorksheetView";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type KlassenbuchContent = {
  lerninhalt?: string;
  behandelte_aufgaben?: { nummer: number; titel: string; beschreibung: string }[];
  sprachliche_schwerpunkte?: string;
  kompetenzbereiche?: string[];
  datum?: string;
  niveau?: string;
  thema?: string | null;
};
type KBEntry = { id: string; content: KlassenbuchContent; homework: string | null };


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
    learning_goal?: string | null;
    teacher_notes?: string[];
  } | null;
};

const WorksheetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [ws, setWs] = useState<DBWorksheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"student" | "teacher">("student");
  const [printSolutions, setPrintSolutions] = useState(false);
  const [tab, setTab] = useState<"sheet" | "kb">("sheet");
  const [kb, setKb] = useState<KBEntry | null>(null);
  const [homework, setHomework] = useState("");

  useEffect(() => {
    if (!id || !user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data }, { data: kbData }] = await Promise.all([
        supabase.from("worksheets").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("klassenbuch_entries")
          .select("id,content,homework")
          .eq("worksheet_id", id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (!cancelled) {
        setWs((data as DBWorksheet | null) ?? null);
        const k = kbData as unknown as KBEntry | null;
        setKb(k);
        setHomework(k?.homework ?? "");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  const saveHomework = async () => {
    if (!kb) return;
    const { error } = await supabase
      .from("klassenbuch_entries")
      .update({ homework })
      .eq("id", kb.id);
    if (error) toast.error("Speichern fehlgeschlagen");
    else toast.success("Hausaufgabe gespeichert");
  };

  const copyKlassenbuch = async () => {
    if (!kb?.content) return;
    const c = kb.content;
    const text =
      `Datum: ${new Date(c.datum ?? Date.now()).toLocaleDateString("de-DE")}\n` +
      `Niveau: ${c.niveau ?? ""}\nThema: ${c.thema ?? ""}\n\n` +
      `Lerninhalt: ${c.lerninhalt ?? ""}\n\n` +
      `Behandelte Aufgaben:\n${(c.behandelte_aufgaben ?? [])
        .map((a) => `${a.nummer}. ${a.titel} — ${a.beschreibung}`)
        .join("\n")}\n\n` +
      `Sprachliche Schwerpunkte: ${c.sprachliche_schwerpunkte ?? ""}\n` +
      `Kompetenzbereiche: ${(c.kompetenzbereiche ?? []).join(", ")}\n` +
      (homework ? `\nHausaufgabe: ${homework}` : "");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("In die Zwischenablage kopiert");
    } catch {
      toast.error("Kopieren fehlgeschlagen");
    }
  };

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
        learning_goal: ws.content?.learning_goal ?? null,
        teacher_notes: ws.content?.teacher_notes ?? [],
        exercises: ws.content?.exercises ?? [],
      }
    : null;

  const handlePrint = () => {
    window.print();
    setTimeout(() => toast.success("Arbeitsblatt druckbereit"), 400);
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
        <p className="font-display text-[18px] text-text-primary">
          Arbeitsblatt nicht gefunden
        </p>
        <button
          onClick={() => navigate("/library")}
          className="mt-4 text-brand-hover"
        >
          Zur Bibliothek
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="px-5 pb-32 no-print">
        {/* Top bar */}
        <header
          className="flex items-center justify-between gap-3 pb-4"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
        >
          <TapButton
            onClick={() => navigate(-1)}
            aria-label="Zurück"
            className="h-9 w-9 rounded-pill bg-surface-2 text-text-secondary ring-hairline hover:bg-surface-3 transition-colors"
          >
            <ArrowLeft size={17} />
          </TapButton>
          <h1 className="flex-1 truncate text-center text-[14px] font-medium text-text-secondary">
            {ws.title}
          </h1>
          <TapButton
            onClick={toggleFavorite}
            aria-label="Favorit"
            className={cn(
              "h-9 w-9 rounded-pill transition-colors ring-hairline",
              ws.is_favorite
                ? "bg-amber-400/10 text-amber-300"
                : "bg-surface-2 text-text-secondary hover:bg-surface-3",
            )}
          >
            <Star size={15} fill={ws.is_favorite ? "currentColor" : "none"} />
          </TapButton>
        </header>

        {kb && (
          <div className="mb-3 flex gap-1 rounded-pill bg-surface-2 ring-hairline p-1">
            <button
              onClick={() => setTab("sheet")}
              className={cn(
                "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-pill text-[12px] font-medium transition-colors",
                tab === "sheet" ? "bg-surface-3 text-text-primary shadow-xs" : "text-text-tertiary",
              )}
            >
              <FileText size={12} /> Arbeitsblatt
            </button>
            <button
              onClick={() => setTab("kb")}
              className={cn(
                "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-pill text-[12px] font-medium transition-colors",
                tab === "kb" ? "bg-surface-3 text-text-primary shadow-xs" : "text-text-tertiary",
              )}
            >
              <BookOpen size={12} /> Klassenbuch
            </button>
          </div>
        )}

        {tab === "kb" && kb ? (
          <KlassenbuchView kb={kb} homework={homework} setHomework={setHomework} onSave={saveHomework} onCopy={copyKlassenbuch} />
        ) : (
        <>
        {/* View toggle (segmented) */}
        <Segmented<"student" | "teacher">
          value={view}
          onChange={setView}
          options={[
            { value: "student", label: "Schüler", icon: <UserIcon size={13} /> },
            { value: "teacher", label: "Lehrkraft", icon: <GraduationCap size={13} /> },
          ]}
        />

        {/* Sheet preview */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-4"
        >
          <WorksheetSheet
            ws={sheet}
            meta={meta}
            studentView={view === "student"}
            showSolutions={view === "teacher"}
          />
        </motion.div>

        {/* Print options */}
        <div className="mt-5 rounded-card bg-surface-1 ring-hairline p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[13.5px] font-medium text-text-primary">
                Lösungsblatt mitdrucken
              </p>
              <p className="mt-0.5 text-[11.5px] text-text-tertiary">
                Erscheint auf separater Seite.
              </p>
            </div>
            <button
              onClick={() => setPrintSolutions((v) => !v)}
              role="switch"
              aria-checked={printSolutions}
              className={cn(
                "relative h-7 w-12 shrink-0 rounded-pill transition-colors",
                printSolutions ? "bg-brand" : "bg-surface-3",
              )}
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className={cn(
                  "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-xs",
                  printSolutions ? "right-0.5" : "left-0.5",
                )}
              />
            </button>
          </div>
        </div>

        {/* Teacher notes */}
        {view === "teacher" && (sheet.teacher_notes?.length ?? 0) > 0 && (
          <div className="mt-4 rounded-card bg-amber-400/[0.04] ring-1 ring-amber-400/15 p-4">
            <p className="section-label mb-2 text-amber-300/80">
              Lehrerhinweise
            </p>
            <ul className="space-y-1.5">
              {sheet.teacher_notes!.map((n, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-[12.5px] leading-relaxed text-text-secondary"
                >
                  <span className="text-amber-300/70">•</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Meta tags */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {ws.topic && <Tag>{ws.topic}</Tag>}
          {ws.task_types.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </div>

      {/* Sticky floating action bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
        className="fixed inset-x-0 bottom-16 z-40 mx-auto max-w-md px-5 no-print"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="glass flex items-center gap-1 rounded-pill ring-hairline p-1.5 shadow-elevated">
          <ActionPill icon={<Share2 size={14} />} label="Teilen" onClick={handleShare} />
          <ActionPill icon={<Copy size={14} />} label="Kopie" onClick={handleDuplicate} />
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-pill bg-brand text-[13px] font-medium text-primary-foreground hover:bg-brand-hover transition-colors"
          >
            <Printer size={15} /> Drucken
          </motion.button>
        </div>
      </motion.div>

      {/* Print-only A4 layout (independent from mobile UI) */}
      <PrintWorksheetView
        ws={sheet}
        meta={meta}
        includeSolutions={printSolutions && ws.has_solution}
      />
    </>
  );
};

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
    className="flex h-10 items-center gap-1.5 rounded-pill px-3.5 text-[12.5px] font-medium text-text-secondary hover:bg-surface-3 hover:text-text-primary transition-colors"
  >
    {icon}
    {label}
  </button>
);

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex h-6 items-center rounded-pill bg-surface-2 ring-hairline px-2.5 text-[11px] font-medium text-text-secondary">
    {children}
  </span>
);

export default WorksheetDetail;
