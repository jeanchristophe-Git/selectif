import { z } from "zod"

export const jobOfferSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(100, "Le titre ne peut pas dépasser 100 caractères"),
  description: z
    .string()
    .min(50, "La description doit contenir au moins 50 caractères")
    .max(5000, "La description ne peut pas dépasser 5000 caractères"),
  requirements: z
    .string()
    .min(20, "Les exigences doivent contenir au moins 20 caractères")
    .max(3000, "Les exigences ne peuvent pas dépasser 3000 caractères"),
  location: z.string().optional(),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"], {
    required_error: "Le type de contrat est requis",
  }),
  salaryRange: z.string().optional(),
  interviewSlots: z
    .number()
    .int()
    .min(1, "Au moins 1 slot d'entretien est requis")
    .max(50, "Maximum 50 slots d'entretiens")
    .default(5),
  expiresAt: z.date().optional(),
})

export type JobOfferInput = z.infer<typeof jobOfferSchema>
