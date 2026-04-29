import "server-only";

import { revalidatePath } from "next/cache";

import { mapMidtransTransactionStatus } from "@/lib/payment-status";
import { ensureTicketForBooking } from "@/lib/ticket";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { MidtransTransactionStatusResponse } from "@/lib/midtrans";
import type { Database, Json } from "@/types/database";

type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];

function pickPaidAt(status: MidtransTransactionStatusResponse) {
  return status.settlement_time ?? status.transaction_time ?? new Date().toISOString();
}

function pickExpiredAt(status: MidtransTransactionStatusResponse) {
  return status.expiry_time ?? null;
}

export async function applyMidtransStatusToPayment({
  orderId,
  statusResponse,
  eventType,
  logPayload,
}: {
  orderId: string;
  statusResponse: MidtransTransactionStatusResponse;
  eventType: string;
  logPayload?: unknown;
}) {
  const supabase = getSupabaseAdmin();
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (paymentError) {
    throw new Error(paymentError.message);
  }

  if (!payment) {
    throw new Error("Payment record was not found for this Midtrans order.");
  }

  const mapped = mapMidtransTransactionStatus(
    statusResponse.transaction_status,
    statusResponse.fraud_status,
  );

  const paymentPatch: Partial<PaymentRow> = {
    payment_type: statusResponse.payment_type ?? null,
    transaction_id: statusResponse.transaction_id ?? null,
    transaction_status: statusResponse.transaction_status ?? "pending",
    fraud_status: statusResponse.fraud_status ?? null,
    payment_status: mapped.paymentStatus,
    raw_response: statusResponse as Json,
    paid_at: mapped.shouldIssueTicket ? pickPaidAt(statusResponse) : payment.paid_at,
    expired_at: statusResponse.transaction_status === "expire" ? pickExpiredAt(statusResponse) : payment.expired_at,
  };

  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update(paymentPatch)
    .eq("id", payment.id);

  if (updatePaymentError) {
    throw new Error(updatePaymentError.message);
  }

  const { error: updateBookingError } = await supabase
    .from("bookings")
    .update({ booking_status: mapped.bookingStatus })
    .eq("id", payment.booking_id);

  if (updateBookingError) {
    throw new Error(updateBookingError.message);
  }

  await supabase.from("payment_logs").insert({
    payment_id: payment.id,
    order_id: orderId,
    event_type: eventType,
    transaction_status: statusResponse.transaction_status ?? "pending",
    payload: (logPayload ?? statusResponse) as Json,
  });

  if (mapped.shouldIssueTicket) {
    await ensureTicketForBooking(payment.booking_id);
  }

  revalidatePath(`/payment/${orderId}`);
  revalidatePath("/dashboard/bookings");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/payments");

  return {
    paymentId: payment.id,
    bookingId: payment.booking_id,
    ...mapped,
  };
}
