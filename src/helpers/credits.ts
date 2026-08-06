import User from "@/models/userModel"
import { CreditTransactionModel } from "@/models/transactionModel"

export type DeductCreditsResult =
  | { success: true; creditsRemaining: number }
  | { success: false; reason: "user-not-found" | "insufficient-credits"; creditsAvailable: number }

export async function deductCredits(options: {
  userId: string
  amount: number
  description: string
}): Promise<DeductCreditsResult> {
  const { userId, amount, description } = options

  const user = await User.findOneAndUpdate(
    { _id: userId, credits: { $gte: amount } },
    { $inc: { credits: -amount } },
    { new: true, select: "credits" }
  )

  if (!user) {
    const existing = await User.findById(userId).select("credits").lean()
    if (!existing) {
      return { success: false, reason: "user-not-found", creditsAvailable: 0 }
    }
    return {
      success: false,
      reason: "insufficient-credits",
      creditsAvailable: existing.credits ?? 0,
    }
  }

  await CreditTransactionModel.create({
    userId: user._id,
    amount,
    type: "usage",
    description,
  })

  return { success: true, creditsRemaining: user.credits }
}

export async function refundCredits(options: {
  userId: string
  amount: number
  description: string
}): Promise<void> {
  const { userId, amount, description } = options

  await User.updateOne(
    { _id: userId },
    { $inc: { credits: amount } }
  )

  await CreditTransactionModel.create({
    userId,
    amount,
    type: "refund",
    description,
  })
}
