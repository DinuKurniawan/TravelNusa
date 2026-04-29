import type { Metadata } from "next";

import { DestinationCard } from "@/components/public/destination-card";
import { PublicShell } from "@/components/public/public-shell";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCategories, getDestinations } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Destinasi Wisata",
};

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [categories, destinations] = await Promise.all([getCategories(), getDestinations(params)]);
  const provinces = Array.from(new Set(destinations.map((item) => item.province)));

  return (
    <PublicShell>
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="container-nusa flex flex-col gap-8">
          <SectionHeading title="Destinasi Wisata Indonesia" description="Temukan destinasi berdasarkan kategori, provinsi, atau kata kunci." />
          <form className="grid gap-3 rounded-xl border bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_180px_auto]">
            <Input name="search" placeholder="Cari destinasi..." defaultValue={String(params.search ?? "")} />
            <select name="category" defaultValue={String(params.category ?? "all")} className="h-8 rounded-lg border border-input bg-background px-2 text-sm">
              <option value="all">Semua kategori</option>
              {categories.map((item) => (
                <option key={item.id} value={item.slug}>{item.name}</option>
              ))}
            </select>
            <select name="province" defaultValue={String(params.province ?? "all")} className="h-8 rounded-lg border border-input bg-background px-2 text-sm">
              <option value="all">Semua provinsi</option>
              {provinces.map((province) => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
            <Button type="submit">Filter</Button>
          </form>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container-nusa grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
