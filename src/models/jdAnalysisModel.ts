import { Schema, model, models, Document, Model, Types } from "mongoose"
import type { JdAnalysisOutput } from "@/schemas/jdAnalysisSchema"

// ─── Interface ────────────────────────────────────────────────────────────────
export interface IJdAnalysis extends Document {
  userId: Types.ObjectId
  /** SHA-256 of normalised(cvText) + "||" + normalised(jdText) */
  contentHash: string
  jobTitle?: string
  companyName?: string
  jobDescription: string
  /** Full AI response – stored as Mixed for schema flexibility */
  analysisResult: JdAnalysisOutput
  tokensUsed: number
  creditsCharged: number
  /** Tracks whether the user has already generated an improved CV PDF */
  improvedCvGenerated: boolean
  createdAt: Date
  updatedAt: Date
}

// ─── Mongoose schema ──────────────────────────────────────────────────────────
const jdAnalysisSchema = new Schema<IJdAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    contentHash: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    jobDescription: {
      type: String,
    },
    analysisResult: {
      type: Schema.Types.Mixed,
      required: true,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    creditsCharged: {
      type: Number,
      default: 0,
    },
    improvedCvGenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// Compound index: fast cache lookups per user
jdAnalysisSchema.index({ userId: 1, contentHash: 1 })

// ─── Model export (Next.js hot-reload safe) ───────────────────────────────────
export const JdAnalysisModel: Model<IJdAnalysis> =
  models.JdAnalysis
    ? (models.JdAnalysis as Model<IJdAnalysis>)
    : model<IJdAnalysis>("JdAnalysis", jdAnalysisSchema)