import { z } from "zod";

export const creditPackIdSchema = z.enum(["starter", "growth", "pro"]);
export type CreditPackId = z.infer<typeof creditPackIdSchema>;

export const creditCheckoutRequestSchema = z.object({
  packId: creditPackIdSchema,
});

export const CREDIT_PACK_CONFIG: Record<
  CreditPackId,
  {
    label: string;
    credits: number;
    amountCents: number;
  }
> = {
  starter: {
    label: "Starter",
    credits: 50,
    amountCents: 500,
  },
  growth: {
    label: "Growth",
    credits: 150,
    amountCents: 1500,
  },
  pro: {
    label: "Pro",
    credits: 400,
    amountCents: 4000,
  },
};
