import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { createSnapTransaction } from "@/lib/midtrans";
import { getSiteUrl } from "@/lib/supabase/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createPaymentSchema = z.object({
  booking_id: z.string().uuid(),
});

function formatMidtransExpiryStart(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} +0700`;
}

export async function POST(request: Request) {
  const session = await getCurrentUser();

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = createPaymentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Payload tidak valid." }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(
      `
      *,
      travel_packages(id, name, slug, price, discount_price, quota)
    `,
    )
    .eq("id", parsed.data.booking_id)
    .maybeSingle();

  if (bookingError) {
    return NextResponse.json({ message: bookingError.message }, { status: 500 });
  }

  if (!booking || booking.user_id !== session.user.id) {
    return NextResponse.json({ message: "Booking tidak ditemukan." }, { status: 404 });
  }

  if (booking.booking_status !== "pending_payment") {
    return NextResponse.json({ message: "Booking ini tidak menunggu pembayaran." }, { status: 409 });
  }

  const existingPayment = await supabase
    .from("payments")
    .select("*")
    .eq("booking_id", booking.id)
    .eq("payment_status", "pending")
    .not("snap_token", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (
    existingPayment.data?.snap_token &&
    (!existingPayment.data.expired_at || new Date(existingPayment.data.expired_at) > new Date())
  ) {
    return NextResponse.json({
      snap_token: existingPayment.data.snap_token,
      redirect_url: existingPayment.data.snap_redirect_url,
      order_id: existingPayment.data.order_id,
    });
  }

  const packageData = Array.isArray(booking.travel_packages)
    ? booking.travel_packages[0]
    : booking.travel_packages;
  const siteUrl = getSiteUrl();
  const orderId = `TRVN-${booking.booking_code}-${Date.now()}`;
  const grossAmount = Math.round(Number(booking.total_price));
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const itemName = String(packageData?.name ?? "Paket TravelNusa").slice(0, 50);

  try {
    const snap = await createSnapTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: booking.full_name,
        email: booking.email,
        phone: booking.phone,
      },
      item_details: [
        {
          id: String(packageData?.id ?? booking.package_id ?? "package"),
          price: Math.round(Number(booking.price_per_person)),
          quantity: Number(booking.participant_count),
          name: itemName,
        },
      ],
      callbacks: {
        finish: `${siteUrl}/payment/success/${booking.booking_code}`,
        error: `${siteUrl}/payment/failed/${booking.booking_code}`,
        pending: `${siteUrl}/payment/pending/${booking.booking_code}`,
      },
      expiry: {
        start_time: formatMidtransExpiryStart(new Date()),
        unit: "hour",
        duration: 24,
      },
    });

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        booking_id: booking.id,
        order_id: orderId,
        snap_token: snap.token,
        snap_redirect_url: snap.redirect_url,
        gross_amount: grossAmount,
        payment_status: "pending",
        transaction_status: "pending",
        expired_at: expiresAt.toISOString(),
      })
      .select("id,order_id,snap_token,snap_redirect_url")
      .single();

    if (paymentError) {
      return NextResponse.json({ message: paymentError.message }, { status: 500 });
    }

    return NextResponse.json({
      payment_id: payment.id,
      order_id: payment.order_id,
      snap_token: payment.snap_token,
      redirect_url: payment.snap_redirect_url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membuat transaksi Midtrans.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
