// Script rapide pour activer la recherche Internet pour un utilisateur
// Usage: node scripts/enable-internet-search.js hello.jeanchristophebogbe@gmail.com

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'hello.jeanchristophebogbe@gmail.com'

  console.log('Recherche de utilisateur:', email)

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      subscription: true
    }
  })

  if (!user) {
    console.error('Utilisateur non trouve:', email)
    process.exit(1)
  }

  console.log('Utilisateur trouve:', user.name, '(' + user.userType + ')')
  console.log('Subscription actuelle:', user.subscription ? 'Oui' : 'Non')

  // Récupérer ou créer le plan Premium Candidat
  let premiumPlan = await prisma.pricingPlan.findFirst({
    where: {
      type: 'CANDIDATE',
      name: 'PREMIUM_CANDIDATE'
    }
  })

  if (!premiumPlan) {
    console.log('Creation du plan Premium Candidat...')
    premiumPlan = await prisma.pricingPlan.create({
      data: {
        name: 'PREMIUM_CANDIDATE',
        displayName: 'Premium Candidat',
        type: 'CANDIDATE',
        price: 19.00,
        billingPeriod: 'MONTHLY',
        features: {
          maxAIAnalysesMonth: 50,
          prioritySupport: true,
          advancedAnalytics: true,
          internetJobSearch: true
        }
      }
    })
    console.log('Plan Premium Candidat cree')
  } else {
    console.log('Mise a jour du plan avec internetJobSearch...')
    premiumPlan = await prisma.pricingPlan.update({
      where: { id: premiumPlan.id },
      data: {
        features: {
          ...premiumPlan.features,
          internetJobSearch: true
        }
      }
    })
    console.log('Plan mis a jour')
  }

  // Créer ou mettre à jour la subscription
  if (user.subscription) {
    console.log('Mise a jour de la subscription existante...')
    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        planId: premiumPlan.id,
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
  } else {
    console.log('Creation d une nouvelle subscription...')
    await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: premiumPlan.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
  }

  console.log('\nSUCCES!')
  console.log('Recherche Internet activee pour:', user.email)
  console.log('Plan:', premiumPlan.displayName)
  console.log('Fonctionnalites:', JSON.stringify(premiumPlan.features, null, 2))
  console.log('\nVous pouvez maintenant tester la recherche Internet!')
  console.log('Allez sur: Offres disponibles -> Recherche Internet')
}

main()
  .catch((e) => {
    console.error('Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
