"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Search } from "lucide-react";

import { syncPaymentStatusAction } from "@/actions/payment.actions";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime, paymentStatusLabels } from "@/lib/format";
import type { Payment, PaymentLog, PaymentStatus } from "@/types";

type PaymentRow = Payment & {
  payment_logs?: PaymentLog[] | null;
};

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

export function PaymentTable({ payments }: { payments: PaymentRow[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const [paymentType, setPaymentType] = useState("all");

  const paymentTypes = useMemo(() => {
    return ["all", ...Array.from(new Set(payments.map((payment) => payment.payment_type).filter(Boolean) as string[]))];
  }, [payments]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return payments.filter((payment) => {
      const searchBody = `${payment.order_id} ${payment.bookings?.booking_code ?? ""} ${payment.bookings?.full_name ?? ""}`.toLowerCase();
      if (normalizedSearch && !searchBody.includes(normalizedSearch)) return false;
      if (status !== "all" && payment.payment_status !== status) return false;
      if (paymentType !== "all" && payment.payment_type !== paymentType) return false;
      return true;
    });
  }, [paymentType, payments, search, status]);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_190px_190px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Cari order_id / booking code" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <select className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={status} onChange={(event) => setStatus(event.target.value as PaymentStatus | "all")}>
          {paymentStatuses.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "Semua status" : paymentStatusLabels[item]}
            </option>
          ))}
        </select>
        <select className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm" value={paymentType} onChange={(event) => setPaymentType(event.target.value)}>
          {paymentTypes.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "Semua tipe" : item}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Booking Code</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Gross Amount</TableHead>
              <TableHead>Payment Type</TableHead>
              <TableHead>Transaction Status</TableHead>
              <TableHead>Fraud Status</TableHead>
              <TableHead>Paid At</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono text-xs">{payment.order_id}</TableCell>
                <TableCell>
                  {payment.bookings?.booking_code ? (
                    <Link className="font-mono text-xs text-primary hover:underline" href={`/admin/bookings/${payment.bookings.booking_code}`}>
                      {payment.bookings.booking_code}
                    </Link>
                  ) : "-"}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{payment.bookings?.full_name ?? "-"}</div>
                  <div className="text-xs text-muted-foreground">{payment.bookings?.email ?? "-"}</div>
                </TableCell>
                <TableCell>{formatCurrency(payment.gross_amount)}</TableCell>
                <TableCell>{payment.payment_type ?? "-"}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <PaymentStatusBadge status={payment.payment_status} kind="payment" />
                    <span className="text-xs text-muted-foreground">{payment.transaction_status}</span>
                  </div>
                </TableCell>
                <TableCell>{payment.fraud_status ?? "-"}</TableCell>
                <TableCell>{formatDateTime(payment.paid_at)}</TableCell>
                <TableCell>
                  <div className="flex min-w-72 flex-wrap justify-end gap-2">
                    <form action={syncPaymentStatusAction}>
                      <input type="hidden" name="order_id" value={payment.order_id} />
                      <Button size="sm" variant="outline" type="submit">
                        <RefreshCw data-icon="inline-start" />
                        Cek Ulang
                      </Button>
                    </form>
                    <details className="rounded-lg border px-2 py-1 text-xs">
                      <summary className="cursor-pointer font-medium">Raw</summary>
                      <pre className="mt-2 max-h-72 w-96 overflow-auto whitespace-pre-wrap text-[11px] text-muted-foreground">
                        {JSON.stringify(payment.raw_response ?? {}, null, 2)}
                      </pre>
                    </details>
                    <details className="rounded-lg border px-2 py-1 text-xs">
                      <summary className="cursor-pointer font-medium">Log</summary>
                      <pre className="mt-2 max-h-72 w-96 overflow-auto whitespace-pre-wrap text-[11px] text-muted-foreground">
                        {JSON.stringify(payment.payment_logs ?? [], null, 2)}
                      </pre>
                    </details>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!filtered.length ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  Tidak ada transaksi sesuai filter.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
