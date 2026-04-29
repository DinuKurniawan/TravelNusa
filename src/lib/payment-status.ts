export type BookingPaymentStatus =
  | "pending"
  | "settlement"
  | "capture"
  | "expire"
  | "cancel"
  | "deny"
  | "failure"
  | "refund";

export type BookingLifecycleStatus =
  | "pending_payment"
  | "paid"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "expired";

export type MidtransFraudStatus = "accept" | "challenge" | "deny" | string | null | undefined;

export function mapMidtransTransactionStatus(
  transactionStatus: string | null | undefined,
  fraudStatus?: MidtransFraudStatus,
): {
  paymentStatus: BookingPaymentStatus;
  bookingStatus: BookingLifecycleStatus;
  shouldIssueTicket: boolean;
} {
  if (transactionStatus === "settlement") {
    return {
      paymentStatus: "settlement",
      bookingStatus: "paid",
      shouldIssueTicket: true,
    };
  }

  if (transactionStatus === "capture") {
    if (fraudStatus === "challenge") {
      return {
        paymentStatus: "pending",
        bookingStatus: "pending_payment",
        shouldIssueTicket: false,
      };
    }

    return {
      paymentStatus: "capture",
      bookingStatus: "paid",
      shouldIssueTicket: true,
    };
  }

  if (transactionStatus === "expire") {
    return {
      paymentStatus: "expire",
      bookingStatus: "expired",
      shouldIssueTicket: false,
    };
  }

  if (
    transactionStatus === "cancel" ||
    transactionStatus === "deny" ||
    transactionStatus === "failure" ||
    transactionStatus === "refund"
  ) {
    return {
      paymentStatus: transactionStatus,
      bookingStatus: "cancelled",
      shouldIssueTicket: false,
    };
  }

  return {
    paymentStatus: "pending",
    bookingStatus: "pending_payment",
    shouldIssueTicket: false,
  };
}

export function isSuccessfulPaymentStatus(status: string | null | undefined) {
  return status === "settlement" || status === "capture";
}
