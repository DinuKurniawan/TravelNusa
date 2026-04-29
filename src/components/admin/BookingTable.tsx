"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, FileText, Printer, Search, XCircle } from "lucide-react";

import { updateBookingStatusAction } from "@/actions/admin.actions";
import { cancelBookingAction } from "@/actions/payment.actions";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bookingStatusLabels, formatCurrency, formatDate, paymentStatusLabels } from "@/lib/format";
import type { Booking, BookingStatus, Payment, PaymentStatus, Ticket } from "@/types";

type BookingRow = Booking & {
  payments?: Payment[] | null;
  tickets?: Ticket[] | null;
};

const bookingStatuses: Array<BookingStatus | "all"> = [
  "all",
  "pending_payment",
  "paid",
  "confirmed",
  "completed",
  "cancelled",
  "expired",
];

const paymentStatuses: Array<PaymentStatus | "all"> = [
  "all",
  "pending",
  "settlement",
  "capture",
  "expire",
  "cancel",
  "deny",
  "failure",
  "refund",
];

function latestPayment(booking: BookingRow) {
  return [...(booking.payments ?? [])].sort((a, b) =>
    String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")),
  )[0] ?? null;
}

function csvEscape(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function BookingTable({ bookings }: { bookings: BookingRow[] }) {
  const [search, setSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState<(typeof bookingStatuses)[number]>("all");
  const [paymentStatus, setPaymentStatus] = useState<(typeof paymentStatuses)[number]>("all");
  const [departureDate, setDepartureDate] = useState("");

  const filtered = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return bookings.filter((booking) => {
      const payment = latestPayment(booking);
      const searchBody = `${booking.booking_code} ${booking.full_name} ${booking.email} ${booking.travel_packages?.name ?? ""}`.toLowerCase();

      if (normalizedSearch && !searchBody.includes(normalizedSearch)) return false;
      if (bookingStatus !== "all" && booking.booking_status !== bookingStatus) return false;
      if (paymentStatus !== "all" && payment?.payment_status !== paymentStatus) return false;
      if (departureDate && booking.departure_date !== departureDate) return false;
      return true;
    });
  }, [bookings, bookingStatus, departureDate, paymentStatus, search]);

  function exportCsv() {
    const rows = [
      ["Booking Code", "Customer", "Paket", "Tanggal Keberangkatan", "Jumlah Peserta", "Total Harga", "Booking Status", "Payment Status", "Created At"],
      ...filtered.map((booking) => {
        const payment = latestPayment(booking);
        return [
          booking.booking_code,
          booking.full_name,
          booking.travel_packages?.name ?? "-",
          booking.departure_date,
          booking.participant_count,
          booking.total_price,
          booking.booking_status,
          payment?.payment_status ?? "pending",
          booking.created_at ?? "",
        ];
      }),
    ];
    const blob = new Blob([rows.map((row) => row.map(csvEscape).join(",")).join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `travelnusa-bookings-${Date.now()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_190px_190px_170px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Cari booking code / nama customer" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <select className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={bookingStatus} onChange={(event) => setBookingStatus(event.target.value as BookingStatus | "all")}>
          {bookingStatuses.map((status) => (
            <option key={status} value={status}>
              {status === "all" ? "Semua booking" : bookingStatusLabels[status]}
            </option>
          ))}
        </select>
        <select className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus | "all")}>
          {paymentStatuses.map((status) => (
            <option key={status} value={status}>
              {status === "all" ? "Semua payment" : paymentStatusLabels[status]}
            </option>
          ))}
        </select>
        <Input type="date" value={departureDate} onChange={(event) => setDepartureDate(event.target.value)} />
        <Button type="button" variant="outline" onClick={exportCsv}>
          <Download data-icon="inline-start" />
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking Code</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Tanggal Keberangkatan</TableHead>
              <TableHead>Jumlah Peserta</TableHead>
              <TableHead>Total Harga</TableHead>
              <TableHead>Booking Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((booking) => {
              const payment = latestPayment(booking);
              const ticket = booking.tickets?.[0];

              return (
                <TableRow key={booking.id}>
                  <TableCell className="font-mono text-xs">{booking.booking_code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{booking.full_name}</div>
                    <div className="text-xs text-muted-foreground">{booking.email}</div>
                  </TableCell>
                  <TableCell>{booking.travel_packages?.name ?? "-"}</TableCell>
                  <TableCell>{formatDate(booking.departure_date)}</TableCell>
                  <TableCell>{booking.participant_count}</TableCell>
                  <TableCell>{formatCurrency(booking.total_price)}</TableCell>
                  <TableCell><PaymentStatusBadge status={booking.booking_status} kind="booking" /></TableCell>
                  <TableCell><PaymentStatusBadge status={payment?.payment_status} kind="payment" /></TableCell>
                  <TableCell>{formatDate(booking.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex min-w-80 flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/bookings/${booking.booking_code}`}>
                          <FileText data-icon="inline-start" />
                          Detail
                        </Link>
                      </Button>
                      <form action={updateBookingStatusAction} className="flex gap-2">
                        <input type="hidden" name="id" value={booking.id} />
                        <select name="status" defaultValue={booking.booking_status} className="h-7 rounded-lg border border-input bg-background px-2 text-xs">
                          {bookingStatuses.filter((status) => status !== "all").map((status) => (
                            <option key={status} value={status}>{bookingStatusLabels[status]}</option>
                          ))}
                        </select>
                        <Button size="sm" type="submit">Update</Button>
                      </form>
                      {ticket ? (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/ticket/${booking.booking_code}`}>
                            <Printer data-icon="inline-start" />
                            Tiket
                          </Link>
                        </Button>
                      ) : null}
                      {ticket ? (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/api/tickets/${booking.booking_code}/pdf`}>
                            <Download data-icon="inline-start" />
                            PDF
                          </Link>
                        </Button>
                      ) : null}
                      <form action={cancelBookingAction}>
                        <input type="hidden" name="booking_id" value={booking.id} />
                        <Button size="sm" variant="destructive" type="submit">
                          <XCircle data-icon="inline-start" />
                          Cancel
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {!filtered.length ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  Tidak ada booking sesuai filter.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
