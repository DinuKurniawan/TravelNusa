import "server-only";

import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";

import { TicketPDF } from "@/components/ticket/TicketPDF";
import type { TicketBundle } from "@/lib/ticket";

export async function generateTicketPdfBuffer(bundle: TicketBundle) {
  const document = createElement(TicketPDF, { bundle }) as unknown as Parameters<typeof renderToBuffer>[0];
  return renderToBuffer(document);
}
