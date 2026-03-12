"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Brain, CheckCircle2, Mail, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function VerifySentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isResending, setIsResending] = useState(false);

  const email = useMemo(() => {
    const value = searchParams.get("email");
    return value ? value.trim() : "";
  }, [searchParams]);

  const handleResend = async () => {
    if (!email) {
      toast.error("Email address is missing. Please register again.");
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch("/api/users/user-verify/sent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to resend verification email.");
      }

      toast.success("Verification email resent. Check your inbox.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setIsResending(false);
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
        <div className="w-full max-w-2xl rounded-2xl glow-card bg-background/60 p-6 text-center backdrop-blur-md sm:p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg gradient-accent">
            <Brain className="h-7 w-7 text-white" />
          </div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-white/5 px-3 py-1.5 text-xs text-foreground/75">
            <CheckCircle2 className="h-4 w-4 text-rose-300" />
            Account created successfully
          </div>

          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Verification Email Sent
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-foreground/70">
            We sent a verification link to your email address. Please click the link in your inbox to verify your account before logging in.
          </p>

          {email && (
            <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-lg border border-rose-500/20 bg-white/5 px-4 py-2 text-sm text-foreground/85">
              <Mail className="h-4 w-4 text-rose-300" />
              {email}
            </p>
          )}

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              variant="outline"
              className="w-full border border-rose-500/30 bg-white/5 text-foreground hover:bg-white/10 sm:w-auto"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              {isResending ? "Resending..." : "Resend Email"}
            </Button>

            <Button
              type="button"
              className="w-full gradient-accent border-0 sm:w-auto"
              onClick={() => router.push("/user/login")}
            >
              I Have Verified, Continue to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p className="mt-5 text-sm text-foreground/60">
            Wrong email or no inbox access?{" "}
            <Link href="/user/register" className="text-rose-300 hover:text-rose-200">
              Create account again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
