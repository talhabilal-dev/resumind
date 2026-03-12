import { Document, model, Schema, Types } from "mongoose"

export interface IJobDescription extends Document {
    userId: Types.ObjectId
    title: string
    company: string
    content: string
}

const jobDescriptionSchema = new Schema<IJobDescription>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },

        title: String,

        company: String,

        content: String
    },
    { timestamps: true }
)

export const JobDescriptionModel = model<IJobDescription>(
    "JobDescription",
    jobDescriptionSchema
)