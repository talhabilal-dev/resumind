"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, ArrowRight, Brain, CheckCircle2, Mail, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { forgotPasswordEmailSchema } from "@/schemas/userSchema";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

    const { toast } = useToast();

  const validateEmail = (value: string): string | null => {
    const parsed = forgotPasswordEmailSchema.safeParse({ email: value.trim() });
    if (!parsed.success) {
      return parsed.error.issues[0]?.message || "Invalid email address";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      toast({
        title: "Error",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users/forgot-password/sent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to send reset link.");
      }

      setIsSuccess(true);
      toast({
        title: "Success",
        description: "Reset link sent. Please check your email.",
        variant: "default"
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
        <div className="w-full max-w-2xl rounded-2xl glow-card bg-background/60 p-6 backdrop-blur-md sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg gradient-accent">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Reset your password</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-foreground/70 sm:text-base">
              Enter your email and we&apos;ll send you a secure reset link.
            </p>
          </div>

          {isSuccess ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="font-medium text-emerald-200">Reset email sent</p>
                    <p className="mt-1 text-sm text-foreground/70">
                      We sent a password reset link to <span className="text-foreground">{email}</span>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-rose-500/20 bg-white/5 p-4 text-sm text-foreground/75">
                <p className="font-medium text-foreground mb-2">Next steps</p>
                <p>1. Open your inbox and click the reset link.</p>
                <p>2. If you don&apos;t see it, check your spam folder.</p>
                <p>3. Return here if you need to resend the email.</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSuccess(false)}
                  className="border border-rose-500/30 bg-white/5 text-foreground hover:bg-white/10"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Resend Email
                </Button>
                <Button
                  type="button"
                  className="gradient-accent border-0 text-white"
                  onClick={() => router.push("/user/login")}
                >
                  Back to Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm text-foreground/80">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    className={`w-full rounded-lg border bg-white/5 px-4 py-2.5 pr-10 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40 ${
                      error ? "border-red-500/70" : "border-rose-500/25"
                    }`}
                  />
                  <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/55" />
                </div>
                {error && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full gradient-accent border-0 text-white"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-foreground/65">
            Remember your password?{" "}
            <Link href="/user/login" className="font-medium text-rose-300 hover:text-rose-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
