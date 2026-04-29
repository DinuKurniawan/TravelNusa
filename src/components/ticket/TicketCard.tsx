"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, MessageCircle, Printer, QrCode } from "lucide-react";

import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import type { TicketBundle } from "@/lib/ticket";

function TicketRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 rounded-lg border bg-background p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function TicketCard({ bundle }: { bundle: TicketBundle }) {
  const { booking, payment, ticket, qrCodeDataUrl } = bundle;
  const packageName = booking.travel_packages?.name ?? "Paket TravelNusa";
  const destination = booking.travel_packages?.destinations
    ? `${booking.travel_packages.destinations.name}, ${booking.travel_packages.destinations.city}`
    : "Indonesia";
  const whatsappText = encodeURIComponent(
    `E-Ticket TravelNusa\n${ticket?.ticket_code ?? booking.booking_code}\n${packageName}\nBerangkat: ${formatDate(booking.departure_date)}`,
  );

  return (
    <Card className="overflow-hidden shadow-sm print:shadow-none">
      <CardHeader className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm text-white/80">TravelNusa Indonesia</p>
            <CardTitle className="mt-2 text-3xl">E-Ticket TravelNusa</CardTitle>
            <p className="mt-2 text-sm text-white/80">Tunjukkan tiket ini kepada petugas saat keberangkatan.</p>
          </div>
          <div className="rounded-xl bg-white/12 p-4 text-sm backdrop-blur">
            <p className="text-white/75">Ticket Code</p>
            <p className="font-mono text-lg font-semibold">{ticket?.ticket_code ?? "-"}</p>
            <p className="mt-2 text-white/75">Booking Code</p>
            <p className="font-mono font-semibold">{booking.booking_code}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 p-5 md:p-6">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 p-5">
            {qrCodeDataUrl ? (
              <Image src={qrCodeDataUrl} alt={`QR ${ticket?.ticket_code ?? booking.booking_code}`} width={180} height={180} className="rounded-lg bg-white p-2" />
            ) : (
              <QrCode className="text-muted-foreground" />
            )}
            <p className="mt-3 text-center font-mono text-sm">{ticket?.ticket_code ?? "-"}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TicketRow label="Nama Customer" value={booking.full_name} />
            <TicketRow label="Email" value={booking.email} />
            <TicketRow label="Phone" value={booking.phone} />
            <TicketRow label="Nama Paket" value={packageName} />
            <TicketRow label="Destinasi" value={destination} />
            <TicketRow label="Tanggal Keberangkatan" value={formatDate(booking.departure_date)} />
            <TicketRow label="Jumlah Peserta" value={`${booking.participant_count} peserta`} />
            <TicketRow label="Total Pembayaran" value={formatCurrency(booking.total_price)} />
            <TicketRow label="Status Pembayaran" value={<PaymentStatusBadge status={payment?.payment_status} kind="payment" />} />
            <TicketRow label="Status Tiket" value={<PaymentStatusBadge status={ticket?.ticket_status} kind="ticket" />} />
            <TicketRow label="Tanggal Diterbitkan" value={formatDateTime(ticket?.issued_at)} />
          </div>
        </div>

        <Separator />

        <div className="flex flex-col justify-between gap-4 rounded-xl border bg-emerald-50 p-4 text-sm text-emerald-900 md:flex-row md:items-center">
          <p>Tunjukkan tiket ini kepada petugas saat keberangkatan.</p>
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button type="button" variant="outline" onClick={() => window.print()}>
              <Printer data-icon="inline-start" />
              Cetak Tiket
            </Button>
            <Button type="button" asChild>
              <Link href={`/api/tickets/${booking.booking_code}/pdf`}>
                <Download data-icon="inline-start" />
                Download PDF
              </Link>
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`https://wa.me/?text=${whatsappText}`} target="_blank">
                <MessageCircle data-icon="inline-start" />
                Kirim WhatsApp
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
