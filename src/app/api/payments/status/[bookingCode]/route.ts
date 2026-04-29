import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getTransactionStatus } from "@/lib/midtrans";
import { applyMidtransStatusToPayment } from "@/lib/payment";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookingCode: string }> },
) {
  const { bookingCode } = await params;
  const session = await getCurrentUser();

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.profile?.role === "admin" && session.profile.status === "active";
  const supabase = getSupabaseAdmin();
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("*, payments(*)")
    .eq("booking_code", bookingCode)
    .maybeSingle();

  if (bookingError) {
    return NextResponse.json({ message: bookingError.message }, { status: 500 });
  }

  if (!booking || (!isAdmin && booking.user_id !== session.user.id)) {
    return NextResponse.json({ message: "Booking tidak ditemukan." }, { status: 404 });
  }

  const rawPayments = (booking as unknown as { payments?: Array<{ order_id: string; created_at?: string }> }).payments ?? [];
  const payments = [...rawPayments].sort((a, b) =>
    String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")),
  );
  const payment = payments[0];

  if (!payment?.order_id) {
    return NextResponse.json({
      booking_code: booking.booking_code,
      booking_status: booking.booking_status,
      payment_status: "pending",
      redirect_to: `/payment/${booking.booking_code}`,
    });
  }

  try {
    const statusResponse = await getTransactionStatus(payment.order_id);
    const result = await applyMidtransStatusToPayment({
      orderId: payment.order_id,
      statusResponse,
      eventType: "manual_status_check",
    });

    const redirectTo =
      result.bookingStatus === "paid"
        ? `/payment/success/${booking.booking_code}`
        : result.bookingStatus === "expired" || result.bookingStatus === "cancelled"
          ? `/payment/failed/${booking.booking_code}`
          : `/payment/pending/${booking.booking_code}`;

    return NextResponse.json({
      booking_code: booking.booking_code,
      booking_status: result.bookingStatus,
      payment_status: result.paymentStatus,
      order_id: payment.order_id,
      redirect_to: redirectTo,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengecek status pembayaran.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
