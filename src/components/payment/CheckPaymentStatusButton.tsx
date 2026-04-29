"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CheckPaymentStatusButton({
  bookingCode,
  variant = "outline",
}: {
  bookingCode: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleCheck() {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/payments/status/${bookingCode}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as { redirect_to?: string; message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Gagal mengecek status pembayaran.");
      }

      toast.success("Status pembayaran diperbarui.");
      router.push(data.redirect_to ?? `/payment/${bookingCode}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengecek status pembayaran.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button type="button" variant={variant} onClick={handleCheck} disabled={isLoading}>
      <RefreshCw data-icon="inline-start" className={isLoading ? "animate-spin" : ""} />
      {isLoading ? "Mengecek..." : "Cek Status Pembayaran"}
    </Button>
  );
}
