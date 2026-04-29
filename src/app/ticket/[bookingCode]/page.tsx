import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { TicketCard } from "@/components/ticket/TicketCard";
import { PublicShell } from "@/components/public/public-shell";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { assertTicketIsPrintable, getTicketBundleByBookingCode } from "@/lib/ticket";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ bookingCode: string }>;
}) {
  const [{ bookingCode }, session] = await Promise.all([params, requireUser()]);
  const isAdmin = session.profile?.role === "admin" && session.profile.status === "active";
  const bundle = await getTicketBundleByBookingCode({
    bookingCode,
    userId: session.user.id,
    isAdmin,
  });

  assertTicketIsPrintable(bundle);

  return (
    <PublicShell>
      <section className="bg-slate-50 py-8 print:hidden">
        <div className="container-nusa">
          <Button variant="outline" asChild>
            <Link href={`/payment/${bundle.booking.booking_code}`}>
              <ArrowLeft data-icon="inline-start" />
              Kembali ke Pembayaran
            </Link>
          </Button>
        </div>
      </section>
      <section className="py-10 print:py-0">
        <div className="container-nusa max-w-5xl print:max-w-none print:px-0">
          <TicketCard bundle={bundle} />
        </div>
      </section>
    </PublicShell>
  );
}
