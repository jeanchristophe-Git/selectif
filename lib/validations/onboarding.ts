import { z } from "zod"

// Company Onboarding - Step 1
export const companyStep1Schema = z.object({
  companyName: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  industry: z.string().min(1, "Veuillez sélectionner un secteur"),
  companySize: z.string().min(1, "Veuillez sélectionner une taille"),
})

// Company Onboarding - Step 2
export const companyStep2Schema = z.object({
  location: z.string().optional(),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  description: z.string().max(500, "La description ne peut pas dépasser 500 caractères").optional(),
})

// Company Onboarding - Step 3
export const companyStep3Schema = z.object({
  // Préférences à ajouter plus tard
})

export type CompanyStep1Input = z.infer<typeof companyStep1Schema>
export type CompanyStep2Input = z.infer<typeof companyStep2Schema>
export type CompanyStep3Input = z.infer<typeof companyStep3Schema>

// Candidate Onboarding - Step 1
export const candidateStep1Schema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
})

// Candidate Onboarding - Step 2
export const candidateStep2Schema = z.object({
  linkedinUrl: z.string().url("URL LinkedIn invalide").optional().or(z.literal("")),
  portfolioUrl: z.string().url("URL Portfolio invalide").optional().or(z.literal("")),
  bio: z.string().max(500, "La bio ne peut pas dépasser 500 caractères").optional(),
})

export type CandidateStep1Input = z.infer<typeof candidateStep1Schema>
export type CandidateStep2Input = z.infer<typeof candidateStep2Schema>
