import Link from "next/link";
import { ArrowLeft, Download, RefreshCw, Ticket as TicketIcon } from "lucide-react";

import { updateBookingStatusAction } from "@/actions/admin.actions";
import { syncPaymentStatusAction } from "@/actions/payment.actions";
import { updateTicketStatusAction } from "@/actions/ticket.actions";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth";
import { bookingStatusLabels, formatCurrency, formatDate, formatDateTime, ticketStatusLabels } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getTicketBundleByBookingCode } from "@/lib/ticket";
import type { BookingStatus, PaymentLog, TicketStatus } from "@/types";

const bookingStatuses: BookingStatus[] = ["pending_payment", "paid", "confirmed", "completed", "cancelled", "expired"];
const ticketStatuses: TicketStatus[] = ["active", "used", "cancelled"];

async function getPaymentLogs(paymentId?: string) {
  if (!paymentId) return [];
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("payment_logs")
    .select("*")
    .eq("payment_id", paymentId)
    .order("created_at", { ascending: false });
  return (data ?? []) as PaymentLog[];
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ bookingCode: string }>;
}) {
  const [{ bookingCode }, session] = await Promise.all([params, requireAdmin()]);
  const bundle = await getTicketBundleByBookingCode({
    bookingCode,
    userId: session.user.id,
    isAdmin: true,
  });
  const { booking, payment, ticket } = bundle;
  const logs = await getPaymentLogs(payment?.id);

  return (
    <div className="flex flex-col gap-6">
      <Button variant="outline" className="w-fit" asChild>
        <Link href="/admin/bookings">
          <ArrowLeft data-icon="inline-start" />
          Kembali ke Booking
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{booking.booking_code}</h1>
        <p className="mt-2 text-muted-foreground">{booking.full_name} - {booking.travel_packages?.name ?? "Paket TravelNusa"}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail Booking</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Customer" value={`${booking.full_name} (${booking.email})`} />
              <DetailItem label="WhatsApp" value={booking.phone} />
              <DetailItem label="Paket" value={booking.travel_packages?.name ?? "-"} />
              <DetailItem label="Tanggal Keberangkatan" value={formatDate(booking.departure_date)} />
              <DetailItem label="Peserta" value={`${booking.participant_count} peserta`} />
              <DetailItem label="Total" value={<span className="text-primary">{formatCurrency(booking.total_price)}</span>} />
              <DetailItem label="Status Booking" value={<PaymentStatusBadge status={booking.booking_status} kind="booking" />} />
              <DetailItem label="Status Payment" value={<PaymentStatusBadge status={payment?.payment_status} kind="payment" />} />
              <DetailItem label="Catatan Customer" value={booking.note ?? "-"} />
              <DetailItem label="Catatan Admin" value={booking.admin_note ?? "-"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detail Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {payment ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <DetailItem label="Order ID" value={<span className="font-mono text-xs">{payment.order_id}</span>} />
                    <DetailItem label="Gross Amount" value={formatCurrency(payment.gross_amount)} />
                    <DetailItem label="Payment Type" value={payment.payment_type ?? "-"} />
                    <DetailItem label="Transaction ID" value={<span className="font-mono text-xs">{payment.transaction_id ?? "-"}</span>} />
                    <DetailItem label="Transaction Status" value={payment.transaction_status} />
                    <DetailItem label="Fraud Status" value={payment.fraud_status ?? "-"} />
                    <DetailItem label="Paid At" value={formatDateTime(payment.paid_at)} />
                    <DetailItem label="Expired At" value={formatDateTime(payment.expired_at)} />
                  </div>
                  <details className="rounded-xl border p-4">
                    <summary className="cursor-pointer font-medium">Raw Response Midtrans</summary>
                    <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                      {JSON.stringify(payment.raw_response ?? {}, null, 2)}
                    </pre>
                  </details>
                  <details className="rounded-xl border p-4">
                    <summary className="cursor-pointer font-medium">Log Webhook</summary>
                    <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                      {JSON.stringify(logs, null, 2)}
                    </pre>
                  </details>
                </>
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                  Belum ada payment record.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateBookingStatusAction} className="flex flex-col gap-3">
                <input type="hidden" name="id" value={booking.id} />
                <select name="status" defaultValue={booking.booking_status} className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm">
                  {bookingStatuses.map((status) => (
                    <option key={status} value={status}>{bookingStatusLabels[status]}</option>
                  ))}
                </select>
                <Textarea name="admin_note" defaultValue={booking.admin_note ?? ""} placeholder="Catatan admin" />
                <Button type="submit">Update Status Booking</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Action</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {payment ? (
                <form action={syncPaymentStatusAction}>
                  <input type="hidden" name="order_id" value={payment.order_id} />
                  <Button type="submit" variant="outline" className="w-full">
                    <RefreshCw data-icon="inline-start" />
                    Cek Ulang Status Midtrans
                  </Button>
                </form>
              ) : null}
              {ticket ? (
                <>
                  <Button asChild>
                    <Link href={`/ticket/${booking.booking_code}`}>
                      <TicketIcon data-icon="inline-start" />
                      Lihat Tiket
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/api/tickets/${booking.booking_code}/pdf`}>
                      <Download data-icon="inline-start" />
                      Download Tiket PDF
                    </Link>
                  </Button>
                </>
              ) : null}
            </CardContent>
          </Card>

          {ticket ? (
            <Card>
              <CardHeader>
                <CardTitle>Update Tiket</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={updateTicketStatusAction} className="flex flex-col gap-3">
                  <input type="hidden" name="ticket_id" value={ticket.id} />
                  <select name="ticket_status" defaultValue={ticket.ticket_status} className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm">
                    {ticketStatuses.map((status) => (
                      <option key={status} value={status}>{ticketStatusLabels[status]}</option>
                    ))}
                  </select>
                  <Button type="submit">Update Status Tiket</Button>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
