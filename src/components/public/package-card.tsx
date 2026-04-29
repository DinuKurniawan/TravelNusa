import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Star, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { TravelPackage } from "@/types";

export function PackageCard({ item }: { item: TravelPackage }) {
  const price = item.discount_price ?? item.price;

  return (
    <Card className="group overflow-hidden p-0 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/11] overflow-hidden">
        <Image
          src={item.main_image_url || "/window.svg"}
          alt={item.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        {item.discount_price ? <Badge className="absolute left-4 top-4 bg-amber-400 text-slate-950 hover:bg-amber-400">Diskon</Badge> : null}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-white">
          <MapPin data-icon="inline-start" />
          {item.destinations?.name ?? "Indonesia"}
        </div>
      </div>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-2">
          <h3 className="line-clamp-2 text-xl font-semibold tracking-tight">{item.name}</h3>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{item.short_description ?? item.description}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock data-icon="inline-start" />
            {item.duration_days}H {item.duration_nights}M
          </span>
          <span className="flex items-center gap-1">
            <Users data-icon="inline-start" />
            {item.quota}
          </span>
          <span className="flex items-center gap-1">
            <Star data-icon="inline-start" />
            {item.rating}
          </span>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3 p-5">
        <div className="flex flex-col">
          {item.discount_price ? <span className="text-xs text-muted-foreground line-through">{formatCurrency(item.price)}</span> : null}
          <span className="text-lg font-semibold text-primary">{formatCurrency(price)}</span>
        </div>
        <Button asChild>
          <Link href={`/paket/${item.slug}`}>Booking</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
