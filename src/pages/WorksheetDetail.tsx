import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  ClipboardCopy,
  Copy,
  FileText,
  GraduationCap,
  MoreHorizontal,
  Printer,
  Star,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TapButton from "@/components/TapButton";
import WorksheetSheet, { type WorksheetData } from "@/components/worksheet/WorksheetSheet";
import PrintWorksheetView from "@/components/worksheet/PrintWorksheetView";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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

const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;

const WorksheetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [ws, setWs] = useState<DBWorksheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"student" | "teacher">("student");
  const [layout, setLayout] = useState<"read" | "print">(isDesktop() ? "print" : "read");
  const [printSolutions, setPrintSolutions] = useState(false);
  const [tab, setTab] = useState<"sheet" | "kb">("sheet");
  const [kb, setKb] = useState<KBEntry | null>(null);
  const [homework, setHomework] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement | null>(null);

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

  // Scroll-aware top bar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // First-visit tooltip near segmented control
  useEffect(() => {
    if (loading || !kb) return;
    try {
      if (!localStorage.getItem("lehrly_worksheet_tooltip_seen")) {
        setShowTooltip(true);
      }
    } catch { /* ignore */ }
  }, [loading, kb]);

  const dismissTooltip = () => {
    setShowTooltip(false);
    try { localStorage.setItem("lehrly_worksheet_tooltip_seen", "1"); } catch { /* ignore */ }
  };

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
    setMenuOpen(false);
    window.print();
    setTimeout(() => toast.success("Arbeitsblatt druckbereit"), 400);
  };

  // share removed

  const handleDuplicate = async () => {
    if (!ws || !user) return;
    setMenuOpen(false);
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

  const handleDelete = async () => {
    if (!ws) return;
    setMenuOpen(false);
    const ok = window.confirm("Arbeitsblatt wirklich löschen?");
    if (!ok) return;
    const { error } = await supabase.from("worksheets").delete().eq("id", ws.id);
    if (error) return toast.error("Löschen fehlgeschlagen");
    toast.success("Gelöscht");
    navigate("/library");
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
    return <WorksheetSkeleton />;
  }
  if (!ws || !sheet) {
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center">
        <p className="font-display text-[18px] text-text-primary">Arbeitsblatt nicht gefunden</p>
        <button onClick={() => navigate("/library")} className="mt-4 text-text-primary underline">
          Zur Bibliothek
        </button>
      </div>
    );
  }

  const cardEntry = reduceMotion
    ? { initial: false as const, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.32, ease: [0.22, 0.61, 0.36, 1] as const },
      };

  const modeTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] as const };

  return (
    <>
      <div ref={scrollRef} className="no-print" style={{ paddingBottom: tab === "sheet" ? 96 : 32 }}>
        {/* Top bar — 48px, scroll-aware blur */}
        <header
          className={cn(
            "sticky top-0 z-30 flex items-center gap-3 px-4 transition-colors duration-200",
            scrolled ? "border-b border-hairline/10" : "border-b border-transparent",
          )}
          style={{
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
            paddingBottom: 8,
            height: "calc(env(safe-area-inset-top, 0px) + 48px)",
            backgroundColor: scrolled ? "rgba(20,21,24,0.7)" : "transparent",
            backdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
          }}
        >
          <TapButton
            onClick={() => navigate(-1)}
            aria-label="Zurück"
            className="h-8 w-8 shrink-0 rounded-pill text-text-secondary hover:bg-surface-2 transition-colors"
          >
            <ArrowLeft size={16} />
          </TapButton>

          <h1
            className="min-w-0 truncate text-text-primary"
            style={{ fontSize: 15, fontWeight: 500 }}
          >
            {ws.title}
          </h1>

          {/* Inline compact segmented — only when KB exists */}
          {kb && (
            <div className="relative ml-2 hidden sm:block">
              <CompactSegmented
                value={tab}
                onChange={(v) => { setTab(v); dismissTooltip(); }}
                options={[
                  { value: "sheet", label: "Arbeitsblatt" },
                  { value: "kb", label: "Klassenbucheintrag" },
                ]}
              />
              {showTooltip && (
                <Tooltip onClick={dismissTooltip}>
                  Tippe hier für den Klassenbucheintrag.
                </Tooltip>
              )}
            </div>
          )}

          <div className="ml-auto flex items-center gap-1">
            <TapButton
              onClick={toggleFavorite}
              aria-label="Favorit"
              className={cn(
                "h-8 w-8 rounded-pill transition-colors",
                ws.is_favorite ? "text-amber-300" : "text-text-tertiary hover:bg-surface-2",
              )}
            >
              <Star size={15} fill={ws.is_favorite ? "currentColor" : "none"} />
            </TapButton>
            <TapButton
              onClick={() => setMenuOpen(true)}
              aria-label="Mehr"
              className="h-8 w-8 rounded-pill text-text-secondary hover:bg-surface-2 transition-colors"
            >
              <MoreHorizontal size={16} />
            </TapButton>
          </div>
        </header>

        {/* Mobile inline segmented (when no room in topbar) */}
        {kb && (
          <div className="relative px-4 pt-3 sm:hidden">
            <CompactSegmented
              value={tab}
              onChange={(v) => { setTab(v); dismissTooltip(); }}
              options={[
                { value: "sheet", label: "Arbeitsblatt" },
                { value: "kb", label: "Klassenbucheintrag" },
              ]}
            />
            {showTooltip && (
              <Tooltip onClick={dismissTooltip} mobile>
                Tippe hier für den Klassenbucheintrag.
              </Tooltip>
            )}
          </div>
        )}

        {/* Content area */}
        <motion.div {...cardEntry} className="px-2 pt-6 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={modeTransition}
            >
              {tab === "kb" && kb ? (
                <KlassenbuchView
                  kb={kb}
                  homework={homework}
                  setHomework={setHomework}
                  onSave={saveHomework}
                  onCopy={copyKlassenbuch}
                />
              ) : (
                <>
                  {layout === "print" ? (
                    <WorksheetSheet
                      ws={sheet}
                      meta={meta}
                      studentView={view === "student"}
                      showSolutions={view === "teacher"}
                    />
                  ) : (
                    <ReadingMode ws={sheet} teacherMode={view === "teacher"} />
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {tab === "sheet" && (
            <div className="mx-auto mt-6 w-full" style={{ maxWidth: 760 }}>
              {/* View toggle (Schüler/Lehrkraft) — secondary, less prominent */}
              <div className="flex items-center justify-between gap-3 px-2">
                <CompactSegmented<"student" | "teacher">
                  value={view}
                  onChange={setView}
                  options={[
                    { value: "student", label: "Schüler", icon: <UserIcon size={12} /> },
                    { value: "teacher", label: "Lehrkraft", icon: <GraduationCap size={12} /> },
                  ]}
                />
              </div>

              {view === "teacher" && (sheet.teacher_notes?.length ?? 0) > 0 && (
                <div className="mt-6 rounded-[8px] bg-amber-400/[0.04] ring-1 ring-amber-400/15 p-4">
                  <p className="section-label mb-2 text-amber-300/80">Lehrerhinweise</p>
                  <ul className="space-y-2">
                    {sheet.teacher_notes!.map((n, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-text-secondary"
                        style={{ fontSize: 13, lineHeight: 1.7 }}
                      >
                        <span className="text-amber-300/70">•</span>
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2 px-2">
                {ws.topic && <Tag>{ws.topic}</Tag>}
                {ws.task_types.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Action menu sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto w-full max-w-md rounded-t-large border-hairline/10 p-2"
          style={{
            backgroundColor: "rgba(20,21,24,0.92)",
            backdropFilter: "blur(28px) saturate(160%)",
          }}
        >
          <div className="mx-auto mb-2 mt-1 h-1 w-9 rounded-full bg-hairline/15" />
          <MenuRow
            icon={layout === "read" ? <FileText size={16} /> : <FileText size={16} />}
            label={layout === "read" ? "Druckansicht" : "Lesemodus"}
            onClick={() => { setLayout(layout === "read" ? "print" : "read"); setMenuOpen(false); }}
          />
          <MenuRow
            icon={<UserIcon size={16} />}
            label={view === "student" ? "Lehreransicht" : "Schüleransicht"}
            onClick={() => { setView(view === "student" ? "teacher" : "student"); setMenuOpen(false); }}
          />
          <MenuRow
            icon={<Printer size={16} />}
            label={`Lösung mitdrucken: ${printSolutions ? "An" : "Aus"}`}
            onClick={() => setPrintSolutions((v) => !v)}
          />
          <div className="my-1 h-px bg-hairline/10" />
          <MenuRow icon={<Copy size={16} />} label="Kopie duplizieren" onClick={handleDuplicate} />
          <MenuRow
            icon={<Trash2 size={16} />}
            label="Löschen"
            onClick={handleDelete}
            destructive
          />
        </SheetContent>
      </Sheet>

      {/* Fixed action bar above bottom nav — Drucken / PDF */}
      {tab === "sheet" && (
        <div
          className="no-print fixed inset-x-0 z-30"
          style={{
            bottom: "calc(56px + env(safe-area-inset-bottom, 0px))",
            backgroundColor: "rgba(14,15,17,0.92)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            borderTop: "1px solid hsl(var(--hairline) / 0.1)",
          }}
        >
          <div className="mx-auto flex w-full max-w-md items-center gap-2 px-4 py-2.5">
            <button
              onClick={handlePrint}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-pill bg-surface-2 ring-hairline text-[13px] font-medium text-text-primary hover:bg-surface-3 transition-colors"
            >
              <Printer size={14} /> Drucken
            </button>
            <button
              onClick={handlePrint}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-pill bg-surface-2 ring-hairline text-[13px] font-medium text-text-primary hover:bg-surface-3 transition-colors"
            >
              <FileText size={14} /> Als PDF
            </button>
          </div>
        </div>
      )}

      {/* Print-only A4 layout (independent from mobile UI) */}
      <PrintWorksheetView
        ws={sheet}
        meta={meta}
        includeSolutions={printSolutions && ws.has_solution}
      />
    </>
  );
};

/* ---------- Compact segmented (32px, inline) ---------- */
function CompactSegmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
}) {
  return (
    <div
      role="tablist"
      className="inline-flex items-center rounded-pill bg-surface-2 ring-hairline p-0.5"
      style={{ height: 32 }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <motion.button
            key={String(opt.value)}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.08 }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-pill px-3 transition-colors",
              active ? "bg-surface-3 text-text-primary shadow-xs" : "text-text-tertiary hover:text-text-secondary",
            )}
            style={{ height: 28, fontSize: 13, fontWeight: 500 }}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ---------- Tooltip ---------- */
const Tooltip = ({
  children,
  onClick,
  mobile,
}: {
  children: React.ReactNode;
  onClick: () => void;
  mobile?: boolean;
}) => (
  <motion.button
    onClick={onClick}
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.18 }}
    className={cn(
      "absolute z-20 rounded-[8px] px-3 py-2 text-left text-text-primary shadow-elevated",
      mobile ? "left-4 right-4 top-full mt-2" : "left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap",
    )}
    style={{
      backgroundColor: "rgba(20,21,24,0.95)",
      backdropFilter: "blur(20px)",
      fontSize: 12,
      fontWeight: 500,
    }}
  >
    {children}
  </motion.button>
);

/* ---------- Skeleton ---------- */
const WorksheetSkeleton = () => (
  <div className="px-4 pt-12">
    <div className="mx-auto w-full" style={{ maxWidth: 760 }}>
      <div
        className="rounded-[8px] p-8"
        style={{
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.25)",
        }}
      >
        <div className="h-3 w-32 animate-pulse rounded bg-black/10" />
        <div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-black/10" />
        <div className="mt-8 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-black/10" />
              <div className="h-3 w-full animate-pulse rounded bg-black/10" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-black/10" />
              <div className="h-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);


const MenuRow = ({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex w-full items-center gap-3 rounded-input px-4 py-3.5 text-left text-[14px] font-medium transition-colors hover:bg-surface-2",
      destructive ? "text-destructive" : "text-text-primary",
    )}
  >
    <span className={destructive ? "text-destructive" : "text-text-tertiary"}>{icon}</span>
    {label}
  </button>
);

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex h-6 items-center rounded-pill bg-surface-2 ring-hairline px-2.5 text-[11px] font-medium text-text-secondary">
    {children}
  </span>
);

/* ---------- Reading mode ---------- */

const ReadingMode = ({
  ws,
  teacherMode,
}: {
  ws: WorksheetData;
  teacherMode: boolean;
}) => {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const visibleExercises = expanded ? ws.exercises : ws.exercises.slice(0, 1);
  const remaining = ws.exercises.length - visibleExercises.length;
  const stagger = (i: number) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, delay: 0.06 * (i + 1), ease: [0.22, 0.61, 0.36, 1] as const },
        };

  return (
    <article
      className="mx-auto w-full"
      style={{
        maxWidth: 760,
        backgroundColor: "#FFFFFF",
        color: "#1A1A1A",
        borderRadius: 8,
        boxShadow: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.25)",
        padding: "32px 24px",
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        style={{ paddingBottom: 24, borderBottom: "1px solid #E5E5E5" }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#666",
            margin: 0,
          }}
        >
          {ws.niveau} · {ws.exercises.length} Aufgaben
        </p>
        <h2
          style={{
            margin: "12px 0 0 0",
            fontFamily: '"Source Serif 4", "Source Serif Pro", Georgia, serif',
            fontSize: 26,
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: "-0.012em",
            color: "#1A1A1A",
          }}
        >
          {ws.title}
        </h2>
        {ws.learning_goal && (
          <p
            style={{
              marginTop: 12,
              fontSize: 14,
              lineHeight: 1.7,
              fontStyle: "italic",
              color: "#444",
            }}
          >
            {ws.learning_goal}
          </p>
        )}
      </motion.header>

      <div>
        {visibleExercises.map((ex, i) => (
          <motion.section
            key={i}
            {...stagger(i)}
            style={{ marginTop: i === 0 ? 32 : 40 }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#666",
                margin: 0,
              }}
            >
              Aufgabe {i + 1} · von {ws.exercises.length}
            </p>
            <h3
              style={{
                margin: "8px 0 0 0",
                fontFamily: '"Source Serif 4", "Source Serif Pro", Georgia, serif',
                fontSize: 18,
                fontWeight: 600,
                lineHeight: 1.35,
                color: "#1A1A1A",
              }}
            >
              {ex.instruction}
            </h3>
            {ex.context && (
              <p
                style={{
                  marginTop: 8,
                  fontSize: 15,
                  lineHeight: 1.7,
                  fontStyle: "italic",
                  color: "#444",
                }}
              >
                {ex.context}
              </p>
            )}

            {ex.options && ex.options.length > 0 ? (
              <ul style={{ marginTop: 16, padding: 0, listStyle: "none" }}>
                {ex.options.map((opt, j) => (
                  <li
                    key={j}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "8px 0",
                      fontSize: 15,
                      lineHeight: 1.7,
                      color: "#1A1A1A",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 14,
                        height: 14,
                        border: "1.2px solid #1A1A1A",
                        borderRadius: 2,
                        marginTop: 4,
                        flexShrink: 0,
                      }}
                    />
                    <span>{opt.replace(/^[a-dA-D][\).]\s+/, "")}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p
                style={{
                  marginTop: 16,
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: "#1A1A1A",
                  whiteSpace: "pre-line",
                }}
              >
                {ex.content}
              </p>
            )}

            {teacherMode && (
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: "1px dashed #CCCCCC",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#0F7A4E",
                  }}
                >
                  Lösung
                </p>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "#0F7A4E",
                  }}
                >
                  {ex.solution}
                </p>
                <p style={{ margin: "8px 0 0 0", fontSize: 12, color: "#666" }}>
                  / {ex.points ?? 5} Punkte
                </p>
              </div>
            )}
          </motion.section>
        ))}
      </div>
      {remaining > 0 && (
        <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => setExpanded(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 40,
              padding: "0 18px",
              fontSize: 13,
              fontWeight: 500,
              color: "#1A1A1A",
              backgroundColor: "#F5F5F5",
              border: "1px solid #E5E5E5",
              borderRadius: 999,
              cursor: "pointer",
            }}
          >
            Weitere Aufgaben anzeigen ({remaining})
            <ChevronDown size={14} />
          </button>
        </div>
      )}
    </article>
  );
};

const KlassenbuchView = ({
  kb,
  homework,
  setHomework,
  onSave,
  onCopy,
}: {
  kb: KBEntry;
  homework: string;
  setHomework: (v: string) => void;
  onSave: () => void;
  onCopy: () => void;
}) => {
  const c = kb.content;
  return (
    <div
      className="mx-auto w-full"
      style={{
        maxWidth: 760,
        backgroundColor: "#FAFAF7",
        borderRadius: 8,
        boxShadow: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.25)",
        padding: "32px 32px",
        color: "#1A1A1A",
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <p
        style={{
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#666",
          fontWeight: 600,
          margin: 0,
        }}
      >
        Klassenbucheintrag
      </p>
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: "8px 0 0 0", letterSpacing: "-0.01em" }}>
        {new Date(c.datum ?? Date.now()).toLocaleDateString("de-DE")} · {c.niveau} · {c.thema ?? ""}
      </h2>
      <KSection title="Lerninhalt">
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{c.lerninhalt}</p>
      </KSection>
      <KSection title="Behandelte Aufgaben">
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          {(c.behandelte_aufgaben ?? []).map((a) => (
            <li key={a.nummer} style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 4 }}>
              <strong>{a.titel}</strong> —{" "}
              <span style={{ color: "#444" }}>{a.beschreibung}</span>
            </li>
          ))}
        </ol>
      </KSection>
      <KSection title="Sprachliche Schwerpunkte">
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{c.sprachliche_schwerpunkte}</p>
      </KSection>
      <KSection title="Kompetenzbereiche">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(c.kompetenzbereiche ?? []).map((k) => (
            <span
              key={k}
              style={{
                display: "inline-flex",
                height: 24,
                padding: "0 10px",
                fontSize: 12,
                color: "#444",
                backgroundColor: "#F5F5F5",
                border: "1px solid #E5E5E5",
              }}
            >
              {k}
            </span>
          ))}
        </div>
      </KSection>
      <KSection title="Hausaufgabe">
        <textarea
          value={homework}
          onChange={(e) => setHomework(e.target.value)}
          onBlur={onSave}
          placeholder="Hausaufgabe eintragen…"
          style={{
            width: "100%",
            minHeight: 60,
            padding: 10,
            fontSize: 13.5,
            border: "1px solid #E5E5E5",
            backgroundColor: "#FAFAFA",
            color: "#1A1A1A",
            fontFamily: "inherit",
            resize: "vertical",
          }}
        />
      </KSection>
      <div
        className="no-print"
        style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <button
          onClick={onCopy}
          style={{
            flex: 1,
            height: 42,
            backgroundColor: "#1A1A1A",
            color: "#FFFFFF",
            fontSize: 13.5,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            border: "1px solid #1A1A1A",
          }}
        >
          <ClipboardCopy size={14} /> In Klassenbuch-Format kopieren
        </button>
        <button
          onClick={() => window.print()}
          style={{
            flex: 1,
            height: 42,
            backgroundColor: "#FFFFFF",
            color: "#1A1A1A",
            fontSize: 13.5,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            border: "1px solid #1A1A1A",
          }}
        >
          <Printer size={14} /> Als PDF exportieren
        </button>
      </div>
    </div>
  );
};

const KSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginTop: 18 }}>
    <h3
      style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        color: "#666",
        margin: "0 0 8px 0",
      }}
    >
      {title}
    </h3>
    {children}
  </section>
);

export default WorksheetDetail;
