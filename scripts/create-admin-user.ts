import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    })

    if (existingAdmin) {
      console.log("⚠️  Un administrateur existe déjà:")
      console.log(`   Email: ${existingAdmin.email}`)
      console.log(`   Nom: ${existingAdmin.name}`)
      console.log("\nVoulez-vous créer un nouvel admin quand même ? Annulez avec Ctrl+C")
    }

    const email = "admin@selectif.io"
    const hashedPassword = "$2a$20$I9tCn2C0Etgb7R4RS7uideJZ71kN2cAzX59G9jC0LZ.zeL1dDKaxa"
    const name = "Jean Christophe Bogbe"

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

    console.log("\n✅ Compte administrateur créé avec succès!\n")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log(`📧 Email:     ${admin.email}`)
    console.log(`👤 Nom:       ${admin.name}`)
    console.log(`🔑 Mot de passe: 2151355Oxley$`)
    console.log(`🆔 User ID:   ${admin.id}`)
    console.log(`⚡ Rôle:      ${admin.role}`)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
    console.log(`🔐 URL de connexion: http://localhost:3000/sys-b542ee118bcae91f\n`)
    console.log("⚠️  IMPORTANT: Gardez ces informations en sécurité!")

  } catch (error: any) {
    if (error.code === "P2002") {
      console.error("\n❌ Erreur: Un utilisateur avec cet email existe déjà.")
      console.error("   Email:", "admin@selectif.io")
      console.error("\n💡 Si vous voulez promouvoir cet utilisateur en admin, utilisez:")
      console.error("   npm run make-admin admin@selectif.io")
    } else {
      console.error("\n❌ Erreur lors de la création de l'admin:", error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
