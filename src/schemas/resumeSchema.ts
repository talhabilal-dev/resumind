import { z } from "zod";

const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];

const resumeFileSchema = z
  .custom<File | null>((value) => {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value !== "object" || value === null) {
      return false;
    }

    return "name" in value && "size" in value && "type" in value;
  }, "Invalid file")
  .nullable()
  .optional();

export const resumeUploadSchema = z
  .object({
    jobTitle: z
      .string()
      .trim()
      .min(2, "Job name must be at least 2 characters")
      .max(120, "Job name must be at most 120 characters"),
    jobDescription: z
      .string()
      .trim()
      .min(30, "Job description must be at least 30 characters")
      .max(5000, "Job description must be at most 5000 characters"),
    resumeText: z
      .string()
      .max(20000, "Resume text must be at most 20000 characters")
      .optional()
      .or(z.literal("")),
    resumeFile: resumeFileSchema,
  })
  .superRefine((data, ctx) => {
    const textProvided = Boolean(data.resumeText && data.resumeText.trim().length > 0);
    const fileProvided = Boolean(data.resumeFile);

    if (!textProvided && !fileProvided) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Upload a resume file or paste raw resume text",
        path: ["resumeText"],
      });
      return;
    }

    if (data.resumeFile) {
      const file = data.resumeFile;
      const filename = file.name.toLowerCase();
      const hasAllowedExtension = ALLOWED_RESUME_EXTENSIONS.some((ext) =>
        filename.endsWith(ext)
      );
      const hasAllowedMimeType = ALLOWED_RESUME_MIME_TYPES.includes(file.type);

      if (!hasAllowedExtension && !hasAllowedMimeType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Resume must be PDF, DOC, DOCX, or TXT",
          path: ["resumeFile"],
        });
      }

      if (file.size > MAX_RESUME_FILE_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Resume file must be 5MB or smaller",
          path: ["resumeFile"],
        });
      }
    }
  });

export type ResumeUploadData = z.infer<typeof resumeUploadSchema>;
