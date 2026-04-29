import "server-only";

import { notFound } from "next/navigation";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { buildTicketQrPayload, generateQrCodeDataUrl } from "@/lib/qrcode";
import { isSuccessfulPaymentStatus } from "@/lib/payment-status";
import type { Booking, Payment, Ticket } from "@/types";

export type TicketBundle = {
  booking: Booking;
  payment: Payment | null;
  ticket: Ticket | null;
  qrCodeDataUrl: string | null;
};

export async function ensureTicketForBooking(bookingId: string) {
  const supabase = getSupabaseAdmin();
  const { data: existing, error: existingError } = await supabase
    .from("tickets")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    return existing as Ticket;
  }

  const { data, error } = await supabase
    .from("tickets")
    .insert({ booking_id: bookingId })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Ticket;
}

export async function getTicketBundleByBookingCode({
  bookingCode,
  userId,
  isAdmin = false,
}: {
  bookingCode: string;
  userId?: string;
  isAdmin?: boolean;
}): Promise<TicketBundle> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      travel_packages(
        id,
        name,
        slug,
        main_image_url,
        price,
        discount_price,
        quota,
        destinations(name, slug, province, city)
      ),
      payments(*),
      tickets(*)
    `,
    )
    .eq("booking_code", bookingCode)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  const booking = data as unknown as Booking;

  if (!isAdmin && booking.user_id !== userId) {
    notFound();
  }

  const payments = [...(booking.payments ?? [])].sort((a, b) =>
    String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")),
  );
  const payment = payments[0] ?? null;

  let ticket = booking.tickets?.[0] ?? null;
  if (
    !ticket &&
    booking.booking_status === "paid" &&
    isSuccessfulPaymentStatus(payment?.payment_status)
  ) {
    ticket = await ensureTicketForBooking(booking.id);
  }

  const qrCodeDataUrl =
    ticket && booking.travel_packages
      ? await generateQrCodeDataUrl(
          buildTicketQrPayload({
            ticket_code: ticket.ticket_code,
            booking_code: booking.booking_code,
            package_name: booking.travel_packages.name,
            departure_date: booking.departure_date,
          }),
        )
      : null;

  return {
    booking,
    payment,
    ticket,
    qrCodeDataUrl,
  };
}

export function assertTicketIsPrintable(bundle: TicketBundle) {
  if (
    !bundle.ticket ||
    bundle.ticket.ticket_status !== "active" ||
    !bundle.payment ||
    !isSuccessfulPaymentStatus(bundle.payment.payment_status) ||
    !["paid", "confirmed", "completed"].includes(bundle.booking.booking_status)
  ) {
    throw new Error("Tiket hanya tersedia setelah pembayaran berhasil.");
  }
}
