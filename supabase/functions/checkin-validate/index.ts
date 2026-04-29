import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

async function sha256Hex(message: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { matchId, playerId, token } = (await req.json()) as {
      matchId?: string;
      playerId?: string;
      token?: string;
    };
    if (!matchId || !playerId || !token) {
      return new Response(JSON.stringify({ error: 'matchId, playerId e token são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const secret = Deno.env.get('CHECKIN_HMAC_SECRET') ?? 'dev-checkin-secret';
    const expected = await sha256Hex(`${matchId}:${playerId}:${secret}`);
    if (expected !== token) {
      return new Response(JSON.stringify({ error: 'token inválido' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = Deno.env.get('SUPABASE_URL');
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !service) {
      return new Response(JSON.stringify({ error: 'service env' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(url, service);
    const { error } = await admin.from('match_roster').insert({
      match_id: matchId,
      player_id: playerId,
      method: 'QR',
    });

    if (error && (error as { code?: string }).code !== '23505') {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
