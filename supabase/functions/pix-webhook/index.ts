import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const secret = Deno.env.get('PAYMENT_WEBHOOK_SECRET');
  const sig = req.headers.get('x-webhook-secret') ?? '';

  try {
    const payload = await req.json().catch(() => ({}));
    if (secret && sig !== secret) {
      return new Response(JSON.stringify({ error: 'invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = Deno.env.get('SUPABASE_URL');
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !service) {
      return new Response(JSON.stringify({ error: 'missing service env' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(url, service);
    const externalId = (payload as { paymentId?: string }).paymentId ?? `ext-${crypto.randomUUID()}`;
    const invoiceId = (payload as { invoiceId?: string }).invoiceId;

    if (invoiceId) {
      const { data: inv } = await admin.from('invoices').select('id, club_id').eq('id', invoiceId).maybeSingle();
      if (inv) {
        await admin.from('payments').insert({
          invoice_id: invoiceId,
          external_id: externalId,
          status: 'CONFIRMED',
          method: 'PIX',
          raw: payload as Record<string, unknown>,
        });
        await admin.from('invoices').update({ status: 'PAID' }).eq('id', invoiceId);
        const clubId = (inv as { club_id: string }).club_id;
        await admin.from('clubs').update({ has_pending_finance: false }).eq('id', clubId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
