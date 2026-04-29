import type { Metadata } from "next";

import { BookingForm } from "@/components/forms/booking-form";
import { PublicShell } from "@/components/public/public-shell";
import { SectionHeading } from "@/components/public/section-heading";
import { getPackages } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Booking Perjalanan",
};

export default async function BookingPage() {
  const packages = await getPackages();

  return (
    <PublicShell>
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="container-nusa">
          <SectionHeading title="Booking Perjalanan" description="Isi data perjalanan. Total estimasi dihitung otomatis berdasarkan paket dan jumlah peserta." />
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container-nusa max-w-4xl">
          <BookingForm packages={packages} />
        </div>
      </section>
    </PublicShell>
  );
}
