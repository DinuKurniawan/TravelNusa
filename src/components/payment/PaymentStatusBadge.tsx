import { Badge } from "@/components/ui/badge";
import { bookingStatusLabels, paymentStatusLabels, ticketStatusLabels } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BookingStatus, PaymentStatus, TicketStatus } from "@/types";

type StatusKind = "booking" | "payment" | "ticket";

const statusClasses: Record<string, string> = {
  pending_payment: "border-amber-200 bg-amber-50 text-amber-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  settlement: "border-emerald-200 bg-emerald-50 text-emerald-700",
  capture: "border-emerald-200 bg-emerald-50 text-emerald-700",
  confirmed: "border-sky-200 bg-sky-50 text-sky-700",
  completed: "border-teal-200 bg-teal-50 text-teal-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  used: "border-slate-200 bg-slate-50 text-slate-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
  cancel: "border-red-200 bg-red-50 text-red-700",
  deny: "border-red-200 bg-red-50 text-red-700",
  failure: "border-red-200 bg-red-50 text-red-700",
  expired: "border-slate-200 bg-slate-50 text-slate-700",
  expire: "border-slate-200 bg-slate-50 text-slate-700",
  refund: "border-orange-200 bg-orange-50 text-orange-700",
};

function getLabel(status: string, kind: StatusKind) {
  if (kind === "booking" && status in bookingStatusLabels) {
    return bookingStatusLabels[status as BookingStatus];
  }

  if (kind === "payment" && status in paymentStatusLabels) {
    return paymentStatusLabels[status as PaymentStatus];
  }

  if (kind === "ticket" && status in ticketStatusLabels) {
    return ticketStatusLabels[status as TicketStatus];
  }

  return status;
}

export function PaymentStatusBadge({
  status,
  kind = "payment",
  className,
}: {
  status: string | null | undefined;
  kind?: StatusKind;
  className?: string;
}) {
  const safeStatus = status ?? "pending";

  return (
    <Badge variant="outline" className={cn("capitalize", statusClasses[safeStatus], className)}>
      {getLabel(safeStatus, kind)}
    </Badge>
  );
}
