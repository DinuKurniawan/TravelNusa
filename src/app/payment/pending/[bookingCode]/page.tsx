import Link from "next/link";
import { Clock3, CreditCard } from "lucide-react";

import { CheckPaymentStatusButton } from "@/components/payment/CheckPaymentStatusButton";
import { MidtransPayButton } from "@/components/payment/MidtransPayButton";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { PublicShell } from "@/components/public/public-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { getMidtransClientKey, getMidtransSnapScriptUrl, isMidtransProduction } from "@/lib/midtrans";
import { getTicketBundleByBookingCode } from "@/lib/ticket";

export default async function PaymentPendingPage({
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

  return (
    <PublicShell>
      <section className="py-10 md:py-16">
        <div className="container-nusa max-w-4xl">
          <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-900">
            <Clock3 data-icon="inline-start" />
            <AlertTitle>Pembayaran pending</AlertTitle>
            <AlertDescription>
              Selesaikan instruksi pembayaran di channel yang dipilih. Status akan berubah otomatis setelah Midtrans mengirim notifikasi.
            </AlertDescription>
          </Alert>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Instruksi Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Booking Code</p>
                  <p className="font-mono font-semibold">{booking.booking_code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paket</p>
                  <p className="font-semibold">{booking.travel_packages?.name ?? "Paket TravelNusa"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal keberangkatan</p>
                  <p className="font-semibold">{formatDate(booking.departure_date)}</p>
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
              <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                Jika belum menyelesaikan pembayaran, klik Bayar Sekarang untuk membuka ulang popup Midtrans. Jika sudah membayar, klik Cek Status Pembayaran.
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <MidtransPayButton
                  bookingId={booking.id}
                  bookingCode={booking.booking_code}
                  clientKey={getMidtransClientKey()}
                  scriptUrl={getMidtransSnapScriptUrl(isMidtransProduction())}
                />
                <CheckPaymentStatusButton bookingCode={booking.booking_code} />
              </div>
              <Button variant="outline" className="w-fit" asChild>
                <Link href={`/payment/${booking.booking_code}`}>
                  <CreditCard data-icon="inline-start" />
                  Lihat Ringkasan Pembayaran
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicShell>
  );
}
