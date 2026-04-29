import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";

import { PackageCard } from "@/components/public/package-card";
import { PublicShell } from "@/components/public/public-shell";
import { SectionHeading } from "@/components/public/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDestinationBySlug, getPackagesByDestination } from "@/lib/data/public";

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();
  const packages = await getPackagesByDestination(destination.id);

  return (
    <PublicShell>
      <section className="relative min-h-[60vh] overflow-hidden bg-slate-950 text-white">
        <Image src={destination.main_image_url || "/window.svg"} alt={destination.name} fill priority className="object-cover opacity-75" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
        <div className="container-nusa relative flex min-h-[60vh] items-end py-12">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white text-slate-950 hover:bg-white">{destination.categories?.name}</Badge>
            <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">{destination.name}</h1>
            <p className="mt-4 flex items-center gap-2 text-white/80">
              <MapPin data-icon="inline-start" /> {destination.city}, {destination.province}
            </p>
          </div>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container-nusa grid gap-10 lg:grid-cols-[1fr_360px]">
          <article className="flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Tentang destinasi</h2>
              <p className="mt-4 leading-8 text-muted-foreground">{destination.description}</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Fasilitas</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {destination.facilities.map((facility) => (
                  <Badge key={facility} variant="secondary">{facility}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Galeri destinasi</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[destination.main_image_url, ...destination.gallery_urls].filter(Boolean).map((image) => (
                  <div key={image} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <Image src={image || "/window.svg"} alt={destination.name} fill className="object-cover" sizes="50vw" />
                  </div>
                ))}
              </div>
            </div>
          </article>
          <aside className="h-fit rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-xl font-semibold tracking-tight">Mulai dari paket terkait</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Pilih paket travel yang melewati {destination.name}.</p>
            <Button className="mt-5 w-full" asChild>
              <Link href="/booking">Booking Sekarang</Link>
            </Button>
          </aside>
        </div>
      </section>
      {packages.length ? (
        <section className="bg-slate-50 py-12 md:py-16">
          <div className="container-nusa flex flex-col gap-8">
            <SectionHeading title="Paket terkait" />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((item) => (
                <PackageCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </PublicShell>
  );
}
