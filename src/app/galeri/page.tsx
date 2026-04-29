import type { Metadata } from "next";

import { GalleryGrid } from "@/components/public/gallery-grid";
import { PublicShell } from "@/components/public/public-shell";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import { getGallery } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Galeri Wisata",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const items = await getGallery(params.category);
  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));

  return (
    <PublicShell>
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="container-nusa flex flex-col gap-6">
          <SectionHeading title="Galeri Wisata" description="Preview foto destinasi Indonesia dengan lightbox." />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild><a href="/galeri">Semua</a></Button>
            {categories.map((category) => (
              <Button key={category} variant="outline" asChild><a href={`/galeri?category=${encodeURIComponent(category ?? "")}`}>{category}</a></Button>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container-nusa">
          <GalleryGrid items={items} />
        </div>
      </section>
    </PublicShell>
  );
}
