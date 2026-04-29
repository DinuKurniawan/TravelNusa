import Link from "next/link";
import { Compass } from "lucide-react";

import { cn } from "@/lib/utils";

export function SiteLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Compass data-icon="inline-start" />
      </span>
      <span className="leading-tight">
        <span className="block text-base">TravelNusa</span>
        <span className="block text-xs font-medium text-muted-foreground">Indonesia</span>
      </span>
    </Link>
  );
}
