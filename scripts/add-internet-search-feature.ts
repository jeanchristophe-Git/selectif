import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🚀 Ajout de la fonctionnalité 'internetJobSearch' aux plans premium...")

  // Récupérer le plan Premium Candidat
  const premiumCandidatePlan = await prisma.pricingPlan.findFirst({
    where: {
      name: "PREMIUM_CANDIDATE",
      type: "CANDIDATE",
    },
  })

  if (premiumCandidatePlan) {
    // Ajouter la fonctionnalité internetJobSearch
    const updatedFeatures = {
      ...premiumCandidatePlan.features,
      internetJobSearch: true,
    }

    await prisma.pricingPlan.update({
      where: { id: premiumCandidatePlan.id },
      data: {
        features: updatedFeatures,
      },
    })

    console.log("✅ Fonctionnalité ajoutée au plan Premium Candidat")
  } else {
    console.log("⚠️ Plan Premium Candidat non trouvé")
  }

  // Optionnel: Ajouter aussi aux plans Enterprise Entreprise
  const enterprisePlans = await prisma.pricingPlan.findMany({
    where: {
      type: "COMPANY",
      name: "ENTERPRISE_COMPANY",
    },
  })

  for (const plan of enterprisePlans) {
    const updatedFeatures = {
      ...plan.features,
      internetJobSearch: true,
    }

    await prisma.pricingPlan.update({
      where: { id: plan.id },
      data: {
        features: updatedFeatures,
      },
    })

    console.log(`✅ Fonctionnalité ajoutée au plan ${plan.displayName}`)
  }

  console.log("✨ Migration terminée!")
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
