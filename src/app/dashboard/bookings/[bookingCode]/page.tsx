import Link from "next/link";
import { ArrowLeft, Download, Ticket } from "lucide-react";

import { CheckPaymentStatusButton } from "@/components/payment/CheckPaymentStatusButton";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { PublicShell } from "@/components/public/public-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { getTicketBundleByBookingCode } from "@/lib/ticket";

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

export default async function CustomerBookingDetailPage({
  params,
}: {
  params: Promise<{ bookingCode: string }>;
}) {
  const [{ bookingCode }, session] = await Promise.all([params, requireUser()]);
  const bundle = await getTicketBundleByBookingCode({
    bookingCode,
    userId: session.user.id,
  });
  const { booking, payment, ticket } = bundle;

  return (
    <PublicShell>
      <section className="bg-slate-50 py-8">
        <div className="container-nusa">
          <Button variant="outline" asChild>
            <Link href="/dashboard/bookings">
              <ArrowLeft data-icon="inline-start" />
              Kembali
            </Link>
          </Button>
        </div>
      </section>
      <section className="py-10 md:py-14">
        <div className="container-nusa grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Detail Booking {booking.booking_code}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Paket" value={booking.travel_packages?.name ?? "Paket TravelNusa"} />
              <DetailItem label="Tanggal Keberangkatan" value={formatDate(booking.departure_date)} />
              <DetailItem label="Customer" value={`${booking.full_name} (${booking.email})`} />
              <DetailItem label="WhatsApp" value={booking.phone} />
              <DetailItem label="Jumlah Peserta" value={`${booking.participant_count} peserta`} />
              <DetailItem label="Total" value={<span className="text-primary">{formatCurrency(booking.total_price)}</span>} />
              <DetailItem label="Status Booking" value={<PaymentStatusBadge status={booking.booking_status} kind="booking" />} />
              <DetailItem label="Status Pembayaran" value={<PaymentStatusBadge status={payment?.payment_status} kind="payment" />} />
              <DetailItem label="Order ID" value={<span className="font-mono text-xs">{payment?.order_id ?? "-"}</span>} />
              <DetailItem label="Paid At" value={formatDateTime(payment?.paid_at)} />
            </CardContent>
          </Card>

          <Card className="h-fit shadow-sm">
            <CardHeader>
              <CardTitle>Aksi</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {booking.booking_status === "pending_payment" ? (
                <Button asChild>
                  <Link href={`/payment/${booking.booking_code}`}>Bayar Sekarang</Link>
                </Button>
              ) : null}
              <CheckPaymentStatusButton bookingCode={booking.booking_code} />
              {ticket ? (
                <Button variant="outline" asChild>
                  <Link href={`/ticket/${booking.booking_code}`}>
                    <Ticket data-icon="inline-start" />
                    Lihat Tiket
                  </Link>
                </Button>
              ) : null}
              {ticket ? (
                <Button variant="outline" asChild>
                  <Link href={`/api/tickets/${booking.booking_code}/pdf`}>
                    <Download data-icon="inline-start" />
                    Download PDF
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicShell>
  );
}
