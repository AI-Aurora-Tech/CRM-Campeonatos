import React, { useEffect, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { Club } from '../types';
import { rowToInvoice, rowToPayment, type InvoiceRow, type PaymentRow } from '../api/invoiceMappers';
import type { Invoice, Payment } from '../types';

type Props = {
  supabase: SupabaseClient | null;
  session: Session | null;
  clubs: Club[];
  championshipId: string;
};

export function FinancialDashboardView({ supabase, session, clubs, championshipId }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !session) {
      setInvoices([]);
      setPayments([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: inv, error: invErr } = await supabase
          .from('invoices')
          .select('*')
          .eq('championship_id', championshipId);
        if (invErr) throw invErr;
        if (cancelled) return;
        setInvoices((inv as InvoiceRow[]).map(rowToInvoice));

        const ids = (inv as InvoiceRow[]).map((i) => i.id);
        if (ids.length === 0) {
          setPayments([]);
          return;
        }
        const { data: pay, error: payErr } = await supabase.from('payments').select('*').in('invoice_id', ids);
        if (payErr) throw payErr;
        if (!cancelled) setPayments((pay as PaymentRow[]).map(rowToPayment));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, session, championshipId]);

  if (!supabase || !session) {
    return (
      <div className="card-utility p-8 max-w-lg">
        <h2 className="text-lg font-bold text-primary mb-2">Financeiro</h2>
        <p className="text-sm text-text-muted">
          Faça login na barra lateral para ver faturas e pagamentos sincronizados com o Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-primary">Financeiro & inscrições</h2>
        <p className="text-sm text-text-muted mt-1">
          Extrato por campeonato. Webhooks Pix são processados pela Edge Function{' '}
          <code className="text-xs bg-neutral-100 px-1 rounded">pix-webhook</code>.
        </p>
      </div>

      {loading && <p className="text-sm text-text-muted">Carregando…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="card-utility overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border font-bold text-sm">Faturas</div>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-[11px] uppercase text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">Clube</th>
              <th className="text-left px-4 py-2">Descrição</th>
              <th className="text-right px-4 py-2">Valor</th>
              <th className="text-left px-4 py-2">Vencimento</th>
              <th className="text-left px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {invoices.map((inv) => {
              const club = clubs.find((c) => c.id === inv.clubId);
              return (
                <tr key={inv.id}>
                  <td className="px-4 py-3 font-medium">{club?.shortName ?? inv.clubId}</td>
                  <td className="px-4 py-3 text-text-muted">{inv.description}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    R$ {(inv.amountCents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">{inv.dueDate}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-neutral-100">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {invoices.length === 0 && !loading && (
          <p className="p-6 text-sm text-text-muted">Nenhuma fatura para este campeonato.</p>
        )}
      </div>

      <div className="card-utility overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border font-bold text-sm">Pagamentos registrados</div>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-[11px] uppercase text-text-muted">
            <tr>
              <th className="text-left px-4 py-2">ID fatura</th>
              <th className="text-left px-4 py-2">Método</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Externo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-mono text-xs">{p.invoiceId}</td>
                <td className="px-4 py-3">{p.method}</td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.externalId ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && !loading && (
          <p className="p-6 text-sm text-text-muted">Nenhum pagamento ainda.</p>
        )}
      </div>
    </div>
  );
}
