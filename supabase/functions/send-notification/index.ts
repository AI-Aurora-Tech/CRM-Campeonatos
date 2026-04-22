import { corsHeaders } from '../_shared/cors.ts';

/** Enfileira / simula envio — conecte Resend/SendGrid aqui com RESEND_API_KEY. */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      subject?: string;
      to?: string;
      batch?: boolean;
    };

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey && body.to && body.subject) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'CRM Campeonatos <onboarding@resend.dev>',
          to: body.to,
          subject: body.subject,
          html: '<p>Notificação enviada pelo CRM Campeonatos.</p>',
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true, delivered: Boolean(resendKey) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
