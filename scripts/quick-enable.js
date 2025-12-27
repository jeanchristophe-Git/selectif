// Script simple pour activer la recherche Internet
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = 'hello.jeanchristophebogbe@gmail.com'

  console.log('Activation de la recherche Internet pour:', email)

  // Utiliser raw SQL pour éviter les problèmes de relations
  try {
    // 1. Créer le plan Premium avec internetJobSearch
    await prisma.$executeRaw`
      INSERT INTO "PricingPlan" (id, name, "displayName", type, price, "billingPeriod", features, "createdAt", "updatedAt")
      VALUES (
        'premium_candidate_plan',
        'PREMIUM_CANDIDATE',
        'Premium Candidat',
        'CANDIDATE',
        19.00,
        'MONTHLY',
        '{"maxAIAnalysesMonth": 50, "prioritySupport": true, "advancedAnalytics": true, "internetJobSearch": true}'::jsonb,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE
      SET features = '{"maxAIAnalysesMonth": 50, "prioritySupport": true, "advancedAnalytics": true, "internetJobSearch": true}'::jsonb,
          "updatedAt" = NOW()
    `
    console.log('Plan Premium cree/mis a jour')

    // 2. Récupérer l'utilisateur
    const user = await prisma.$queryRaw`
      SELECT id FROM "User" WHERE email = ${email}
    `

    if (!user || user.length === 0) {
      throw new Error('Utilisateur non trouve')
    }

    const userId = user[0].id
    console.log('Utilisateur trouve:', userId)

    // 3. Créer ou mettre à jour la subscription
    await prisma.$executeRaw`
      INSERT INTO "Subscription" ("userId", "planId", status, "currentPeriodStart", "currentPeriodEnd", "createdAt", "updatedAt")
      VALUES (
        ${userId},
        'premium_candidate_plan',
        'ACTIVE',
        NOW(),
        NOW() + INTERVAL '30 days',
        NOW(),
        NOW()
      )
      ON CONFLICT ("userId") DO UPDATE
      SET "planId" = 'premium_candidate_plan',
          status = 'ACTIVE',
          "currentPeriodEnd" = NOW() + INTERVAL '30 days',
          "updatedAt" = NOW()
    `
    console.log('Subscription activee')

    // 4. Vérifier
    const result = await prisma.$queryRaw`
      SELECT
        u.email,
        u.name,
        p."displayName" as plan,
        p.features->>'internetJobSearch' as "internetSearch"
      FROM "User" u
      LEFT JOIN "Subscription" s ON s."userId" = u.id
      LEFT JOIN "PricingPlan" p ON p.id = s."planId"
      WHERE u.email = ${email}
    `

    console.log('\nResultat:', result[0])
    console.log('\nSUCCES! La recherche Internet est maintenant activee.')
    console.log('Rechargez la page et allez sur: Offres disponibles -> Recherche Internet')
  } catch (error) {
    console.error('Erreur:', error.message)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Erreur fatale:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
