"use client";

import React from "react";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BadgeDollarSign, Check, CreditCard, Sparkles } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { type CreditPackId } from "@/schemas/creditsSchema";

type CreditFeature = {
  name: string;
  credits: number;
  proposition: string;
};

type CreditPack = {
  id: CreditPackId;
  name: string;
  credits: number;
  priceUsd: number;
  highlighted?: boolean;
};

const FEATURE_COSTS: CreditFeature[] = [
  {
    name: "Full Resume Analysis",
    credits: 5,
    proposition: "Parsing, ATS score, and suggestions.",
  },
  {
    name: "Job Description Match",
    credits: 3,
    proposition: "Specific alignment analysis.",
  },
  {
    name: "Cover Letter Generator",
    credits: 4,
    proposition: "High-value, time-saving document.",
  },
  {
    name: "Bullet Point Optimization",
    credits: 1,
    proposition: "Small, granular improvements.",
  },
  {
    name: "Full Resume Rewrite",
    credits: 8,
    proposition: "Heavy token usage; high manual effort saved.",
  },
];

const CREDIT_PACKS: CreditPack[] = [
  { id: "starter", name: "Starter", credits: 50, priceUsd: 5 },
  { id: "growth", name: "Growth", credits: 150, priceUsd: 15, highlighted: true },
  { id: "pro", name: "Pro", credits: 400, priceUsd: 40 },
];

const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

const CreditsPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [isCheckingOutPack, setIsCheckingOutPack] = useState<CreditPackId | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  const { toast } = useToast();

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/users/profile");
      const payload = await response.json();
      if (response.ok && payload?.user && typeof payload.user.credits === "number") {
        setCredits(payload.user.credits);
      }
    } catch {
      // Keep checkout flow functional even if profile fetch fails.
    }
  };

  useEffect(() => {
    fetchCredits();

    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "failed") {
      toast({
        title: "Error",
        description: "Payment failed or was canceled.",
        variant: "destructive"
      });
      return;
    }

    if (paymentStatus === "pending") {
      toast({
        title: "Info",
        description: "Payment is still processing. Please check again shortly.",
        variant: "default"
      });
      return;
    }

    if (searchParams.get("success") === "1") {
      toast({
        title: "Success",
        description: "Payment successful. Credits updated.",
        variant: "default"
      });
      return;
    }

    if (searchParams.get("canceled") === "1") {
      toast({
        title: "Info",
        description: "Checkout canceled.",
        variant: "default"
      });
    }
  }, [searchParams]);

  const onStripeCheckout = async (pack: CreditPack) => {
    setIsCheckingOutPack(pack.id);
    try {
      const response = await fetch("/api/users/credits/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packId: pack.id }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.checkoutUrl) {
        throw new Error(payload?.error || "Unable to start checkout.");
      }

      window.location.href = payload.checkoutUrl;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Stripe checkout failed.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsCheckingOutPack(null);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-rose-500/10 bg-background/70 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="border border-rose-500/20 bg-white/5 hover:bg-white/10" />
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">Buy Credits</h1>
            <p className="text-sm text-foreground/65">
              Purchase usage credits and pay only for the resume actions you need.
            </p>
          </div>
        </div>
      </header>

      <main className="space-y-6 p-4 sm:p-6">
        <section className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Current Balance</h2>
          <p className="mt-1 text-sm text-foreground/65">Your usable credit balance for resume tasks.</p>
          <div className="mt-3 flex items-end gap-2">
            <p className="text-3xl font-bold text-foreground">{credits === null ? "--" : credits}</p>
            <p className="pb-1 text-xs text-foreground/60">
              {credits === null
                ? "Loading balance..."
                : `~$${(credits * 0.1).toFixed(2)} value at 1 credit = $0.10`}
            </p>
          </div>
        </section>

        <section className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Credit Packs</h2>
          <p className="mt-1 text-sm text-foreground/65">
            Buy credits securely with Stripe checkout.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {CREDIT_PACKS.map((pack) => (
              <article
                key={pack.name}
                className={[
                  "rounded-xl border p-4",
                  pack.highlighted
                    ? "border-rose-400/45 bg-rose-500/10"
                    : "border-rose-500/20 bg-black/20",
                ].join(" ")}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">{pack.name}</h3>
                  {pack.highlighted && (
                    <span className="rounded-full border border-rose-300/50 bg-rose-500/20 px-2 py-0.5 text-xs text-rose-100">
                      Popular
                    </span>
                  )}
                </div>

                <p className="text-2xl font-bold text-foreground">{pack.credits} Credits</p>
                <p className="mt-1 text-sm text-foreground/70">{formatUsd(pack.priceUsd)}</p>

                <ul className="mt-3 space-y-2 text-sm text-foreground/80">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-300" />
                    Effective rate: {formatUsd(pack.priceUsd / pack.credits)} per credit
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-300" />
                    Use across all resume tools
                  </li>
                </ul>

                <Button
                  type="button"
                  onClick={() => onStripeCheckout(pack)}
                  disabled={isCheckingOutPack !== null}
                  className="mt-4 w-full gradient-accent border-0 text-white"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isCheckingOutPack === pack.id ? "Redirecting..." : "Checkout with Stripe"}
                </Button>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-rose-500/20 bg-black/20 p-3 text-xs text-foreground/70">
            <div className="flex items-center gap-2">
              <BadgeDollarSign className="h-4 w-4 text-rose-300" />
              <p>Checkout is handled with Stripe-hosted payment flow.</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Credit Economics</h2>
              <p className="mt-1 text-sm text-foreground/70">
                1 Credit ~= $0.10. This pricing keeps strong margin while typical AI calls cost
                less than $0.03.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Stripe frontend ready
            </span>
          </div>
        </section>

        <section className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Feature Credit Costs</h2>
          <p className="mt-1 text-sm text-foreground/65">
            Transparent per-feature pricing so users can estimate spend before running actions.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-foreground/65">Feature</th>
                  <th className="px-3 py-2 text-foreground/65">Credit Cost</th>
                  <th className="px-3 py-2 text-foreground/65">Value Proposition</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_COSTS.map((feature) => (
                  <tr key={feature.name} className="rounded-lg bg-black/20">
                    <td className="rounded-l-lg border-y border-l border-rose-500/15 px-3 py-3 font-medium text-foreground">
                      {feature.name}
                    </td>
                    <td className="border-y border-rose-500/15 px-3 py-3 text-rose-200">
                      {feature.credits} {feature.credits === 1 ? "Credit" : "Credits"}
                    </td>
                    <td className="rounded-r-lg border-y border-r border-rose-500/15 px-3 py-3 text-foreground/80">
                      {feature.proposition}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
};

const CreditsPage: React.FC = () => {
  return (
    <Suspense fallback={<main className="p-4 text-sm text-foreground/70 sm:p-6">Loading credits page...</main>}>
      <CreditsPageContent />
    </Suspense>
  );
};

export default CreditsPage;
