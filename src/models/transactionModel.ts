
import { Schema, model, Document, Types } from "mongoose"

export interface ICreditTransaction extends Document {
    userId: Types.ObjectId
    amount: number
    type: "purchase" | "usage" | "refund"
    description: string
}



const creditTransactionSchema = new Schema<ICreditTransaction>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },

        amount: Number,

        type: {
            type: String,
            enum: ["purchase", "usage", "refund"]
        },

        description: String
    },
    { timestamps: true }
)

export const CreditTransactionModel = model<ICreditTransaction>(
    "CreditTransaction",
    creditTransactionSchema
)