import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { db } from "./db"

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Pour le MVP, on active ça plus tard
  },
  user: {
    additionalFields: {
      userType: {
        type: "string",
        required: true,
        input: true, // Permet de passer userType lors de l'inscription
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // Update chaque 24h
  },
  advanced: {
    cookiePrefix: "selectif",
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
