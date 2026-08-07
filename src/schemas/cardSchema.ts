import { z } from "zod";

export const savedCardSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits."),
  expiryMonth: z
    .number()
    .int()
    .min(1, "Expiry month is invalid.")
    .max(12, "Expiry month is invalid."),
  expiryYear: z
    .number()
    .int()
    .min(new Date().getFullYear(), "Expiry year is invalid.")
    .max(new Date().getFullYear() + 20, "Expiry year is invalid."),
  cvc: z.string().regex(/^\d{3}$/, "CVC must be 3 digits."),
});

export const updateCardSchema = z.object({
  card: savedCardSchema,
});

export const DEFAULT_CARD = {
  cardNumber: "4242424242424242",
  expiryMonth: new Date().getMonth() + 1,
  expiryYear: new Date().getFullYear() + 2,
  cvc: "123",
};

export type SavedCard = z.infer<typeof savedCardSchema>;
export type UpdateCardData = z.infer<typeof updateCardSchema>;
