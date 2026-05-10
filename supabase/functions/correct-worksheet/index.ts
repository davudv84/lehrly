// Auto-correct a scanned student worksheet via Lovable AI vision.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Body = {
  worksheetId?: string;
  imageBase64: string; // data: URL (data:image/png;base64,....)
  studentName?: string;
  imagePath?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization header" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supa = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userResp, error: userErr } = await supa.auth.getUser();
    if (userErr || !userResp.user) return json({ error: "Not authenticated" }, 401);
    const user = userResp.user;

    const body = (await req.json()) as Body;
    if (!body.imageBase64) return json({ error: "Bild fehlt" }, 400);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI gateway nicht konfiguriert" }, 500);

    let originalContext = "Kein Original-Arbeitsblatt verfügbar — bewerte plausibel anhand der sichtbaren Aufgaben.";
    let originalTitle = "Korrektur";
    if (body.worksheetId) {
      const { data: ws } = await supa
        .from("worksheets")
        .select("title, niveau, content")
        .eq("id", body.worksheetId)
        .maybeSingle();
      if (ws) {
        originalTitle = ws.title;
        const exercises = (ws as any).content?.exercises ?? [];
        originalContext =
          `Titel: ${ws.title} · Niveau: ${ws.niveau}\n\nLösungsschlüssel:\n` +
          exercises
            .map((e: any, i: number) => `${i + 1}. [${e.type}] ${e.instruction}\nLösung: ${e.solution}`)
            .join("\n\n");
      }
    }

    const userPromptText =
      `Du bist ein DaF/DaZ-Lehrer und korrigierst dieses Arbeitsblatt. ` +
      `Vergleiche die Schülerantworten mit dem Lösungsschlüssel des Original-Arbeitsblatts (ID: ${body.worksheetId ?? "unbekannt"}). ` +
      `Gib zurück: Gesamtpunktzahl, Punkte pro Aufgabe, falsche Antworten mit Korrektur, deutsche Schulnote (1–6). Antwort als JSON.\n\n` +
      `ORIGINAL:\n${originalContext}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content:
              "Du bist eine erfahrene DaF/DaZ-Lehrkraft und korrigierst handschriftlich ausgefüllte Arbeitsblätter. " +
              "Du bist fair, präzise und deutsch-sprachig. Antworte ausschließlich über den Tool-Call.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: userPromptText },
              { type: "image_url", image_url: { url: body.imageBase64 } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_correction",
              description: "Bewerteter Korrekturbericht.",
              parameters: {
                type: "object",
                properties: {
                  total_score: { type: "number" },
                  max_score: { type: "number" },
                  grade: { type: "number", description: "Deutsche Schulnote 1–6" },
                  exercises: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        number: { type: "number" },
                        title: { type: "string" },
                        score: { type: "number" },
                        max: { type: "number" },
                        wrong_answers: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              student: { type: "string" },
                              correct: { type: "string" },
                              note: { type: "string" },
                            },
                            required: ["student", "correct"],
                          },
                        },
                      },
                      required: ["number", "score", "max"],
                    },
                  },
                  summary: { type: "string", description: "1–2 Sätze Gesamteindruck." },
                },
                required: ["total_score", "max_score", "grade", "exercises"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_correction" } },
      }),
    });

    if (aiRes.status === 429) return json({ error: "Zu viele Anfragen — bitte gleich nochmal versuchen." }, 429);
    if (aiRes.status === 402) return json({ error: "AI-Guthaben aufgebraucht. Bitte aufladen." }, 402);
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI gateway error", aiRes.status, t);
      return json({ error: "AI-Korrektur fehlgeschlagen" }, 500);
    }

    const aiJson = await aiRes.json();
    const toolArgs = aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!toolArgs) return json({ error: "AI-Antwort unvollständig" }, 502);
    const parsed = typeof toolArgs === "string" ? JSON.parse(toolArgs) : toolArgs;

    const { data: inserted, error: insErr } = await supa
      .from("corrections")
      .insert({
        user_id: user.id,
        worksheet_id: body.worksheetId ?? null,
        student_name: body.studentName ?? null,
        score: parsed.total_score ?? 0,
        max_score: parsed.max_score ?? 0,
        grade: parsed.grade ?? null,
        exercise_breakdown: { exercises: parsed.exercises ?? [], summary: parsed.summary ?? null, title: originalTitle },
        image_path: body.imagePath ?? null,
      })
      .select("id")
      .single();
    if (insErr || !inserted) {
      console.error("insert correction err", insErr);
      return json({ error: "Speichern fehlgeschlagen" }, 500);
    }

    return json({ id: inserted.id, ...parsed, title: originalTitle });
  } catch (e) {
    console.error("correct-worksheet error", e);
    return json({ error: e instanceof Error ? e.message : "Unbekannter Fehler" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
