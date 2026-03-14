"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, Brain, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resetPasswordSchema } from "@/schemas/userSchema";

function VerifyResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): string | null => {
    if (!token) {
      return "Invalid or missing token.";
    }

    const parsed = resetPasswordSchema.safeParse({
      token,
      password,
    });

    if (!parsed.success) {
      return parsed.error.issues[0]?.message || "Invalid password reset payload.";
    }

    if (!confirmPassword) {
      return "Please confirm your password.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/users/forgot-password/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to reset password.");
      }

      setIsSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="relative min-h-screen bg-background overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
        <div className="fixed inset-0 aurora-bg -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-linear-to-b from-rose-900/30 via-transparent to-transparent blur-3xl" />
          <div className="absolute top-40 right-0 w-96 h-96 bg-linear-to-l from-pink-900/20 via-transparent to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-linear-to-t from-rose-900/20 via-transparent to-transparent blur-3xl" />
        </div>

        <div className="mx-auto flex min-h-[80vh] w-full max-w-3xl items-center justify-center">
          <div className="w-full max-w-lg rounded-2xl glow-card bg-background/60 p-7 text-center backdrop-blur-md sm:p-9">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-300" />
            <h1 className="text-2xl font-bold text-foreground">Invalid Reset Link</h1>
            <p className="mt-2 text-foreground/70">This password reset link is missing a valid token or may have expired.</p>
            <Button className="mt-5 gradient-accent border-0 text-white" onClick={() => router.push("/user/reset-password")}>Request New Link</Button>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Set a new password</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-foreground/70 sm:text-base">
              Choose a secure password to regain access to your account.
            </p>
          </div>

          {isSuccess ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="font-medium text-emerald-200">Password updated</p>
                    <p className="mt-1 text-sm text-foreground/70">
                      Your password has been reset successfully. You can now sign in.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                className="w-full gradient-accent border-0 text-white"
                onClick={() => router.push("/user/login")}
              >
                Go to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="mb-1 block text-sm text-foreground/80">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className={`w-full rounded-lg border bg-white/5 px-4 py-2.5 pr-11 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40 ${
                      error ? "border-red-500/70" : "border-rose-500/25"
                    }`}
                    placeholder="At least 6 characters"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/60 hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-sm text-foreground/80">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className={`w-full rounded-lg border bg-white/5 px-4 py-2.5 pr-11 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40 ${
                      error ? "border-red-500/70" : "border-rose-500/25"
                    }`}
                    placeholder="Re-enter password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/60 hover:text-foreground"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full gradient-accent border-0 text-white"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
                {!isLoading && <Lock className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-foreground/65">
            Back to{" "}
            <Link href="/user/login" className="font-medium text-rose-300 hover:text-rose-200">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyResetPasswordPage() {
  return (
    <Suspense fallback={<main className="p-4 text-sm text-foreground/70 sm:p-6">Loading reset form...</main>}>
      <VerifyResetPasswordPageContent />
    </Suspense>
  );
}
