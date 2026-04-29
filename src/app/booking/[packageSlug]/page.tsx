import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";

import { BookingForm } from "@/components/booking/BookingForm";
import { PublicShell } from "@/components/public/public-shell";
import { Button } from "@/components/ui/button";
import { getPackageBySlug } from "@/lib/data/public";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Booking Paket Travel",
};

export default async function PackageBookingPage({
  params,
}: {
  params: Promise<{ packageSlug: string }>;
}) {
  const [{ packageSlug }, session] = await Promise.all([params, requireUser()]);
  const travelPackage = await getPackageBySlug(packageSlug);

  if (!travelPackage) {
    notFound();
  }

  return (
    <PublicShell>
      <section className="bg-slate-50 py-10 md:py-14">
        <div className="container-nusa flex flex-col gap-4">
          <Button variant="outline" className="w-fit" asChild>
            <Link href={`/paket/${travelPackage.slug}`}>
              <ArrowLeft data-icon="inline-start" />
              Kembali ke Paket
            </Link>
          </Button>
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <LockKeyhole data-icon="inline-start" />
              Data booking diamankan dan pembayaran diproses oleh Midtrans Snap.
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Booking {travelPackage.name}
            </h1>
            <p className="mt-3 text-muted-foreground">
              Isi data peserta, pilih tanggal keberangkatan, lalu lanjutkan ke ringkasan pembayaran.
            </p>
          </div>
        </div>
      </section>
      <section className="py-10 md:py-14">
        <div className="container-nusa">
          <BookingForm
            travelPackage={travelPackage}
            profile={session.profile}
            userEmail={session.user.email ?? ""}
          />
        </div>
      </section>
    </PublicShell>
  );
}
