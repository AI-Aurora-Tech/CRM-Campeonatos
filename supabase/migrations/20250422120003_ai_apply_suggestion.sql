-- Aplica sugestão de IA após revisão humana (não altera disciplina automaticamente)

CREATE OR REPLACE FUNCTION public.apply_ai_suggestion(p_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ai_suggestions
  SET reviewed_by = auth.uid(), reviewed_at = now(), applied = true
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_ai_suggestion(text) TO authenticated;
