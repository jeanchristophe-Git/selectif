import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Fixing onboarding status for existing users...")

  // Mettre à jour tous les utilisateurs qui ont un profil company avec onboardingStep >= 3
  const usersWithCompany = await prisma.user.findMany({
    where: {
      company: {
        isNot: null
      },
    },
    include: { company: true }
  })

  // Filtrer ceux avec onboardingStep >= 3
  const completedCompanyUsers = usersWithCompany.filter(u => u.company && u.company.onboardingStep >= 3)

  console.log(`Found ${completedCompanyUsers.length} users with completed company profiles`)

  for (const user of completedCompanyUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompleted: true },
    })
    console.log(`✅ Updated user ${user.email} (company)`)
  }

  // Mettre à jour tous les utilisateurs qui ont un profil candidate avec onboardingStep >= 3
  const usersWithCandidate = await prisma.user.findMany({
    where: {
      candidate: {
        isNot: null
      },
    },
    include: { candidate: true }
  })

  // Filtrer ceux avec onboardingStep >= 3
  const completedCandidateUsers = usersWithCandidate.filter(u => u.candidate && u.candidate.onboardingStep >= 3)

  console.log(`Found ${completedCandidateUsers.length} users with completed candidate profiles`)

  for (const user of completedCandidateUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompleted: true },
    })
    console.log(`✅ Updated user ${user.email} (candidate)`)
  }

  console.log("\n✅ Done! All existing users fixed.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
