import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { PublicShell } from "@/components/public/public-shell";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getBlogPosts } from "@/lib/data/public";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog Travel",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const posts = await getBlogPosts(params);
  const categories = Array.from(new Set(posts.map((item) => item.category).filter(Boolean)));

  return (
    <PublicShell>
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="container-nusa flex flex-col gap-8">
          <SectionHeading title="Blog Travel" description="Artikel inspirasi, tips, dan panduan perjalanan Indonesia." />
          <form className="grid gap-3 rounded-xl border bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_auto]">
            <Input name="search" placeholder="Cari artikel..." defaultValue={String(params.search ?? "")} />
            <select name="category" defaultValue={String(params.category ?? "all")} className="h-8 rounded-lg border border-input bg-background px-2 text-sm">
              <option value="all">Semua kategori</option>
              {categories.map((category) => (
                <option key={category} value={category ?? ""}>{category}</option>
              ))}
            </select>
            <Button type="submit">Cari</Button>
          </form>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container-nusa grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden p-0">
              <div className="relative aspect-[16/10]">
                <Image src={post.cover_image_url || "/window.svg"} alt={post.title} fill className="object-cover" sizes="33vw" />
              </div>
              <CardContent className="flex flex-col gap-3 p-5">
                <p className="text-xs text-muted-foreground">{formatDate(post.published_at)} • {post.category}</p>
                <h2 className="line-clamp-2 text-xl font-semibold tracking-tight">{post.title}</h2>
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
                <Button className="mt-2 w-fit" variant="outline" asChild>
                  <Link href={`/blog/${post.slug}`}>Baca Artikel</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
