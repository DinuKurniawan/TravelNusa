import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mapMidtransTransactionStatus } from "./payment-status";

describe("mapMidtransTransactionStatus", () => {
  it("marks settlement as paid", () => {
    assert.deepEqual(mapMidtransTransactionStatus("settlement"), {
      paymentStatus: "settlement",
      bookingStatus: "paid",
      shouldIssueTicket: true,
    });
  });

  it("marks accepted capture as paid", () => {
    assert.deepEqual(mapMidtransTransactionStatus("capture", "accept"), {
      paymentStatus: "capture",
      bookingStatus: "paid",
      shouldIssueTicket: true,
    });
  });

  it("keeps challenged capture pending", () => {
    assert.deepEqual(mapMidtransTransactionStatus("capture", "challenge"), {
      paymentStatus: "pending",
      bookingStatus: "pending_payment",
      shouldIssueTicket: false,
    });
  });

  it("cancels failed terminal statuses", () => {
    for (const status of ["cancel", "deny", "failure", "refund"] as const) {
      assert.deepEqual(mapMidtransTransactionStatus(status), {
        paymentStatus: status,
        bookingStatus: "cancelled",
        shouldIssueTicket: false,
      });
    }
  });
});
