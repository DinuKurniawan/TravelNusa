import Link from "next/link";
import { Camera, Globe2, Mail, MapPin, Phone, Send } from "lucide-react";

import { SiteLogo } from "@/components/shared/site-logo";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  return (
    <footer className="border-t bg-slate-950 text-white">
      <div className="container-nusa grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <SiteLogo className="text-white [&_span:last-child]:text-white/70" />
          <p className="max-w-sm text-sm leading-6 text-white/70">
            TravelNusa Indonesia membantu Anda merancang liburan Nusantara dengan paket terkurasi, admin responsif, dan itinerary yang rapi.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="icon" aria-label="Instagram">
              <Camera />
            </Button>
            <Button variant="secondary" size="icon" aria-label="Facebook">
              <Globe2 />
            </Button>
            <Button variant="secondary" size="icon" aria-label="TikTok">
              <Send />
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Jelajah</h2>
          {[
            ["Destinasi", "/destinasi"],
            ["Paket Travel", "/paket"],
            ["Galeri", "/galeri"],
            ["Blog", "/blog"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="text-sm text-white/70 transition hover:text-white">
              {label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Akun</h2>
          {[
            ["Login", "/login"],
            ["Register", "/register"],
            ["Dashboard", "/dashboard"],
            ["Booking", "/booking"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="text-sm text-white/70 transition hover:text-white">
              {label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Kontak</h2>
          <p className="flex items-center gap-2 text-sm text-white/70">
            <Mail data-icon="inline-start" /> info@travelnusa.id
          </p>
          <p className="flex items-center gap-2 text-sm text-white/70">
            <Phone data-icon="inline-start" /> +62 812-3456-7890
          </p>
          <p className="flex items-center gap-2 text-sm text-white/70">
            <MapPin data-icon="inline-start" /> Jakarta, Indonesia
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4">
        <div className="container-nusa flex flex-col justify-between gap-2 text-xs text-white/60 sm:flex-row">
          <span>© 2026 TravelNusa Indonesia. All rights reserved.</span>
          <span>Development admin password wajib diganti saat production.</span>
        </div>
      </div>
    </footer>
  );
}
