"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireUser } from "@/lib/auth";
import { getTransactionStatus } from "@/lib/midtrans";
import { applyMidtransStatusToPayment } from "@/lib/payment";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function syncPaymentStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const orderId = String(formData.get("order_id") ?? "");

  if (!orderId) {
    throw new Error("Order ID tidak valid.");
  }

  const statusResponse = await getTransactionStatus(orderId);
  await applyMidtransStatusToPayment({
    orderId,
    statusResponse,
    eventType: "admin_status_check",
  });

  revalidatePath("/admin/payments");
  revalidatePath("/admin/bookings");
}

export async function cancelBookingAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const bookingId = String(formData.get("booking_id") ?? "");

  if (!bookingId) {
    throw new Error("Booking tidak valid.");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("bookings")
    .update({ booking_status: "cancelled" })
    .eq("id", bookingId);

  if (error) {
    throw new Error(error.message);
  }

  await supabase
    .from("tickets")
    .update({ ticket_status: "cancelled" })
    .eq("booking_id", bookingId);

  revalidatePath("/admin/bookings");
  revalidatePath("/dashboard/bookings");
}

export async function assertCustomerSessionAction() {
  await requireUser();
}
