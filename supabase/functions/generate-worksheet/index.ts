// Generate a German DaF/DaZ worksheet via Lovable AI Gateway and persist it.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_NIVEAU = ["A1", "A2", "B1", "B2", "C1"] as const;
const ALLOWED_TYPES = [
  "Lückentext",
  "Multiple Choice",
  "Zuordnung",
  "Grammatik",
  "Schreibaufgabe",
  "Wortschatz",
];

type Body = {
  niveau: string;
  topics: string[];
  taskTypes: string[];
  count: number;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supa = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userResp, error: userErr } = await supa.auth.getUser();
    if (userErr || !userResp.user) {
      return json({ error: "Not authenticated" }, 401);
    }
    const user = userResp.user;

    const raw = (await req.json()) as Partial<Body>;
    const niveau = String(raw.niveau ?? "");
    const topics = Array.isArray(raw.topics) ? raw.topics.filter(Boolean) : [];
    const taskTypes = Array.isArray(raw.taskTypes)
      ? raw.taskTypes.filter((t) => ALLOWED_TYPES.includes(String(t)))
      : [];
    const count = Math.max(3, Math.min(15, Number(raw.count) || 6));

    if (!ALLOWED_NIVEAU.includes(niveau as any)) {
      return json({ error: "Ungültiges Sprachniveau" }, 400);
    }
    if (taskTypes.length === 0) {
      return json({ error: "Mindestens ein Aufgabentyp erforderlich" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return json({ error: "AI gateway nicht konfiguriert" }, 500);
    }

    const topicLine = topics.length ? topics.join(", ") : "frei wählbar";
    const systemPrompt =
      "Du bist eine erfahrene Lehrkraft für Deutsch als Fremdsprache (DaF/DaZ). " +
      "Du erstellst didaktisch sinnvolle, korrekte und motivierende Arbeitsblätter. " +
      "Antworte ausschließlich über den bereitgestellten Tool-Call.";
    const userPrompt =
      `Erstelle ein Arbeitsblatt für DaF/DaZ.\n` +
      `Sprachniveau: ${niveau}\n` +
      `Thema/Themen: ${topicLine}\n` +
      `Erlaubte Aufgabentypen: ${taskTypes.join(", ")}\n` +
      `Anzahl Aufgaben: genau ${count}\n` +
      `Wichtig: jeder Eintrag muss Anweisung, Aufgaben-Inhalt und Lösung haben.`;

    const aiRes = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_worksheet",
                description:
                  "Liefert das vollständige Arbeitsblatt als strukturierte Daten.",
                parameters: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description:
                        "Kurzer prägnanter Titel z. B. 'A2 Wortschatz Einkaufen'.",
                    },
                    competencies: {
                      type: "array",
                      description:
                        "1–3 trainierte Kompetenzen aus: Lesen, Schreiben, Hören, Sprechen, Wortschatz, Grammatik.",
                      items: {
                        type: "string",
                        enum: [
                          "Lesen",
                          "Schreiben",
                          "Hören",
                          "Sprechen",
                          "Wortschatz",
                          "Grammatik",
                        ],
                      },
                    },
                    duration_min: {
                      type: "number",
                      description: "Geschätzte Bearbeitungszeit in Minuten (10–60).",
                    },
                    exercises: {
                      type: "array",
                      minItems: count,
                      maxItems: count,
                      items: {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: taskTypes },
                          instruction: {
                            type: "string",
                            description: "Klare, kurze Aufgabenanweisung auf Deutsch.",
                          },
                          content: {
                            type: "string",
                            description:
                              "Aufgabentext. Bei Lückentext: Lücken als '_____' (5 Unterstriche). Bei Multiple Choice: Stamm + 'a) …\\nb) …\\nc) …' in neuen Zeilen. Bei Zuordnung/Wortschatz: ein Eintrag pro Zeile.",
                          },
                          solution: { type: "string" },
                        },
                        required: ["type", "instruction", "content", "solution"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["title", "exercises", "competencies", "duration_min"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "create_worksheet" },
          },
        }),
      },
    );

    if (aiRes.status === 429) {
      return json(
        { error: "Zu viele Anfragen — bitte gleich nochmal versuchen." },
        429,
      );
    }
    if (aiRes.status === 402) {
      return json(
        {
          error:
            "AI-Guthaben aufgebraucht. Bitte in Lovable Cloud → Workspace → Usage aufladen.",
        },
        402,
      );
    }
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI gateway error", aiRes.status, t);
      return json({ error: "AI-Generator fehlgeschlagen" }, 500);
    }

    const aiJson = await aiRes.json();
    const toolCall =
      aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!toolCall) {
      console.error("Missing tool call in AI response", JSON.stringify(aiJson));
      return json({ error: "Antwort des AI-Modells unvollständig" }, 502);
    }

    let parsed: { title: string; exercises: Array<Record<string, string>> };
    try {
      parsed = typeof toolCall === "string" ? JSON.parse(toolCall) : toolCall;
    } catch {
      return json({ error: "AI-Antwort konnte nicht gelesen werden" }, 502);
    }

    const title = parsed.title?.trim() || `${niveau} ${topics[0] ?? "Arbeitsblatt"}`;
    const exercises = (parsed.exercises ?? []).slice(0, count);

    const { data: inserted, error: insertErr } = await supa
      .from("worksheets")
      .insert({
        user_id: user.id,
        title,
        niveau,
        topic: topics[0] ?? null,
        task_types: taskTypes,
        task_count: exercises.length,
        has_solution: true,
        content: { title, exercises },
      })
      .select("id")
      .single();

    if (insertErr || !inserted) {
      console.error("Insert error", insertErr);
      return json({ error: "Speichern fehlgeschlagen" }, 500);
    }

    return json({ id: inserted.id, title, exercises });
  } catch (e) {
    console.error("generate-worksheet error", e);
    return json(
      { error: e instanceof Error ? e.message : "Unbekannter Fehler" },
      500,
    );
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
