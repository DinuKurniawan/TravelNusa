import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Destination } from "@/types";

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Card className="group overflow-hidden p-0 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={destination.main_image_url || "/window.svg"}
          alt={destination.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
        {destination.categories?.name ? (
          <Badge className="absolute left-4 top-4 bg-white/90 text-slate-900 hover:bg-white">{destination.categories.name}</Badge>
        ) : null}
      </div>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold tracking-tight">{destination.name}</h3>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin data-icon="inline-start" />
            {destination.city}, {destination.province}
          </p>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{destination.description}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/destinasi/${destination.slug}`}>Lihat Detail</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
