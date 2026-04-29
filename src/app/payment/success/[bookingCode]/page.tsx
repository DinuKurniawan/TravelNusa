import Link from "next/link";
import { CheckCircle2, Download, Ticket } from "lucide-react";

import { CheckPaymentStatusButton } from "@/components/payment/CheckPaymentStatusButton";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { PublicShell } from "@/components/public/public-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { getTicketBundleByBookingCode } from "@/lib/ticket";

export default async function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ bookingCode: string }>;
}) {
  const [{ bookingCode }, session] = await Promise.all([params, requireUser()]);
  const isAdmin = session.profile?.role === "admin" && session.profile.status === "active";
  const { booking, payment, ticket } = await getTicketBundleByBookingCode({
    bookingCode,
    userId: session.user.id,
    isAdmin,
  });

  return (
    <PublicShell>
      <section className="py-10 md:py-16">
        <div className="container-nusa max-w-4xl">
          <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-900">
            <CheckCircle2 data-icon="inline-start" />
            <AlertTitle>Pembayaran berhasil</AlertTitle>
            <AlertDescription>
              Booking {booking.booking_code} sudah diproses. Tiket akan tersedia setelah status Midtrans terkonfirmasi settlement atau capture.
            </AlertDescription>
          </Alert>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Detail Booking</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
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
                <div className="flex items-center gap-2">
                  <PaymentStatusBadge status={payment?.payment_status} kind="payment" />
                  <PaymentStatusBadge status={booking.booking_status} kind="booking" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {ticket ? (
                  <>
                    <Button asChild>
                      <Link href={`/ticket/${booking.booking_code}`}>
                        <Ticket data-icon="inline-start" />
                        Lihat Tiket
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/api/tickets/${booking.booking_code}/pdf`}>
                        <Download data-icon="inline-start" />
                        Download Tiket
                      </Link>
                    </Button>
                  </>
                ) : (
                  <CheckPaymentStatusButton bookingCode={booking.booking_code} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicShell>
  );
}
