import type { Invoice, Payment } from '../types';

export interface InvoiceRow {
  id: string;
  organization_id: string;
  club_id: string;
  championship_id: string | null;
  amount_cents: number;
  description: string;
  due_date: string;
  status: Invoice['status'];
}

export interface PaymentRow {
  id: string;
  invoice_id: string;
  external_id: string | null;
  status: Payment['status'];
  method: string;
  raw: Record<string, unknown> | null;
}

export function rowToInvoice(r: InvoiceRow): Invoice {
  return {
    id: r.id,
    clubId: r.club_id,
    championshipId: r.championship_id ?? undefined,
    amountCents: r.amount_cents,
    description: r.description,
    dueDate: r.due_date,
    status: r.status,
  };
}

export function rowToPayment(r: PaymentRow): Payment {
  return {
    id: r.id,
    invoiceId: r.invoice_id,
    externalId: r.external_id ?? undefined,
    status: r.status,
    method: r.method,
  };
}
