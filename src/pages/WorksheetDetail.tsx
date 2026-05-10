import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ClipboardCopy,
  Copy,
  FileText,
  GraduationCap,
  MoreHorizontal,
  Printer,
  Share2,
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

  const handleShare = async () => {
    if (!ws) return;
    setMenuOpen(false);
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
    return (
      <div className="flex h-[60vh] items-center justify-center text-text-tertiary">Lädt…</div>
    );
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

  return (
    <>
      <div className="px-5 pb-8 no-print">
        {/* Top bar */}
        <header
          className="flex items-center justify-between gap-2 pb-4"
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
            onClick={() => setLayout(layout === "read" ? "print" : "read")}
            aria-label="Lesemodus / Druckansicht"
            className={cn(
              "h-9 w-9 rounded-pill ring-hairline transition-colors",
              layout === "read"
                ? "bg-surface-3 text-text-primary"
                : "bg-surface-2 text-text-secondary hover:bg-surface-3",
            )}
          >
            {layout === "read" ? <FileText size={15} /> : <Scroll size={15} />}
          </TapButton>
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
          <TapButton
            onClick={() => setMenuOpen(true)}
            aria-label="Mehr"
            className="h-9 w-9 rounded-pill bg-surface-2 text-text-secondary ring-hairline hover:bg-surface-3 transition-colors"
          >
            <MoreHorizontal size={17} />
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
          <KlassenbuchView
            kb={kb}
            homework={homework}
            setHomework={setHomework}
            onSave={saveHomework}
            onCopy={copyKlassenbuch}
          />
        ) : (
          <>
            {view === "teacher" && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-pill bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300 ring-1 ring-amber-400/20">
                <GraduationCap size={11} /> Lehreransicht
              </div>
            )}

            <Segmented<"student" | "teacher">
              value={view}
              onChange={setView}
              options={[
                { value: "student", label: "Schüler", icon: <UserIcon size={13} /> },
                { value: "teacher", label: "Lehrkraft", icon: <GraduationCap size={13} /> },
              ]}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={`${view}-${layout}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4"
              >
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
              </motion.div>
            </AnimatePresence>

            {/* Lehrerhinweise — only teacher */}
            {view === "teacher" && (sheet.teacher_notes?.length ?? 0) > 0 && (
              <div className="mt-4 rounded-card bg-amber-400/[0.04] ring-1 ring-amber-400/15 p-4">
                <p className="section-label mb-2 text-amber-300/80">Lehrerhinweise</p>
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

            {/* Embedded klassenbuch in teacher mode */}
            {view === "teacher" && kb && (
              <div className="mt-4">
                <p className="section-label mb-2">Klassenbucheintrag</p>
                <KlassenbuchView
                  kb={kb}
                  homework={homework}
                  setHomework={setHomework}
                  onSave={saveHomework}
                  onCopy={copyKlassenbuch}
                />
              </div>
            )}

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

            <div className="mt-5 flex flex-wrap gap-1.5">
              {ws.topic && <Tag>{ws.topic}</Tag>}
              {ws.task_types.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action menu sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto w-full max-w-md rounded-t-large border-hairline/10 bg-bg-elevated p-2"
        >
          <div className="mx-auto mb-2 mt-1 h-1 w-9 rounded-full bg-hairline/15" />
          <MenuRow icon={<Share2 size={16} />} label="Teilen" onClick={handleShare} />
          <MenuRow icon={<Copy size={16} />} label="Kopie duplizieren" onClick={handleDuplicate} />
          <MenuRow icon={<Printer size={16} />} label="Drucken" onClick={handlePrint} />
          <MenuRow
            icon={<FileText size={16} />}
            label="Als PDF exportieren"
            onClick={handlePrint}
          />
          <MenuRow
            icon={<Trash2 size={16} />}
            label="Löschen"
            onClick={handleDelete}
            destructive
          />
        </SheetContent>
      </Sheet>

      {/* Print-only A4 layout (independent from mobile UI) */}
      <PrintWorksheetView
        ws={sheet}
        meta={meta}
        includeSolutions={printSolutions && ws.has_solution}
      />
    </>
  );
};

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
  return (
    <div className="flex flex-col gap-3" style={{ scrollSnapType: "y mandatory" }}>
      <div className="rounded-card bg-surface-1 ring-hairline p-4">
        <p className="section-label">{ws.niveau} · {ws.exercises.length} Aufgaben</p>
        <h2
          className="mt-2 font-display text-[22px] font-semibold tracking-[-0.018em] text-text-primary"
          style={{ lineHeight: 1.25 }}
        >
          {ws.title}
        </h2>
        {ws.learning_goal && (
          <p
            className="mt-2 text-text-secondary"
            style={{ fontSize: 14, lineHeight: 1.7, fontStyle: "italic" }}
          >
            {ws.learning_goal}
          </p>
        )}
      </div>

      {ws.exercises.map((ex, i) => (
        <article
          key={i}
          className="rounded-card bg-surface-1 ring-hairline p-4"
          style={{ scrollSnapAlign: "start" }}
        >
          <span className="inline-flex h-6 items-center rounded-pill bg-surface-2 ring-hairline px-2.5 text-[11px] font-medium text-text-tertiary">
            Aufgabe {i + 1} von {ws.exercises.length}
          </span>
          <p
            className="mt-3 font-medium text-text-primary"
            style={{ fontSize: 16, lineHeight: 1.7 }}
          >
            {ex.instruction}
          </p>
          {ex.context && (
            <p
              className="mt-2 italic text-text-secondary"
              style={{ fontSize: 15, lineHeight: 1.7 }}
            >
              {ex.context}
            </p>
          )}

          {ex.options && ex.options.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-2">
              {ex.options.map((opt, j) => (
                <li
                  key={j}
                  className="flex h-12 items-center rounded-input bg-surface-2 ring-hairline px-4 text-[15px] text-text-primary"
                >
                  {opt.replace(/^[a-dA-D][\).]\s+/, "")}
                </li>
              ))}
            </ul>
          ) : (
            <p
              className="mt-4 whitespace-pre-line text-text-primary"
              style={{ fontSize: 15, lineHeight: 1.8 }}
            >
              {ex.content}
            </p>
          )}

          {teacherMode && (
            <>
              <div className="mt-4 border-t border-hairline/10 pt-3">
                <p
                  className="text-[12px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: "hsl(var(--brand-hover))" }}
                >
                  Lösung
                </p>
                <p
                  className="mt-1 text-[14px]"
                  style={{ color: "hsl(var(--brand-hover))", lineHeight: 1.7 }}
                >
                  {ex.solution}
                </p>
              </div>
              <p className="mt-2 text-[11.5px] text-text-tertiary">
                / {ex.points ?? 5} Punkte
              </p>
            </>
          )}
        </article>
      ))}
    </div>
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
      className="rounded-card"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E5E5",
        padding: "24px 24px",
        color: "#1A1A1A",
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
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "6px 0 0 0" }}>
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
