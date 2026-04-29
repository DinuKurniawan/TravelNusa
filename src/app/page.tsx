import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Headphones, ShieldCheck, Sparkles } from "lucide-react";

import { DestinationCard } from "@/components/public/destination-card";
import { PackageCard } from "@/components/public/package-card";
import { PublicShell } from "@/components/public/public-shell";
import { SectionHeading } from "@/components/public/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getDestinations, getGallery, getPackages, getTestimonials } from "@/lib/data/public";

export default async function HomePage() {
  const [destinations, packages, testimonials, gallery] = await Promise.all([
    getDestinations({ featured: true }),
    getPackages({ featured: true }),
    getTestimonials(),
    getGallery(),
  ]);

  return (
    <PublicShell>
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-white">
        <Image
          src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2200&q=85"
          alt="Destinasi tropis Indonesia"
          fill
          priority
          className="object-cover opacity-70"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/65 to-slate-950/10" />
        <div className="container-nusa relative flex min-h-[calc(100vh-4rem)] items-center py-16">
          <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="flex max-w-3xl flex-col gap-7">
              <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
                TravelNusa Indonesia
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/80">
                Jelajahi Bali, Lombok, Labuan Bajo, Yogyakarta, Raja Ampat, Bromo, dan destinasi Nusantara lain dengan itinerary terkurasi dan proses booking yang rapi.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/paket">
                    Lihat Paket
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/kontak">Konsultasi WhatsApp</Link>
                </Button>
              </div>
            </div>
            <form action="/paket" className="rounded-xl bg-white p-4 text-slate-950 shadow-2xl shadow-slate-950/30">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Input name="search" placeholder="Cari Bali, Bromo, Labuan Bajo..." className="h-11" />
                <Button type="submit" size="lg">Cari Paket</Button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-2xl font-semibold text-primary">6+</p>
                  <p className="text-muted-foreground">Destinasi</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3">
                  <p className="text-2xl font-semibold text-amber-700">24/7</p>
                  <p className="text-muted-foreground">Admin</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-3">
                  <p className="text-2xl font-semibold text-slate-900">4.9</p>
                  <p className="text-muted-foreground">Rating</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-nusa flex flex-col gap-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <SectionHeading title="Destinasi Populer" description="Pilihan destinasi favorit dengan akses mudah, rute nyaman, dan pengalaman lokal yang kuat." />
            <Button variant="outline" asChild>
              <Link href="/destinasi">Semua Destinasi</Link>
            </Button>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {destinations.slice(0, 6).map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 md:py-24">
        <div className="container-nusa flex flex-col gap-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <SectionHeading title="Paket Travel Unggulan" description="Paket terkurasi lengkap dengan harga transparan, durasi jelas, kuota, rating, dan tombol booking cepat." />
            <Button variant="outline" asChild>
              <Link href="/paket">Semua Paket</Link>
            </Button>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {packages.slice(0, 6).map((item) => (
              <PackageCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-nusa grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHeading title="Kenapa memilih kami" description="Kami menggabungkan pengalaman lokal, rute efisien, dan proses operasional yang jelas untuk perjalanan yang lebih tenang." />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [BadgeCheck, "Itinerary terkurasi", "Rute disusun agar waktu perjalanan efisien dan tetap nyaman."],
              [ShieldCheck, "Transaksi jelas", "Harga, fasilitas termasuk, dan yang tidak termasuk ditampilkan transparan."],
              [Headphones, "Admin responsif", "Tim siap membantu sebelum, selama, dan setelah perjalanan."],
              [Sparkles, "Pengalaman lokal", "Guide lokal membantu Anda menikmati detail yang sering terlewat."],
            ].map(([Icon, title, desc]) => (
              <Card key={String(title)}>
                <CardContent className="flex gap-4 p-5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon />
                  </div>
                  <div>
                    <h3 className="font-semibold">{title as string}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{desc as string}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white md:py-24">
        <div className="container-nusa grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="flex flex-col gap-5">
            <SectionHeading title="Galeri Nusantara" description="Cuplikan suasana destinasi Indonesia dari pantai, pegunungan, kota budaya, hingga laut timur." />
            <Button variant="secondary" className="w-fit" asChild>
              <Link href="/galeri">Buka Galeri</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {gallery.slice(0, 4).map((item) => (
              <div key={item.id} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="(min-width: 1024px) 25vw, 50vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-nusa flex flex-col gap-10">
          <SectionHeading title="Cerita pelanggan" description="Beberapa pengalaman dari traveler yang sudah mempercayakan rencana liburannya ke TravelNusa." align="center" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <div>
                    <Badge variant="secondary">Rating {item.rating}/5</Badge>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">&ldquo;{item.content}&rdquo;</p>
                  <p className="mt-auto font-semibold">{item.customer_name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container-nusa">
          <div className="overflow-hidden rounded-xl bg-primary p-8 text-primary-foreground md:p-12">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">Siap merancang perjalanan Indonesia berikutnya?</h2>
                <p className="mt-3 max-w-2xl text-primary-foreground/80">Kirim booking atau konsultasikan kebutuhan trip keluarga, honeymoon, company outing, dan private tour.</p>
              </div>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/booking">Booking Sekarang</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
