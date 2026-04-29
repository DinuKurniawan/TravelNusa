import Image from "next/image";
import { notFound } from "next/navigation";

import { PublicShell } from "@/components/public/public-shell";
import { getBlogPostBySlug } from "@/lib/data/public";
import { formatDate } from "@/lib/utils";

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <PublicShell>
      <article>
        <section className="bg-slate-50 py-12 md:py-16">
          <div className="container-nusa max-w-4xl">
            <p className="text-sm text-muted-foreground">{post.category} • {formatDate(post.published_at)}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{post.title}</h1>
            <p className="mt-4 text-muted-foreground">Oleh {post.profiles?.full_name ?? "TravelNusa Editorial"}</p>
          </div>
        </section>
        <div className="container-nusa max-w-4xl py-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
            <Image src={post.cover_image_url || "/window.svg"} alt={post.title} fill priority className="object-cover" sizes="100vw" />
          </div>
          <div className="prose prose-slate mt-8 max-w-none text-base leading-8 text-slate-700">
            {post.content.split("\n").map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>
    </PublicShell>
  );
}
