import { Schema, model, models, Document, Types, Model } from "mongoose"

export interface IExperience {
    company: string
    role: string
    location?: string
    startDate: Date
    endDate?: Date
    current?: boolean
    achievements: string[]
}

export interface IEducation {
    institution: string
    degree: string
    field?: string
    startDate?: Date
    endDate?: Date
}

export interface IProject {
    name: string
    description: string
    technologies: string[]
    url?: string
    achievements?: string[]
}

export interface IResume extends Document {
    userId: Types.ObjectId

    title: string
    version: number

    personal: {
        fullName: string
        email: string
        phone?: string
        location?: string
        website?: string
        linkedin?: string
        github?: string
    }

    summary?: string

    skills: {
        technical: string[]
        soft: string[]
        tools: string[]
        languages: string[]
    }

    experience: IExperience[]

    education: IEducation[]

    projects: IProject[]

    certifications: {
        name: string
        issuer: string
        date?: Date
    }[]

    keywords: string[]

    rawText: string

    parsedData?: Record<string, any>

    atsScore?: number

    fileUrl?: string
    fileHash?: string

    aiMetadata?: {
        lastAnalyzedAt?: Date
        tokensUsed?: number
    }

    createdAt: Date
    updatedAt: Date
}

const resumeSchema = new Schema<IResume>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        title: {
            type: String,
            default: "My Resume"
        },

        version: {
            type: Number,
            default: 1
        },

        personal: {
            fullName: String,
            email: String,
            phone: String,
            location: String,
            website: String,
            linkedin: String,
            github: String
        },

        summary: String,

        skills: {
            technical: [String],
            soft: [String],
            tools: [String],
            languages: [String]
        },

        experience: [
            {
                company: String,
                role: String,
                location: String,
                startDate: Date,
                endDate: Date,
                current: Boolean,
                achievements: [String]
            }
        ],

        education: [
            {
                institution: String,
                degree: String,
                field: String,
                startDate: Date,
                endDate: Date
            }
        ],

        projects: [
            {
                name: String,
                description: String,
                technologies: [String],
                url: String,
                achievements: [String]
            }
        ],

        certifications: [
            {
                name: String,
                issuer: String,
                date: Date
            }
        ],

        keywords: [String],

        rawText: String,

        parsedData: Schema.Types.Mixed,

        atsScore: {
            type: Number,
            min: 0,
            max: 100
        },

        fileUrl: String,

        fileHash: {
            type: String,
            index: true
        },

        aiMetadata: {
            lastAnalyzedAt: Date,
            tokensUsed: Number
        }
    },
    {
        timestamps: true
    }
)

console.log("[resume:model] init:start", {
    hasCompiledResumeModel: Boolean(models.Resume),
    compiledModelNames: Object.keys(models)
})

export const ResumeModel: Model<IResume> = (() => {
    try {
        if (models.Resume) {
            console.log("[resume:model] init:reuse-existing")
            return models.Resume as Model<IResume>
        }

        console.log("[resume:model] init:compile-new")
        return model<IResume>("Resume", resumeSchema)
    } catch (error) {
        if (error instanceof Error) {
            console.error("[resume:model] init:error", {
                name: error.name,
                message: error.message,
                stack: error.stack,
                compiledModelNames: Object.keys(models)
            })
        } else {
            console.error("[resume:model] init:error", {
                value: error,
                compiledModelNames: Object.keys(models)
            })
        }

        throw error
    }
})()