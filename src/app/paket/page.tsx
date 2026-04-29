import type { Metadata } from "next";

import { PackageCard } from "@/components/public/package-card";
import { PublicShell } from "@/components/public/public-shell";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDestinations, getPackages } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Paket Travel",
};

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [destinations, packages] = await Promise.all([getDestinations(), getPackages(params)]);

  return (
    <PublicShell>
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="container-nusa flex flex-col gap-8">
          <SectionHeading title="Paket Travel Indonesia" description="Filter berdasarkan harga, durasi, destinasi, dan urutkan sesuai kebutuhan." />
          <form className="grid gap-3 rounded-xl border bg-white p-4 shadow-sm lg:grid-cols-[1fr_170px_150px_130px_130px_150px_auto]">
            <Input name="search" placeholder="Cari paket..." defaultValue={String(params.search ?? "")} />
            <select name="destination" defaultValue={String(params.destination ?? "all")} className="h-8 rounded-lg border border-input bg-background px-2 text-sm">
              <option value="all">Destinasi</option>
              {destinations.map((item) => (
                <option key={item.id} value={item.slug}>{item.name}</option>
              ))}
            </select>
            <select name="duration" defaultValue={String(params.duration ?? "all")} className="h-8 rounded-lg border border-input bg-background px-2 text-sm">
              <option value="all">Durasi</option>
              <option value="short">1-3 hari</option>
              <option value="medium">4-5 hari</option>
              <option value="long">6+ hari</option>
            </select>
            <Input name="minPrice" type="number" placeholder="Min" defaultValue={String(params.minPrice ?? "")} />
            <Input name="maxPrice" type="number" placeholder="Max" defaultValue={String(params.maxPrice ?? "")} />
            <select name="sort" defaultValue={String(params.sort ?? "")} className="h-8 rounded-lg border border-input bg-background px-2 text-sm">
              <option value="">Rekomendasi</option>
              <option value="price_asc">Termurah</option>
              <option value="price_desc">Termahal</option>
            </select>
            <Button type="submit">Filter</Button>
          </form>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container-nusa grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((item) => (
            <PackageCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
