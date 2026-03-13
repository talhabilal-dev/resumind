
import { Document, model, models, Model, Schema, Types } from "mongoose"


export interface IPayment extends Document {
    userId: Types.ObjectId
    amount: number
    credits: number
    stripePaymentId: string
    status: "pending" | "completed" | "failed"
}

const paymentSchema = new Schema<IPayment>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },

        amount: Number,

        credits: Number,

        stripePaymentId: String,

        status: {
            type: String,
            enum: ["pending", "completed", "failed"]
        }
    },
    { timestamps: true }
)

export const PaymentModel: Model<IPayment> = models.Payment
    ? (models.Payment as Model<IPayment>)
    : model<IPayment>("Payment", paymentSchema)