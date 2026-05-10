import { jsPDF } from "jspdf";
import type { WorksheetData, Exercise } from "@/components/worksheet/WorksheetSheet";

type Meta = {
  schoolLabel: string;
  authorInitials: string;
  worksheetId: string;
  createdAt: string;
};

type KlassenbuchContent = {
  lerninhalt?: string;
  behandelte_aufgaben?: { nummer: number; titel: string; beschreibung: string }[];
  sprachliche_schwerpunkte?: string;
  kompetenzbereiche?: string[];
  datum?: string;
  niveau?: string;
  thema?: string | null;
};

type Options = {
  ws: WorksheetData;
  meta: Meta;
  includeSolutions?: boolean;
  klassenbuch?: { content: KlassenbuchContent; homework?: string | null } | null;
};

// A4 in mm
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const CONTENT_W = PAGE_W - MARGIN * 2;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

/** Replace characters jsPDF's standard Helvetica (WinAnsi) renders poorly. */
const safe = (s: string | null | undefined): string => {
  if (!s) return "";
  return s
    .replace(/\u2248/g, "ca.") // ≈
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'") // ‘ ’ ‚ ′
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"') // “ ” „ ″
    .replace(/[\u2013\u2014]/g, "-") // – —
    .replace(/\u2026/g, "...") // …
    .replace(/[\u00A0\u202F\u2009\u200A\u2007]/g, " ") // non-breaking / thin spaces
    .replace(/\u2022/g, "·"); // • → · (WinAnsi-safe middle dot)
};

export async function generateWorksheetPdf({
  ws,
  meta,
  includeSolutions = false,
  klassenbuch = null,
}: Options): Promise<Blob> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  let y = MARGIN;

  const ensureSpace = (h: number) => {
    if (y + h > PAGE_H - MARGIN - 10) {
      drawFooter(doc, meta);
      doc.addPage();
      y = MARGIN;
    }
  };

  const writeWrapped = (text: string, opts: { size?: number; bold?: boolean; color?: [number, number, number]; gap?: number; indent?: number; italic?: boolean } = {}) => {
    const { size = 11, bold = false, italic = false, color = [17, 17, 17], gap = 1.5, indent = 0 } = opts;
    doc.setFont("helvetica", bold ? (italic ? "bolditalic" : "bold") : italic ? "italic" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const cleaned = safe(text);
    const lines = doc.splitTextToSize(cleaned, CONTENT_W - indent);
    const lineH = size * 0.45;
    for (const line of lines) {
      ensureSpace(lineH);
      doc.text(line, MARGIN + indent, y, { align: "left" });
      y += lineH;
    }
    y += gap;
  };

  // ---------- Header ----------
  doc.setFillColor(17, 17, 17);
  doc.rect(MARGIN, y, 9, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(safe(meta.authorInitials), MARGIN + 4.5, y + 6, { align: "center" });

  doc.setTextColor(17, 17, 17);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
    doc.text(safe(meta.schoolLabel), MARGIN + 12, y + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(safe(`Arbeitsblatt · ${formatDate(meta.createdAt)}`), MARGIN + 12, y + 8);

  // Niveau badge
  doc.setDrawColor(17, 17, 17);
  doc.setLineWidth(0.5);
  doc.rect(PAGE_W - MARGIN - 16, y, 16, 9);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 17, 17);
  doc.text(safe(ws.niveau), PAGE_W - MARGIN - 8, y + 6, { align: "center" });

  y += 12;
  doc.setDrawColor(208, 208, 208);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;

  // Title
  writeWrapped(ws.title, { size: 18, bold: true, gap: 1.5 });

  // Meta line
  const metaParts: string[] = [];
  if (ws.topic) metaParts.push(`Thema: ${ws.topic}`);
  metaParts.push(`${ws.task_count} Aufgaben`);
  if (ws.duration_min) metaParts.push(`ca. ${ws.duration_min} Min.`);
  if (ws.competencies?.length) metaParts.push(ws.competencies.join(" · "));
  writeWrapped(metaParts.join(" · "), { size: 9.5, color: [110, 110, 110], gap: 3 });

  // Learning goal (B&W)
  if (ws.learning_goal) {
    ensureSpace(14);
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(200, 200, 200);
    doc.rect(MARGIN, y, CONTENT_W, 12, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text("LERNZIEL", MARGIN + 2.5, y + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(26, 26, 26);
    const goalLines = doc.splitTextToSize(safe(ws.learning_goal), CONTENT_W - 5);
    doc.text(goalLines.slice(0, 2), MARGIN + 2.5, y + 8.5);
    y += 14;
  }

  // Name/Klasse/Datum
  ensureSpace(10);
  const colW = (CONTENT_W - 12) / 3;
  ["Name", "Klasse", "Datum"].forEach((label, i) => {
    const x = MARGIN + i * (colW + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(label, x, y + 3);
    doc.setDrawColor(140, 140, 140);
    doc.line(x, y + 6, x + colW, y + 6);
  });
  y += 10;

  // Exercises — keep each Aufgabe together on one page when possible
  const PAGE_USABLE = PAGE_H - MARGIN - 10 - MARGIN; // top margin to footer area
  ws.exercises.forEach((ex, i) => {
    const estH = measureExercise(doc, ex);
    const remaining = PAGE_H - MARGIN - 10 - y;
    // Only force a page break if the block fits on a fresh page; otherwise it must split anyway.
    if (estH <= PAGE_USABLE && estH > remaining && y > MARGIN + 1) {
      drawFooter(doc, meta);
      doc.addPage();
      y = MARGIN;
    }
    drawExercise(doc, ex, i, ensureSpace, writeWrapped, () => y, (v) => { y = v; });
    y += 4; // extra spacing between Aufgaben
  });

  drawFooter(doc, meta);

  // Solutions page
  if (includeSolutions && ws.exercises.length > 0) {
    doc.addPage();
    y = MARGIN;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text("LÖSUNGSBLATT", MARGIN, y);
    y += 4;
    doc.setDrawColor(208, 208, 208);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 5;
    writeWrapped(`${ws.title} — Lösungen`, { size: 16, bold: true, gap: 4 });

    ws.exercises.forEach((ex, i) => {
      ensureSpace(12);
      writeWrapped(`Aufgabe ${i + 1} · ${ex.type}`, { size: 9, bold: true, color: [110, 110, 110], gap: 1 });
      writeWrapped(`Lösung: ${ex.solution || "—"}`, { size: 11, gap: 4 });
    });
    drawFooter(doc, meta);
  }

  // Klassenbuch page
  if (klassenbuch?.content) {
    doc.addPage();
    y = MARGIN;
    const c = klassenbuch.content;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text("KLASSENBUCHEINTRAG", MARGIN, y);
    y += 4;
    doc.setDrawColor(208, 208, 208);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 5;
    writeWrapped(ws.title, { size: 16, bold: true, gap: 2 });
    const parts: string[] = [];
    if (c.datum) parts.push(`Datum: ${formatDate(c.datum)}`);
    if (c.niveau) parts.push(`Niveau: ${c.niveau}`);
    if (c.thema) parts.push(`Thema: ${c.thema}`);
    if (parts.length) writeWrapped(parts.join("  ·  "), { size: 9.5, color: [110, 110, 110], gap: 4 });

    if (c.lerninhalt) {
      writeWrapped("Lerninhalt", { size: 10, bold: true, gap: 1 });
      writeWrapped(c.lerninhalt, { size: 11, gap: 3 });
    }
    if (c.behandelte_aufgaben?.length) {
      writeWrapped("Behandelte Aufgaben", { size: 10, bold: true, gap: 1 });
      c.behandelte_aufgaben.forEach((a) =>
        writeWrapped(`${a.nummer}. ${a.titel} — ${a.beschreibung}`, { size: 11, gap: 1 }),
      );
      y += 2;
    }
    if (c.sprachliche_schwerpunkte) {
      writeWrapped("Sprachliche Schwerpunkte", { size: 10, bold: true, gap: 1 });
      writeWrapped(c.sprachliche_schwerpunkte, { size: 11, gap: 3 });
    }
    if (c.kompetenzbereiche?.length) {
      writeWrapped("Kompetenzbereiche", { size: 10, bold: true, gap: 1 });
      writeWrapped(c.kompetenzbereiche.join(", "), { size: 11, gap: 3 });
    }
    if (klassenbuch.homework) {
      writeWrapped("Hausaufgabe", { size: 10, bold: true, gap: 1 });
      writeWrapped(klassenbuch.homework, { size: 11, gap: 3 });
    }
    drawFooter(doc, meta);
  }

  return doc.output("blob");
}

function drawExercise(
  doc: jsPDF,
  ex: Exercise,
  index: number,
  ensureSpace: (h: number) => void,
  writeWrapped: (text: string, opts?: { size?: number; bold?: boolean; color?: [number, number, number]; gap?: number; indent?: number; italic?: boolean }) => void,
  getY: () => number,
  setY: (v: number) => void,
) {
  ensureSpace(16);
  let y = getY();
  // Header strip
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  doc.text(`AUFGABE ${index + 1}`, MARGIN, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 120);
  doc.text(safe(ex.type).toUpperCase(), PAGE_W - MARGIN, y, { align: "right" });
  y += 1.5;
  doc.setDrawColor(207, 207, 207);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 4;
  setY(y);

  writeWrapped(ex.instruction, { size: 11, bold: true, gap: 1.5 });
  if (ex.context) writeWrapped(ex.context, { size: 10, italic: true, color: [85, 85, 85], gap: 2 });

  const t = ex.type.toLowerCase();
  const isMC = t.includes("multiple") || t.includes("auswahl");
  const isSchreib = t.includes("schreib");
  const isLueck = t.includes("lück") || t.includes("luec");

  if (isMC) {
    const lines = ex.content.split(/\n+/).filter((l) => l.trim());
    const opts = ex.options ?? lines.filter((l) => /^[a-dA-D][\).]\s+/.test(l.trim()));
    const stem = lines.filter((l) => !/^[a-dA-D][\).]\s+/.test(l.trim())).join(" ");
    if (stem) writeWrapped(stem, { size: 11, gap: 2 });
    opts.forEach((o, i) => {
      const clean = o.replace(/^[a-dA-D][\).]\s+/, "");
      writeWrapped(`${String.fromCharCode(97 + i)})  ${clean}`, { size: 11, indent: 4, gap: 1 });
    });
    setY(getY() + 2);
  } else if (isSchreib) {
    if (ex.content) writeWrapped(ex.content, { size: 11, italic: true, color: [60, 60, 60], gap: 2 });
    let yy = getY();
    for (let i = 0; i < 6; i++) {
      ensureSpace(8);
      yy = getY();
      doc.setDrawColor(184, 184, 184);
      doc.line(MARGIN, yy + 6, PAGE_W - MARGIN, yy + 6);
      setY(yy + 8);
    }
    setY(getY() + 2);
  } else if (isLueck) {
    // Replace ___ with underline runs (text-based)
    const text = ex.content.replace(/_{3,}/g, "__________");
    writeWrapped(text, { size: 12, gap: 3 });
  } else {
    writeWrapped(ex.content, { size: 11, gap: 3 });
  }
}

function measureWrapped(doc: jsPDF, text: string, size: number, indent = 0, gap = 1.5): number {
  const lines = doc.splitTextToSize(safe(text), CONTENT_W - indent);
  return lines.length * size * 0.45 + gap;
}

function measureExercise(doc: jsPDF, ex: Exercise): number {
  let h = 16 + 5.5;
  h += measureWrapped(doc, ex.instruction, 11, 0, 1.5);
  if (ex.context) h += measureWrapped(doc, ex.context, 10, 0, 2);
  const t = ex.type.toLowerCase();
  const isMC = t.includes("multiple") || t.includes("auswahl");
  const isSchreib = t.includes("schreib");
  const isLueck = t.includes("lück") || t.includes("luec");
  if (isMC) {
    const lines = ex.content.split(/\n+/).filter((l) => l.trim());
    const opts = ex.options ?? lines.filter((l) => /^[a-dA-D][\).]\s+/.test(l.trim()));
    const stem = lines.filter((l) => !/^[a-dA-D][\).]\s+/.test(l.trim())).join(" ");
    if (stem) h += measureWrapped(doc, stem, 11, 0, 2);
    opts.forEach((o) => {
      const clean = o.replace(/^[a-dA-D][\).]\s+/, "");
      h += measureWrapped(doc, `a)  ${clean}`, 11, 4, 1);
    });
    h += 2;
  } else if (isSchreib) {
    if (ex.content) h += measureWrapped(doc, ex.content, 11, 0, 2);
    h += 6 * 8 + 2;
  } else if (isLueck) {
    h += measureWrapped(doc, ex.content.replace(/_{3,}/g, "__________"), 12, 0, 3);
  } else {
    h += measureWrapped(doc, ex.content, 11, 0, 3);
  }
  return h;
}

function drawFooter(doc: jsPDF, meta: Meta) {
  const yy = PAGE_H - 8;
  doc.setDrawColor(221, 221, 221);
  doc.line(MARGIN, yy - 2, PAGE_W - MARGIN, yy - 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(136, 136, 136);
  doc.text(safe(`Lehrly · ${meta.schoolLabel}`), MARGIN, yy + 2);
  doc.text(`ID ${meta.worksheetId.slice(0, 8).toUpperCase()}`, PAGE_W - MARGIN, yy + 2, { align: "right" });
}

export function downloadPdfBlob(blob: Blob, filename: string) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
  const url = URL.createObjectURL(blob);

  if (isIOS) {
    // iOS Safari: open in new tab so user can use share sheet / save to Files
    const win = window.open(url, "_blank");
    if (!win) {
      // Popup blocked → fallback to navigation
      window.location.href = url;
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
