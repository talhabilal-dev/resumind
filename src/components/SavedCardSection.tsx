"use client";

import React, { useEffect, useState } from "react";
import { Check, Copy, CreditCard, Eye, EyeOff, Save } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { savedCardSchema } from "@/schemas/cardSchema";

type SavedCardState = {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvc: string;
};

type SavedCardSectionProps = {
  onChanged?: (card: SavedCardState) => void;
};

const formatCardNumber = (value: string) => value.replace(/\s/g, "");

export const SavedCardSection: React.FC<SavedCardSectionProps> = ({
  onChanged,
}) => {
  const { toast } = useToast();

  const [card, setCard] = useState<SavedCardState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [form, setForm] = useState<SavedCardState>({
    cardNumber: "",
    expiryMonth: 1,
    expiryYear: new Date().getFullYear() + 2,
    cvc: "",
  });

  const fetchCard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users/card", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload?.card) {
        throw new Error(payload?.error || "Failed to load saved card.");
      }
      setCard(payload.card);
      setForm(payload.card);
      onChanged?.(payload.card);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to load saved card.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCard();
  }, []);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied",
        description: "Copied to clipboard.",
        variant: "default",
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Unable to copy. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    const parsed = savedCardSchema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Error",
        description:
          parsed.error.issues[0]?.message || "Please fix card details.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/users/card", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card: parsed.data }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to update card.");
      }
      setCard(payload.card);
      setForm(payload.card);
      setIsEditing(false);
      onChanged?.(payload.card);
      toast({
        title: "Success",
        description: "Payment method updated successfully.",
        variant: "default",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to update card.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <p className="mt-2 text-sm text-foreground/60">
        Loading payment method...
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-rose-500/25 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-rose-300" />
          <p className="text-sm font-medium text-foreground">
            Saved Payment Method
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDetails((prev) => !prev)}
            className="border border-rose-500/25 bg-white/5 text-xs text-foreground hover:bg-white/10"
          >
            {showDetails ? (
              <EyeOff className="mr-1 h-3.5 w-3.5" />
            ) : (
              <Eye className="mr-1 h-3.5 w-3.5" />
            )}
            {showDetails ? "Hide" : "View"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (!card) return;
              const month = String(card.expiryMonth).padStart(2, "0");
              const year = String(card.expiryYear);
              copyToClipboard(
                `Card Number: ${formatCardNumber(card.cardNumber)}\nExpiry: ${month}/${year}\nCVC: ${card.cvc}`,
                "all",
              );
            }}
            className="border border-rose-500/25 bg-white/5 text-xs text-foreground hover:bg-white/10"
          >
            {copiedField === "all" ? (
              <Check className="mr-1 h-3.5 w-3.5 text-emerald-300" />
            ) : (
              <Copy className="mr-1 h-3.5 w-3.5" />
            )}
            {copiedField === "all" ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      {!isEditing && card ? (
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-md border border-rose-500/15 bg-white/5 px-3 py-2">
            <p className="text-xs text-foreground/60">Card Number</p>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <p className="font-mono text-foreground">
                {showDetails
                  ? formatCardNumber(card.cardNumber)
                  : `•••• •••• •••• ${card.cardNumber.slice(-4)}`}
              </p>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(formatCardNumber(card.cardNumber), "number")
                }
                className="text-foreground/50 hover:text-foreground"
                aria-label="Copy card number"
              >
                {copiedField === "number" ? (
                  <Check className="h-4 w-4 text-emerald-300" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="rounded-md border border-rose-500/15 bg-white/5 px-3 py-2">
            <p className="text-xs text-foreground/60">Expiry</p>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <p className="font-mono text-foreground">
                {showDetails
                  ? `${String(card.expiryMonth).padStart(2, "0")}/${card.expiryYear}`
                  : "••/••"}
              </p>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `${String(card.expiryMonth).padStart(2, "0")}/${card.expiryYear}`,
                    "expiry",
                  )
                }
                className="text-foreground/50 hover:text-foreground"
                aria-label="Copy expiry"
              >
                {copiedField === "expiry" ? (
                  <Check className="h-4 w-4 text-emerald-300" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="rounded-md border border-rose-500/15 bg-white/5 px-3 py-2">
            <p className="text-xs text-foreground/60">CVC</p>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <p className="font-mono text-foreground">
                {showDetails ? card.cvc : "•••"}
              </p>
              <button
                type="button"
                onClick={() => copyToClipboard(card.cvc, "cvc")}
                className="text-foreground/50 hover:text-foreground"
                aria-label="Copy CVC"
              >
                {copiedField === "cvc" ? (
                  <Check className="h-4 w-4 text-emerald-300" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setForm(card);
                setIsEditing(true);
              }}
              className="border border-rose-500/25 bg-white/5 text-xs text-foreground hover:bg-white/10"
            >
              Update Card
            </Button>
          </div>
        </div>
      ) : null}

      {isEditing ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label
              htmlFor="cardNumber"
              className="mb-1 block text-sm text-foreground/80"
            >
              Card Number
            </label>
            <input
              id="cardNumber"
              inputMode="numeric"
              maxLength={16}
              value={form.cardNumber}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  cardNumber: formatCardNumber(
                    e.target.value.replace(/\D/g, ""),
                  ),
                }))
              }
              placeholder="4242 4242 4242 4242"
              className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 font-mono text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40"
            />
          </div>
          <div>
            <label
              htmlFor="expiryMonth"
              className="mb-1 block text-sm text-foreground/80"
            >
              Expiry Month
            </label>
            <select
              id="expiryMonth"
              value={form.expiryMonth}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  expiryMonth: Number(e.target.value),
                }))
              }
              className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 text-foreground outline-none transition focus:ring-2 focus:ring-rose-400/40"
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map(
                (month) => (
                  <option
                    key={month}
                    value={month}
                    className="bg-zinc-900 text-foreground"
                  >
                    {String(month).padStart(2, "0")}
                  </option>
                ),
              )}
            </select>
          </div>
          <div>
            <label
              htmlFor="expiryYear"
              className="mb-1 block text-sm text-foreground/80"
            >
              Expiry Year
            </label>
            <select
              id="expiryYear"
              value={form.expiryYear}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  expiryYear: Number(e.target.value),
                }))
              }
              className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 text-foreground outline-none transition focus:ring-2 focus:ring-rose-400/40"
            >
              {Array.from(
                { length: 10 },
                (_, index) => new Date().getFullYear() + index,
              ).map((year) => (
                <option
                  key={year}
                  value={year}
                  className="bg-zinc-900 text-foreground"
                >
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="cvc"
              className="mb-1 block text-sm text-foreground/80"
            >
              CVC
            </label>
            <input
              id="cvc"
              inputMode="numeric"
              maxLength={3}
              value={form.cvc}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  cvc: e.target.value.replace(/\D/g, ""),
                }))
              }
              placeholder="123"
              className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 font-mono text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setForm(
                  card || {
                    cardNumber: "",
                    expiryMonth: 1,
                    expiryYear: new Date().getFullYear() + 2,
                    cvc: "",
                  },
                );
                setIsEditing(false);
              }}
              className="border border-rose-500/25 bg-white/5 text-xs text-foreground hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="gradient-accent border-0 text-white"
            >
              <Save className="mr-1 h-3.5 w-3.5" />
              {isSaving ? "Saving..." : "Save Card"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SavedCardSection;
