"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { GalleryItem } from "@/types";

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl text-left shadow-sm ring-1 ring-border"
          >
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="text-xs text-white/70">{item.category}</p>
            </div>
          </button>
        ))}
      </div>
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">{selected?.title ?? "Preview galeri"}</DialogTitle>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-3 top-3"
            onClick={() => setSelected(null)}
            aria-label="Tutup preview"
          >
            <X />
          </Button>
          {selected ? (
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
              <Image src={selected.image_url} alt={selected.title} fill className="object-cover" sizes="90vw" />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
