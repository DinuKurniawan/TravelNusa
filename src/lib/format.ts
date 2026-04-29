import { formatCurrency as formatCurrencyBase, formatDate as formatDateBase } from "@/lib/utils";
import type { BookingStatus, PaymentStatus, TicketStatus } from "@/types";

export function formatCurrency(value: number | null | undefined) {
  return formatCurrencyBase(value);
}

export function formatDate(value: string | Date | null | undefined) {
  return formatDateBase(value);
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export const bookingStatusLabels: Record<BookingStatus, string> = {
  pending_payment: "Menunggu Pembayaran",
  paid: "Paid",
  confirmed: "Dikonfirmasi",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  expired: "Expired",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Pending",
  settlement: "Settlement",
  capture: "Capture",
  expire: "Expired",
  cancel: "Cancelled",
  deny: "Denied",
  failure: "Failure",
  refund: "Refund",
};

export const ticketStatusLabels: Record<TicketStatus, string> = {
  active: "Aktif",
  used: "Digunakan",
  cancelled: "Dibatalkan",
};
