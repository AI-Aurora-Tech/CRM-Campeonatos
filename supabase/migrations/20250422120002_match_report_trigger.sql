-- Garante linha de súmula para cada jogo novo (homologação e match_reports ficam alinhados)

CREATE OR REPLACE FUNCTION public.ensure_match_report_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.match_reports (id, match_id, state)
  VALUES (gen_random_uuid()::text, NEW.id, 'DRAFT')
  ON CONFLICT (match_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_match_report_row
AFTER INSERT ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.ensure_match_report_row();
