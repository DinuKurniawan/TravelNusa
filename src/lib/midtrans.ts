import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import midtransClient from "midtrans-client";

type SnapTransactionResponse = {
  token: string;
  redirect_url: string;
};

export type MidtransTransactionStatusResponse = {
  order_id: string;
  status_code?: string;
  gross_amount?: string;
  transaction_id?: string;
  transaction_status?: string;
  payment_type?: string;
  fraud_status?: string;
  signature_key?: string;
  settlement_time?: string;
  transaction_time?: string;
  expiry_time?: string;
  [key: string]: unknown;
};

export type MidtransSnapPayload = {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details: {
    first_name: string;
    email: string;
    phone: string;
  };
  item_details: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  callbacks: {
    finish: string;
    error: string;
    pending: string;
  };
  expiry?: {
    start_time: string;
    unit: "minute" | "hour" | "day";
    duration: number;
  };
};

let snapClient: InstanceType<typeof midtransClient.Snap> | null = null;
let coreApiClient: InstanceType<typeof midtransClient.CoreApi> | null = null;

function getMidtransServerKey() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  if (!serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY is required for Midtrans server operations.");
  }

  return serverKey;
}

export function isMidtransProduction() {
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}

export function getMidtransClientKey() {
  return process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
}

export function getMidtransSnapScriptUrl(isProduction = isMidtransProduction()) {
  return isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
}

function getMidtransConfig() {
  return {
    isProduction: isMidtransProduction(),
    serverKey: getMidtransServerKey(),
    clientKey: getMidtransClientKey(),
  };
}

function getSnapClient() {
  if (!snapClient) {
    snapClient = new midtransClient.Snap(getMidtransConfig());
  }

  return snapClient;
}

function getCoreApiClient() {
  if (!coreApiClient) {
    coreApiClient = new midtransClient.CoreApi(getMidtransConfig());
  }

  return coreApiClient;
}

export async function createSnapTransaction(payload: MidtransSnapPayload) {
  const transaction = await getSnapClient().createTransaction(payload as unknown as Record<string, unknown>);

  if (typeof transaction.token !== "string" || typeof transaction.redirect_url !== "string") {
    throw new Error("Midtrans did not return a valid Snap transaction.");
  }

  return transaction as SnapTransactionResponse;
}

export async function getTransactionStatus(orderId: string) {
  const status = await getCoreApiClient().transaction.status(orderId);
  return status as MidtransTransactionStatusResponse;
}

export function verifyMidtransSignature(payload: MidtransTransactionStatusResponse) {
  const serverKey = getMidtransServerKey();
  const signatureKey = payload.signature_key;
  const orderId = payload.order_id;
  const statusCode = payload.status_code;
  const grossAmount = payload.gross_amount;

  if (!signatureKey || !orderId || !statusCode || !grossAmount) {
    return false;
  }

  const expected = createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");

  const actualBuffer = Buffer.from(signatureKey, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function verifyMidtransNotification(payload: MidtransTransactionStatusResponse) {
  if (!verifyMidtransSignature(payload)) {
    throw new Error("Invalid Midtrans notification signature.");
  }

  return getTransactionStatus(payload.order_id);
}
