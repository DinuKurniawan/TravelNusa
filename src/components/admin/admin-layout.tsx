import Link from "next/link";
import {
  BookOpen,
  CalendarCheck,
  Gauge,
  Images,
  LayoutDashboard,
  LogOut,
  Map,
  MessageSquareQuote,
  PackageOpen,
  Settings,
  Tags,
  Users,
} from "lucide-react";

import { logoutAction } from "@/actions/auth.actions";
import { SiteLogo } from "@/components/shared/site-logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  [LayoutDashboard, "Dashboard", "/admin"],
  [Map, "Destinasi", "/admin/destinasi"],
  [Tags, "Kategori", "/admin/kategori"],
  [PackageOpen, "Paket", "/admin/paket"],
  [CalendarCheck, "Booking", "/admin/booking"],
  [Images, "Galeri", "/admin/galeri"],
  [BookOpen, "Blog", "/admin/blog"],
  [MessageSquareQuote, "Testimoni", "/admin/testimoni"],
  [Users, "Users", "/admin/users"],
  [Settings, "Settings", "/admin/settings"],
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r bg-white lg:flex">
        <div className="p-5">
          <SiteLogo />
        </div>
        <Separator />
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map(([Icon, label, href]) => (
            <Button key={String(href)} variant="ghost" className="justify-start" asChild>
              <Link href={href as string}>
                <Icon data-icon="inline-start" />
                {label as string}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="p-4">
          <form action={logoutAction}>
            <Button type="submit" variant="outline" className="w-full justify-start">
              <LogOut data-icon="inline-start" />
              Logout
            </Button>
          </form>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <Gauge className="text-primary" />
              <span className="font-semibold">Admin TravelNusa</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm text-muted-foreground">TravelNusa Indonesia Admin</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">Lihat Website</Link>
            </Button>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
