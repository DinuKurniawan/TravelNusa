"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

type CreatePaymentResponse = {
  snap_token?: string;
  message?: string;
};

export function MidtransPayButton({
  bookingId,
  bookingCode,
  clientKey,
  scriptUrl,
  className,
  disabled = false,
}: {
  bookingId: string;
  bookingCode: string;
  clientKey: string;
  scriptUrl: string;
  className?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const scriptPromiseRef = useRef<Promise<void> | null>(null);

  function loadSnapScript() {
    const existing = document.getElementById("midtrans-snap-script") as HTMLScriptElement | null;
    if (existing && window.snap) {
      return Promise.resolve();
    }

    if (!scriptPromiseRef.current) {
      scriptPromiseRef.current = new Promise((resolve, reject) => {
        const script = existing ?? document.createElement("script");
        script.id = "midtrans-snap-script";
        script.src = scriptUrl;
        script.async = true;
        script.setAttribute("data-client-key", clientKey);
        script.onload = () => {
          resolve();
        };
        script.onerror = () => reject(new Error("Gagal memuat Midtrans Snap."));

        if (!existing) {
          document.body.appendChild(script);
        }
      });
    }

    return scriptPromiseRef.current;
  }

  async function checkStatus(fallbackPath: string) {
    try {
      const response = await fetch(`/api/payments/status/${bookingCode}`, {
        method: "GET",
        cache: "no-store",
      });
      const data = (await response.json()) as { redirect_to?: string; message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Gagal mengecek status pembayaran.");
      }

      router.push(data.redirect_to ?? fallbackPath);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengecek status pembayaran.");
      router.push(fallbackPath);
    }
  }

  async function handlePay() {
    if (!clientKey) {
      toast.error("NEXT_PUBLIC_MIDTRANS_CLIENT_KEY belum dikonfigurasi.");
      return;
    }

    setIsLoading(true);

    try {
      await loadSnapScript();

      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const data = (await response.json()) as CreatePaymentResponse;

      if (!response.ok || !data.snap_token) {
        throw new Error(data.message ?? "Gagal membuat transaksi pembayaran.");
      }

      if (!window.snap) {
        throw new Error("Midtrans Snap belum siap.");
      }

      window.snap.pay(data.snap_token, {
        onSuccess: () => {
          toast.success("Pembayaran diproses. Memeriksa status terbaru...");
          void checkStatus(`/payment/success/${bookingCode}`);
        },
        onPending: () => {
          toast.message("Pembayaran menunggu penyelesaian.");
          void checkStatus(`/payment/pending/${bookingCode}`);
        },
        onError: () => {
          toast.error("Pembayaran gagal diproses.");
          router.push(`/payment/failed/${bookingCode}`);
        },
        onClose: () => {
          toast.message("Popup pembayaran ditutup. Booking masih menunggu pembayaran.");
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuka pembayaran.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      size="lg"
      className={cn("w-full", className)}
      disabled={disabled || isLoading}
      onClick={handlePay}
    >
      {isLoading ? <RefreshCw data-icon="inline-start" className="animate-spin" /> : <CreditCard data-icon="inline-start" />}
      {isLoading ? "Memproses..." : "Bayar Sekarang"}
    </Button>
  );
}
