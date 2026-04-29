import Link from "next/link";
import { RotateCcw, XCircle } from "lucide-react";

import { CheckPaymentStatusButton } from "@/components/payment/CheckPaymentStatusButton";
import { MidtransPayButton } from "@/components/payment/MidtransPayButton";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { PublicShell } from "@/components/public/public-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { getMidtransClientKey, getMidtransSnapScriptUrl, isMidtransProduction } from "@/lib/midtrans";
import { getTicketBundleByBookingCode } from "@/lib/ticket";

export default async function PaymentFailedPage({
  params,
}: {
  params: Promise<{ bookingCode: string }>;
}) {
  const [{ bookingCode }, session] = await Promise.all([params, requireUser()]);
  const isAdmin = session.profile?.role === "admin" && session.profile.status === "active";
  const { booking, payment } = await getTicketBundleByBookingCode({
    bookingCode,
    userId: session.user.id,
    isAdmin,
  });
  const canRetry = booking.booking_status === "pending_payment";

  return (
    <PublicShell>
      <section className="py-10 md:py-16">
        <div className="container-nusa max-w-4xl">
          <Alert variant="destructive" className="mb-6">
            <XCircle data-icon="inline-start" />
            <AlertTitle>Pembayaran gagal atau expired</AlertTitle>
            <AlertDescription>
              Pembayaran tidak berhasil diproses. Jika booking masih menunggu pembayaran, Anda dapat mencoba bayar ulang.
            </AlertDescription>
          </Alert>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Detail Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Booking Code</p>
                  <p className="font-mono font-semibold">{booking.booking_code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-semibold text-primary">{formatCurrency(booking.total_price)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <PaymentStatusBadge status={payment?.payment_status} kind="payment" />
                <PaymentStatusBadge status={booking.booking_status} kind="booking" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {canRetry ? (
                  <MidtransPayButton
                    bookingId={booking.id}
                    bookingCode={booking.booking_code}
                    clientKey={getMidtransClientKey()}
                    scriptUrl={getMidtransSnapScriptUrl(isMidtransProduction())}
                  />
                ) : (
                  <Button asChild>
                    <Link href={`/booking/${booking.travel_packages?.slug ?? ""}`}>
                      <RotateCcw data-icon="inline-start" />
                      Booking Ulang
                    </Link>
                  </Button>
                )}
                <CheckPaymentStatusButton bookingCode={booking.booking_code} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicShell>
  );
}
