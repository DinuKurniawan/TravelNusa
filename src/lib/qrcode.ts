import QRCode from "qrcode";

export type TicketQrPayload = {
  ticket_code: string;
  booking_code: string;
  package_name: string;
  departure_date: string;
};

export function buildTicketQrPayload(payload: TicketQrPayload) {
  return JSON.stringify(payload);
}

export async function generateQrCodeDataUrl(payload: string) {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 8,
    type: "image/png",
  });
}
