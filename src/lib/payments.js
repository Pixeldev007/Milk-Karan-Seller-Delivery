import { supabase } from './supabase';
import { requireUser } from './session';

export async function listPayments() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('payments')
    .select(
      `id, amount, payment_date, mode, invoice_id,
       invoice:invoices(id, invoice_number),
       customer:customers(id, name)`
    )
    .eq('owner_id', user.id)
    .order('payment_date', { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createPayment(payload) {
  const user = await requireUser();
  const insertPayload = {
    owner_id: user.id,
    customer_id: payload.customerId,
    invoice_id: payload.invoiceId ?? null,
    amount: payload.amount,
    payment_date: payload.date,
    mode: payload.mode,
  };

  const { data, error } = await supabase
    .from('payments')
    .insert(insertPayload)
    .select('id, amount, payment_date, mode, invoice_id, customer_id')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
