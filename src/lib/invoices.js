import { supabase } from './supabase';
import { requireUser } from './session';

export async function listInvoices() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('invoices')
    .select(
      `id, owner_id, customer_id, invoice_number, issue_date, due_date, status, notes, created_at,
       customer:customers!invoices_customer_id_fkey(id, name, phone),
       payments:payments(amount, payment_date),
       invoice_items(id, description, line_total)`
    )
    .eq('owner_id', user.id)
    .order('issue_date', { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listInvoiceSummaries() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, customer_id, issue_date, status')
    .eq('owner_id', user.id)
    .order('issue_date', { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function nextInvoiceNumber() {
  const invoices = await listInvoiceSummaries();
  const prefix = 'INV-';
  const numbers = invoices
    .map((invoice) => {
      if (!invoice.invoice_number?.startsWith(prefix)) return 0;
      const num = Number.parseInt(invoice.invoice_number.slice(prefix.length), 10);
      return Number.isFinite(num) ? num : 0;
    })
    .filter((n) => n > 0);

  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

export async function createInvoice(payload) {
  const user = await requireUser();
  const invoicePayload = {
    owner_id: user.id,
    invoice_number: payload.invoiceNumber,
    customer_id: payload.customerId,
    issue_date: payload.issueDate,
    due_date: payload.dueDate ?? null,
    status: payload.status ?? 'Draft',
    notes: payload.notes ?? null,
  };

  const { data, error } = await supabase
    .from('invoices')
    .insert(invoicePayload)
    .select('id, invoice_number, issue_date, due_date, status, notes, customer_id')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function listInvoiceItems(invoiceId) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('invoice_items')
    .select('id, description, quantity, unit, unit_price, line_total, product_id')
    .eq('invoice_id', invoiceId)
    .order('id');

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function addInvoiceItem(invoiceId, payload) {
  const insertPayload = {
    invoice_id: invoiceId,
    description: payload.description,
    quantity: payload.quantity ?? 1,
    unit: payload.unit ?? '',
    unit_price: payload.unitPrice ?? payload.lineTotal ?? 0,
    line_total: payload.lineTotal ?? (payload.quantity ?? 1) * (payload.unitPrice ?? 0),
    product_id: payload.productId ?? null,
  };

  const { data, error } = await supabase
    .from('invoice_items')
    .insert(insertPayload)
    .select('id, description, quantity, unit, unit_price, line_total, product_id')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
