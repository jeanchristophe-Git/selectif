import { z } from "zod"

// Update application status schema
export const updateApplicationStatusSchema = z.object({
  status: z.enum(["SHORTLISTED", "REJECTED", "CONTACTED"], {
    errorMap: () => ({ message: "Statut invalide" }),
  }),
})

export type UpdateApplicationStatusInput = z.infer<
  typeof updateApplicationStatusSchema
>
