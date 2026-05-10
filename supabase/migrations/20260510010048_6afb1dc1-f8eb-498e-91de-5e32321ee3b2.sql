
-- corrections
CREATE TABLE public.corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  worksheet_id UUID REFERENCES public.worksheets(id) ON DELETE SET NULL,
  student_name TEXT,
  score NUMERIC NOT NULL DEFAULT 0,
  max_score NUMERIC NOT NULL DEFAULT 0,
  grade NUMERIC,
  exercise_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Corrections: select own" ON public.corrections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Corrections: insert own" ON public.corrections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Corrections: update own" ON public.corrections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Corrections: delete own" ON public.corrections FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_corrections_updated_at BEFORE UPDATE ON public.corrections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- klassenbuch_entries
CREATE TABLE public.klassenbuch_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  worksheet_id UUID NOT NULL REFERENCES public.worksheets(id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  homework TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.klassenbuch_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "KB: select own" ON public.klassenbuch_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "KB: insert own" ON public.klassenbuch_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "KB: update own" ON public.klassenbuch_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "KB: delete own" ON public.klassenbuch_entries FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_kb_updated_at BEFORE UPDATE ON public.klassenbuch_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('correction-uploads', 'correction-uploads', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "correction-uploads: select own" ON storage.objects FOR SELECT
  USING (bucket_id = 'correction-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "correction-uploads: insert own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'correction-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "correction-uploads: delete own" ON storage.objects FOR DELETE
  USING (bucket_id = 'correction-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
