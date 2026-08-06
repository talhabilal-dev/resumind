"use client";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Brain, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

const VerifyEmailPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/users/user-verify/sent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong");

      toast({
        title: "Success",
        description: "Verification link sent! Check your email.",
        variant: "default"
      });
      setSent(true);
      setEmail("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send email.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="fixed inset-0 aurora-bg -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-linear-to-b from-rose-900/30 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-linear-to-l from-pink-900/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-linear-to-t from-rose-900/20 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-2xl bg-background/60 p-6 backdrop-blur-md glow-card sm:p-8">
          <Link
            href="/user/login"
            className="mb-6 inline-flex items-center gap-2 text-sm text-foreground/70 transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>

          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg gradient-accent">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Email Verification</h1>
            <p className="mt-1 text-sm text-foreground/65">
              Enter your email to receive a verification link.
            </p>
          </div>

          {sent ? (
            <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4 text-center">
              <MailCheck className="mx-auto mb-2 h-8 w-8 text-emerald-300" />
              <p className="text-sm text-emerald-100">
                Verification link sent. Check your inbox and spam folder.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 border-rose-500/30 text-foreground hover:bg-white/10"
                onClick={() => setSent(false)}
              >
                Send another link
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm text-foreground/80">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full border-0 text-white gradient-accent"
              >
                {loading ? "Sending..." : "Send Verification Link"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
