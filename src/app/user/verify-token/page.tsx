"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { VerificationState } from "@/types";

function VerifyTokenPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verification, setVerification] = useState<VerificationState>({
    status: "loading",
    message: "Verifying your token...",
  });

  const token = searchParams.get("token");
  const type = searchParams.get("type") || "email";

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerification({
          status: "error",
          message: "Invalid verification link. Token is missing.",
        });
        return;
      }

      try {
        const response = await fetch("/api/users/user-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setVerification({
            status: "success",
            message:
              type === "email"
                ? "Email verified successfully! You can now log in."
                : "Token verified! You can now reset your password.",
          });

          // Auto-redirect after short delay
          setTimeout(() => {
            router.push("/user/login");
          }, 3000);
        } else {
          const data = await response.json();
          setVerification({
            status: data.status === "expired" ? "expired" : "error",
            message: data.error || "Verification failed.",
          });
        }
      } catch (error) {
        setVerification({
          status: "error",
          message: "Network error. Please try again.",
        });
      }
    };

    verifyToken();
  }, [token, type, router]);

  const getIconForStatus = () => {
    switch (verification.status) {
      case "loading":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10">
            <Loader2 className="h-6 w-6 animate-spin text-rose-300" />
          </div>
        );
      case "success":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-6 w-6 text-emerald-300" />
          </div>
        );
      case "error":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
            <XCircle className="h-6 w-6 text-red-300" />
          </div>
        );
      case "expired":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15">
            <AlertTriangle className="h-6 w-6 text-amber-300" />
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="fixed inset-0 aurora-bg -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-linear-to-b from-rose-900/30 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-linear-to-l from-pink-900/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-linear-to-t from-rose-900/20 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-[80vh] w-full max-w-4xl items-center justify-center">
        <div className="w-full max-w-2xl rounded-2xl glow-card bg-background/60 p-7 text-center backdrop-blur-md sm:p-9">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg gradient-accent">
            <Brain className="h-6 w-6 text-white" />
          </div>

          <div className="mb-5 flex justify-center">{getIconForStatus()}</div>

          <h2 className="text-2xl font-semibold text-foreground mb-3">
            {type === "email" ? "Email Verification" : "Password Reset Verification"}
          </h2>

          <p className="text-sm text-foreground/70 mb-6">{verification.message}</p>

          {verification.status === "loading" && (
            <p className="text-sm text-foreground/55">This may take a few moments...</p>
          )}

          {verification.status === "success" && (
            <p className="text-sm text-emerald-300">Redirecting you shortly...</p>
          )}

          <div className="mt-6">
            <Button
              type="button"
              onClick={() => router.push("/user/login")}
              className="w-full gradient-accent border-0 text-white"
            >
              Go to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyTokenPage() {
  return (
    <Suspense fallback={<main className="p-4 text-sm text-foreground/70 sm:p-6">Loading token verification...</main>}>
      <VerifyTokenPageContent />
    </Suspense>
  );
}
