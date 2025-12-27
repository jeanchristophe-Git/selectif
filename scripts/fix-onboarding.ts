import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Fi xing onboarding status...')

  // Mettre à jour tous les utilisateurs qui ont un profil company
  const usersWithCompany = await prisma.user.findMany({
    where: {
      company: {
        isNot: null
      },
      onboardingCompleted: false
    }
  })

  for (const user of usersWithCompany) {
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompleted: true }
    })
    console.log(`✅ Updated user ${user.email} (company)`)
  }

  // Mettre à jour tous les utilisateurs qui ont un profil candidate
  const usersWithCandidate = await prisma.user.findMany({
    where: {
      candidate: {
        isNot: null
      },
      onboardingCompleted: false
    }
  })

  for (const user of usersWithCandidate) {
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompleted: true }
    })
    console.log(`✅ Updated user ${user.email} (candidate)`)
  }

  console.log(`\n✨ Done! Updated ${usersWithCompany.length + usersWithCandidate.length} users`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
