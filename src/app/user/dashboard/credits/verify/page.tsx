"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VerifyCreditCheckoutPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      const canceled = searchParams.get("canceled") === "1";

      if (!sessionId) {
        toast({
          title: "Error",
          description: "Missing checkout session. Please try again.",
          variant: "destructive"
        });
        router.replace("/user/dashboard/credits?payment=failed");
        return;
      }

      try {
        const response = await fetch("/api/users/credits/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId, canceled }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || "Unable to verify payment.");
        }

        if (payload?.status === "completed") {
          toast({
            title: "Success",
            description: "Payment verified. Credits added successfully.",
            variant: "default"
          });
          router.replace("/user/dashboard");
          return;
        }

        if (payload?.status === "failed") {
          toast({
            title: "Error",
            description: "Payment failed or was canceled.",
            variant: "destructive"
          });
          router.replace("/user/dashboard/credits?payment=failed");
          return;
        }

        toast({
          title: "Info",
          description: "Payment is still processing. Please refresh in a moment.",
          variant: "default"
        });
        router.replace("/user/dashboard/credits?payment=pending");
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unable to verify payment status.";
        toast({
          title: "Error",
          description: message,
          variant: "destructive"
        });
        router.replace("/user/dashboard/credits?payment=failed");
      }
    };

    verifyPayment();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-rose-500/20 bg-black/20 p-6 text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10">
          <Loader2 className="h-5 w-5 animate-spin text-rose-300" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">Verifying Payment</h1>
        <p className="mt-2 text-sm text-foreground/70">
          Please wait while we confirm your Stripe payment and update your credits.
        </p>
      </div>
    </main>
  );
};

const VerifyCreditCheckoutPage = () => {
  return (
    <Suspense fallback={<main className="p-4 text-sm text-foreground/70 sm:p-6">Loading payment verification...</main>}>
      <VerifyCreditCheckoutPageContent />
    </Suspense>
  );
};

export default VerifyCreditCheckoutPage;
