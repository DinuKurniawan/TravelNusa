import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, CreditCard, MessageCircle, ShieldCheck, Star, Users, XCircle } from "lucide-react";

import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPackageBySlug, getPackageItineraries } from "@/lib/data/public";
import { formatCurrency } from "@/lib/utils";

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getPackageBySlug(slug);
  if (!item) notFound();
  const itineraries = await getPackageItineraries(item.id);
  const price = item.discount_price ?? item.price;

  return (
    <PublicShell>
      <section className="relative min-h-[62vh] overflow-hidden bg-slate-950 text-white">
        <Image src={item.main_image_url || "/window.svg"} alt={item.name} fill priority className="object-cover opacity-75" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        <div className="container-nusa relative flex min-h-[62vh] items-end py-12">
          <div className="max-w-4xl">
            {item.discount_price ? <Badge className="mb-4 bg-amber-400 text-slate-950 hover:bg-amber-400">Harga promo</Badge> : null}
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{item.name}</h1>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/85">
              <span className="flex items-center gap-2"><Clock data-icon="inline-start" /> {item.duration_days} hari {item.duration_nights} malam</span>
              <span className="flex items-center gap-2"><Users data-icon="inline-start" /> Kuota {item.quota}</span>
              <span className="flex items-center gap-2"><Star data-icon="inline-start" /> {item.rating} ({item.total_reviews})</span>
            </div>
          </div>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container-nusa grid gap-10 lg:grid-cols-[1fr_420px]">
          <article className="flex flex-col gap-8">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">Mulai dari</p>
              <div className="mt-1 flex flex-wrap items-end gap-3">
                <span className="text-3xl font-semibold text-primary">{formatCurrency(price)}</span>
                {item.discount_price ? <span className="text-muted-foreground line-through">{formatCurrency(item.price)}</span> : null}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Deskripsi paket</h2>
              <p className="mt-4 leading-8 text-muted-foreground">{item.description}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Termasuk</h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {item.included.map((value) => (
                    <li key={value} className="flex gap-2 text-sm text-muted-foreground"><CheckCircle2 className="text-primary" /> {value}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Tidak termasuk</h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {item.excluded.map((value) => (
                    <li key={value} className="flex gap-2 text-sm text-muted-foreground"><XCircle className="text-destructive" /> {value}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Itinerary</h2>
              <div className="mt-5 flex flex-col gap-4">
                {itineraries.map((itinerary) => (
                  <div key={itinerary.id} className="rounded-xl border bg-card p-5">
                    <p className="text-sm font-semibold text-primary">Hari {itinerary.day_number}</p>
                    <h3 className="mt-1 text-lg font-semibold">{itinerary.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{itinerary.description}</p>
                    <p className="mt-3 text-xs text-muted-foreground">{itinerary.time} • {itinerary.location}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Galeri paket</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[item.main_image_url, ...item.gallery_urls].filter(Boolean).map((image) => (
                  <div key={image} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <Image src={image || "/window.svg"} alt={item.name} fill className="object-cover" sizes="50vw" />
                  </div>
                ))}
              </div>
            </div>
          </article>
          <aside className="flex h-fit flex-col gap-4">
            <div className="soft-card flex flex-col gap-5 p-5 md:p-6">
              <div>
                <p className="text-sm text-muted-foreground">Mulai dari</p>
                <p className="mt-1 text-3xl font-semibold text-primary">{formatCurrency(price)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Total akan dihitung otomatis berdasarkan jumlah peserta.
                </p>
              </div>
              <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <ShieldCheck data-icon="inline-start" />
                  Pembayaran aman via Midtrans
                </p>
                <p className="mt-2 leading-6">
                  Booking disimpan sebagai pending payment sebelum Snap dibuka. Tiket diterbitkan otomatis setelah pembayaran berhasil.
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href={`/booking/${item.slug}`}>
                  <CreditCard data-icon="inline-start" />
                  Booking Sekarang
                </Link>
              </Button>
            </div>
            <Button variant="outline" asChild>
              <Link href="https://wa.me/6281234567890" target="_blank">
                <MessageCircle data-icon="inline-start" />
                Tanya via WhatsApp
              </Link>
            </Button>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}
