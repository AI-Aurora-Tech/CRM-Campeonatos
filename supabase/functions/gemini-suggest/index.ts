import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as { kind?: string; standings?: unknown };
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          suggestion:
            'IA não configurada (GEMINI_API_KEY). Sugestão local: analise a tabela manualmente e priorize confrontos diretos entre os dois primeiros colocados.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `Você é analista de futebol amador. Responda em português em até 4 frases. Contexto: ${body.kind ?? 'insight'}. Dados da tabela (JSON): ${JSON.stringify(body.standings ?? []).slice(0, 8000)}`;

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      return new Response(JSON.stringify({ suggestion: `Erro Gemini: ${res.status} ${t}` }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text =
      json.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ??
      'Sem texto retornado pelo modelo.';

    const url = Deno.env.get('SUPABASE_URL');
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (url && service) {
      const admin = createClient(url, service);
      const bodyFull = body as { matchId?: string };
      await admin.from('ai_suggestions').insert({
        match_id: bodyFull.matchId ?? null,
        kind: body.kind ?? 'standings_insight',
        content: text.slice(0, 12000),
        applied: false,
      });
    }

    return new Response(JSON.stringify({ suggestion: text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
