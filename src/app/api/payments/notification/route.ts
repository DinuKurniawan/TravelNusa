import { NextResponse } from "next/server";

import { verifyMidtransNotification, type MidtransTransactionStatusResponse } from "@/lib/midtrans";
import { applyMidtransStatusToPayment } from "@/lib/payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as MidtransTransactionStatusResponse | null;

  if (!payload?.order_id) {
    return NextResponse.json({ message: "Invalid Midtrans payload." }, { status: 422 });
  }

  try {
    const statusResponse = await verifyMidtransNotification(payload);
    const result = await applyMidtransStatusToPayment({
      orderId: payload.order_id,
      statusResponse,
      eventType: "midtrans_notification",
      logPayload: payload,
    });

    return NextResponse.json({
      ok: true,
      order_id: payload.order_id,
      payment_status: result.paymentStatus,
      booking_status: result.bookingStatus,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook gagal diproses.";
    const status = message.includes("signature") ? 401 : 500;

    return NextResponse.json({ message }, { status });
  }
}
