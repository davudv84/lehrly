-- =========================================================================
-- WORKSHEETS
-- =========================================================================
CREATE TABLE public.worksheets (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  niveau TEXT NOT NULL,
  topic TEXT,
  task_types TEXT[] NOT NULL DEFAULT '{}',
  task_count INT NOT NULL DEFAULT 6,
  has_solution BOOLEAN NOT NULL DEFAULT true,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  preview_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_worksheets_user_created ON public.worksheets (user_id, created_at DESC);
ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Worksheets: select own" ON public.worksheets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Worksheets: insert own" ON public.worksheets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Worksheets: update own" ON public.worksheets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Worksheets: delete own" ON public.worksheets FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_worksheets_updated_at
  BEFORE UPDATE ON public.worksheets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- TEMPLATES
-- =========================================================================
CREATE TABLE public.templates (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  niveau TEXT NOT NULL,
  topic TEXT,
  task_types TEXT[] NOT NULL DEFAULT '{}',
  task_count INT NOT NULL DEFAULT 6,
  is_new BOOLEAN NOT NULL DEFAULT false,
  usage_count INT NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_templates_user_created ON public.templates (user_id, created_at DESC);
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates: select own" ON public.templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Templates: insert own" ON public.templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Templates: update own" ON public.templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Templates: delete own" ON public.templates FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- COLLECTIONS
-- =========================================================================
CREATE TABLE public.collections (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'library',
  color TEXT NOT NULL DEFAULT 'brand',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_collections_user ON public.collections (user_id, created_at);
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collections: select own" ON public.collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Collections: insert own" ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Collections: update own" ON public.collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Collections: delete own" ON public.collections FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- COLLECTION ⇄ WORKSHEET
-- =========================================================================
CREATE TABLE public.collection_worksheets (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  worksheet_id UUID NOT NULL REFERENCES public.worksheets(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, worksheet_id)
);
ALTER TABLE public.collection_worksheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CW: select if owns collection"
  ON public.collection_worksheets FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid()));
CREATE POLICY "CW: insert if owns both"
  ON public.collection_worksheets FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.worksheets w WHERE w.id = worksheet_id AND w.user_id = auth.uid())
  );
CREATE POLICY "CW: delete if owns collection"
  ON public.collection_worksheets FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid()));

-- =========================================================================
-- DEMO SEED FUNCTION
-- Idempotent: only seeds when the user has zero worksheets.
-- =========================================================================
CREATE OR REPLACE FUNCTION public.seed_demo_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  ws_einkaufen UUID;
  ws_modalverben UUID;
  ws_familie UUID;
  ws_schreibaufgabe UUID;
  ws_zap UUID;
  ws_konjunktiv UUID;
  col_alle UUID;
  col_fav UUID;
  col_woche UUID;
  col_a2 UUID;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Skip if any content already exists for this user
  IF EXISTS (SELECT 1 FROM public.worksheets WHERE user_id = uid) THEN
    RETURN;
  END IF;

  -- Worksheets
  INSERT INTO public.worksheets (user_id, title, niveau, topic, task_types, task_count, has_solution, is_favorite, created_at)
  VALUES (uid, 'A2 Wortschatz Einkaufen', 'A2', 'Einkaufen', ARRAY['Lückentext','Wortschatz'], 6, true, true, now() - interval '2 hours')
  RETURNING id INTO ws_einkaufen;

  INSERT INTO public.worksheets (user_id, title, niveau, topic, task_types, task_count, has_solution, created_at)
  VALUES (uid, 'B1 Grammatik Modalverben', 'B1', 'Grammatik', ARRAY['Multiple Choice','Lückentext'], 8, true, now() - interval '1 day')
  RETURNING id INTO ws_modalverben;

  INSERT INTO public.worksheets (user_id, title, niveau, topic, task_types, task_count, created_at)
  VALUES (uid, 'A1 Lückentext Familie', 'A1', 'Familie', ARRAY['Lückentext'], 5, now() - interval '3 days')
  RETURNING id INTO ws_familie;

  INSERT INTO public.worksheets (user_id, title, niveau, topic, task_types, task_count, created_at)
  VALUES (uid, 'C1 Schreibaufgabe Diskussion', 'C1', 'Politik', ARRAY['Schreibaufgabe'], 3, now() - interval '5 days')
  RETURNING id INTO ws_schreibaufgabe;

  INSERT INTO public.worksheets (user_id, title, niveau, topic, task_types, task_count, created_at)
  VALUES (uid, 'A1 Zahlen 1–20', 'A1', 'Zahlen', ARRAY['Wortschatz','Lückentext'], 6, now() - interval '7 days')
  RETURNING id INTO ws_zap;

  INSERT INTO public.worksheets (user_id, title, niveau, topic, task_types, task_count, created_at)
  VALUES (uid, 'B1 Grammatik Konjunktiv II', 'B1', 'Grammatik', ARRAY['Multiple Choice'], 7, now() - interval '1 day')
  RETURNING id INTO ws_konjunktiv;

  -- Templates
  INSERT INTO public.templates (user_id, title, niveau, topic, task_types, task_count, usage_count, last_used_at)
  VALUES (uid, 'A2 Wortschatz Wochenplan', 'A2', 'Einkaufen', ARRAY['Lückentext'], 6, 12, now() - interval '4 hours');

  INSERT INTO public.templates (user_id, title, niveau, topic, task_types, task_count, usage_count, last_used_at)
  VALUES (uid, 'B1 Grammatik Einheit', 'B1', 'Arbeit', ARRAY['Grammatik','Multiple Choice'], 8, 8, now() - interval '3 days');

  INSERT INTO public.templates (user_id, title, niveau, topic, task_types, task_count, usage_count)
  VALUES (uid, 'A1 Lückentext Familie', 'A1', 'Familie', ARRAY['Lückentext'], 5, 5);

  INSERT INTO public.templates (user_id, title, niveau, topic, task_types, task_count, is_new, usage_count)
  VALUES (uid, 'C1 Schreibaufgabe Diskussion', 'C1', 'Politik', ARRAY['Schreibaufgabe'], 3, true, 3);

  -- Collections
  INSERT INTO public.collections (user_id, title, icon, color)
  VALUES (uid, 'Alle', 'library', 'muted') RETURNING id INTO col_alle;

  INSERT INTO public.collections (user_id, title, icon, color)
  VALUES (uid, 'Favoriten', 'star', 'amber') RETURNING id INTO col_fav;

  INSERT INTO public.collections (user_id, title, icon, color)
  VALUES (uid, 'Diese Woche', 'calendar', 'brand') RETURNING id INTO col_woche;

  INSERT INTO public.collections (user_id, title, icon, color)
  VALUES (uid, 'A2', 'folder', 'brand') RETURNING id INTO col_a2;

  -- Collection memberships
  INSERT INTO public.collection_worksheets (collection_id, worksheet_id) VALUES
    (col_alle, ws_einkaufen), (col_alle, ws_modalverben), (col_alle, ws_familie),
    (col_alle, ws_schreibaufgabe), (col_alle, ws_zap), (col_alle, ws_konjunktiv),
    (col_fav, ws_einkaufen),
    (col_woche, ws_einkaufen), (col_woche, ws_modalverben), (col_woche, ws_konjunktiv),
    (col_a2, ws_einkaufen), (col_a2, ws_zap);
END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_demo_content() TO authenticated;