"use client";

import Link from "next/link";
import { Menu, UserRound } from "lucide-react";

import { SiteLogo } from "@/components/shared/site-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  ["Destinasi", "/destinasi"],
  ["Paket", "/paket"],
  ["Galeri", "/galeri"],
  ["Blog", "/blog"],
  ["Kontak", "/kontak"],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
      <div className="container-nusa flex h-16 items-center justify-between gap-4">
        <SiteLogo />
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map(([label, href]) => (
            <Button key={href} variant="ghost" asChild>
              <Link href={href}>{label}</Link>
            </Button>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="outline" asChild>
            <Link href="/login">
              <UserRound data-icon="inline-start" />
              Login
            </Link>
          </Button>
          <Button asChild>
            <Link href="/booking">Booking Sekarang</Link>
          </Button>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden" aria-label="Buka menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-6">
            <SheetTitle className="sr-only">Navigasi TravelNusa</SheetTitle>
            <div className="flex flex-col gap-6">
              <SiteLogo />
              <nav className="flex flex-col gap-2">
                {navItems.map(([label, href]) => (
                  <Button key={href} variant="ghost" className="justify-start" asChild>
                    <Link href={href}>{label}</Link>
                  </Button>
                ))}
              </nav>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href="/booking">Booking Sekarang</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/login">Login / Register</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
