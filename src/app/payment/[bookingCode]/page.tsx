import Link from "next/link";
import { CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";

import { CheckPaymentStatusButton } from "@/components/payment/CheckPaymentStatusButton";
import { MidtransPayButton } from "@/components/payment/MidtransPayButton";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { PublicShell } from "@/components/public/public-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { getMidtransClientKey, getMidtransSnapScriptUrl, isMidtransProduction } from "@/lib/midtrans";
import { getTicketBundleByBookingCode } from "@/lib/ticket";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ bookingCode: string }>;
}) {
  const [{ bookingCode }, session] = await Promise.all([params, requireUser()]);
  const isAdmin = session.profile?.role === "admin" && session.profile.status === "active";
  const bundle = await getTicketBundleByBookingCode({
    bookingCode,
    userId: session.user.id,
    isAdmin,
  });
  const { booking, payment } = bundle;
  const packageName = booking.travel_packages?.name ?? "Paket TravelNusa";
  const canPay = booking.booking_status === "pending_payment";

  return (
    <PublicShell>
      <section className="bg-slate-50 py-10 md:py-14">
        <div className="container-nusa">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Ringkasan Pembayaran</h1>
          <p className="mt-2 text-muted-foreground">Booking {booking.booking_code}</p>
        </div>
      </section>
      <section className="py-10 md:py-14">
        <div className="container-nusa grid gap-6 lg:grid-cols-[1fr_420px]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Detail Booking</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Paket</p>
                  <p className="font-semibold">{packageName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Berangkat</p>
                  <p className="font-semibold">{formatDate(booking.departure_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-semibold">{booking.full_name}</p>
                  <p className="text-sm text-muted-foreground">{booking.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Peserta</p>
                  <p className="font-semibold">{booking.participant_count} orang</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-3 rounded-xl border bg-muted/40 p-4">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Harga per orang</span>
                  <span>{formatCurrency(booking.price_per_person)}</span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Jumlah peserta</span>
                  <span>{booking.participant_count}</span>
                </div>
                <div className="flex justify-between gap-4 border-t pt-3">
                  <span className="font-medium">Total pembayaran</span>
                  <span className="text-2xl font-semibold text-primary">{formatCurrency(booking.total_price)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard data-icon="inline-start" />
                  Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
                  <span className="text-sm text-muted-foreground">Status booking</span>
                  <PaymentStatusBadge status={booking.booking_status} kind="booking" />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
                  <span className="text-sm text-muted-foreground">Status pembayaran</span>
                  <PaymentStatusBadge status={payment?.payment_status} kind="payment" />
                </div>
                {canPay ? (
                  <MidtransPayButton
                    bookingId={booking.id}
                    bookingCode={booking.booking_code}
                    clientKey={getMidtransClientKey()}
                    scriptUrl={getMidtransSnapScriptUrl(isMidtransProduction())}
                  />
                ) : (
                  <Button asChild>
                    <Link href={`/ticket/${booking.booking_code}`}>Lihat Tiket</Link>
                  </Button>
                )}
                <CheckPaymentStatusButton bookingCode={booking.booking_code} />
              </CardContent>
            </Card>

            <Alert>
              <LockKeyhole data-icon="inline-start" />
              <AlertTitle>Pembayaran aman</AlertTitle>
              <AlertDescription>
                TravelNusa tidak menyimpan data kartu atau rekening. Status valid hanya diambil dari webhook atau API status Midtrans.
              </AlertDescription>
            </Alert>
            <Alert>
              <ShieldCheck data-icon="inline-start" />
              <AlertTitle>Instruksi</AlertTitle>
              <AlertDescription>
                Selesaikan pembayaran di popup Midtrans. Jika popup tertutup, booking tetap tersimpan dan bisa dibayar ulang dari halaman ini.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
