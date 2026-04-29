import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { generateTicketPdfBuffer } from "@/lib/pdf";
import { assertTicketIsPrintable, getTicketBundleByBookingCode } from "@/lib/ticket";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookingCode: string }> },
) {
  const { bookingCode } = await params;
  const session = await getCurrentUser();

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.profile?.role === "admin" && session.profile.status === "active";

  try {
    const bundle = await getTicketBundleByBookingCode({
      bookingCode,
      userId: session.user.id,
      isAdmin,
    });

    assertTicketIsPrintable(bundle);

    const buffer = await generateTicketPdfBuffer(bundle);
    const filename = `${bundle.ticket?.ticket_code ?? bookingCode}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tiket tidak tersedia.";
    return NextResponse.json({ message }, { status: 404 });
  }
}
