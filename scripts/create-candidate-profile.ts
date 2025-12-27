import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userId = 'cmjffo3j40004yp2ovattxiom'

  console.log('Creating candidate profile for user:', userId)

  // Vérifier si l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { candidate: true }
  })

  if (!user) {
    console.error('User not found!')
    return
  }

  if (user.candidate) {
    console.log('Candidate profile already exists!')
    return
  }

  // Créer le profil candidat
  const candidate = await prisma.candidate.create({
    data: {
      userId: userId,
      firstName: user.name?.split(' ')[0] || 'John',
      lastName: user.name?.split(' ')[1] || 'Doe',
      phone: '+33 6 12 34 56 78',
      linkedinUrl: '',
      portfolioUrl: '',
      bio: 'Profil créé automatiquement',
      onboardingStep: 3,
      onboardedAt: new Date(),
    }
  })

  // Mettre à jour onboardingCompleted
  await prisma.user.update({
    where: { id: userId },
    data: { onboardingCompleted: true }
  })

  console.log('✅ Candidate profile created successfully!')
  console.log('✅ onboardingCompleted set to true')
  console.log('\nProfile details:')
  console.log(candidate)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
