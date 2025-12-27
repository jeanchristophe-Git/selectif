import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function recreateAdmin() {
  try {
    const email = "bogbejeanchristophedesire@gmail.com"
    const password = "2151355Oxley$"
    const name = "Jean Christophe Bogbe"

    // Delete existing user if exists
    await prisma.user.deleteMany({
      where: { email },
    })

    console.log("🗑️  Ancien compte supprimé (si existait)")

    // Hash password with cost factor 10 (normal speed)
    console.log("🔐 Hashage du mot de passe...")
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("✅ Hash créé:", hashedPassword)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
        userType: "COMPANY",
        emailVerified: true,
        onboardingCompleted: true,
      },
    })

    console.log("\n✅ Compte administrateur recréé avec succès!\n")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log(`📧 Email:     ${admin.email}`)
    console.log(`👤 Nom:       ${admin.name}`)
    console.log(`🔑 Mot de passe: ${password}`)
    console.log(`🆔 User ID:   ${admin.id}`)
    console.log(`⚡ Rôle:      ${admin.role}`)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
    console.log(`🔐 URL de connexion: http://localhost:3000/sys-b542ee118bcae91f\n`)
    console.log("⚠️  IMPORTANT: Le hash bcrypt utilise maintenant un cost factor de 10 (rapide)")

  } catch (error: any) {
    console.error("\n❌ Erreur:", error)
  } finally {
    await prisma.$disconnect()
  }
}

recreateAdmin()
