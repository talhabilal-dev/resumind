
import { Schema, model, models, Document, Model, Types } from "mongoose"

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

export const CreditTransactionModel: Model<ICreditTransaction> =
    models.CreditTransaction
        ? (models.CreditTransaction as Model<ICreditTransaction>)
        : model<ICreditTransaction>("CreditTransaction", creditTransactionSchema)