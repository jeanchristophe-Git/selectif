// Script ultra-simple pour activer la recherche Internet
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = 'hello.jeanchristophebogbe@gmail.com'

  console.log('Activation pour:', email)

  // Trouver l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email },
    include: { subscription: true }
  })

  if (!user) {
    console.error('Utilisateur non trouve')
    return
  }

  console.log('Utilisateur:', user.name)

  if (user.subscription) {
    // Mettre à jour la subscription avec un champ custom
    await prisma.$executeRaw`
      UPDATE "Subscription"
      SET "maxAIAnalysesMonth" = 50,
          "alertsEnabled" = true,
          "cvBuilderEnabled" = true
      WHERE "userId" = ${user.id}
    `
    console.log('Subscription mise a jour: Plan Premium active!')
  } else {
    // Créer une subscription
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'CANDIDATE_PREMIUM',
        status: 'ACTIVE',
        maxAIAnalysesMonth: 50,
        alertsEnabled: true,
        cvBuilderEnabled: true,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
    console.log('Subscription creee: Plan Premium!')
  }

  console.log('\nSUCCES! Rechargez la page et testez la recherche Internet.')
}

main()
  .catch(e => {
    console.error('Erreur:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
