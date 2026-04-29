import Link from "next/link";
import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { ContactForm } from "@/components/forms/contact-form";
import { PublicShell } from "@/components/public/public-shell";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Kontak",
};

export default function ContactPage() {
  return (
    <PublicShell>
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="container-nusa">
          <SectionHeading title="Kontak TravelNusa" description="Hubungi kami untuk private trip, paket keluarga, honeymoon, atau perjalanan rombongan." />
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container-nusa grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col gap-4">
            {[
              [Mail, "Email", "info@travelnusa.id"],
              [Phone, "Telepon", "+62 812-3456-7890"],
              [MapPin, "Alamat", "Jakarta, Indonesia"],
            ].map(([Icon, title, value]) => (
              <Card key={String(title)}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon />
                  </div>
                  <div>
                    <p className="font-semibold">{title as string}</p>
                    <p className="text-sm text-muted-foreground">{value as string}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button asChild>
              <Link href="https://wa.me/6281234567890" target="_blank">
                <MessageCircle data-icon="inline-start" />
                WhatsApp Admin
              </Link>
            </Button>
            <div className="flex aspect-[4/3] items-center justify-center rounded-xl border bg-slate-100 text-sm text-muted-foreground">
              Google Maps Embed Placeholder
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </PublicShell>
  );
}
