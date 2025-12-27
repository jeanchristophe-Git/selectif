import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userId = 'cmjffo3j40004yp2ovattxiom'

  console.log('Deleting user:', userId)

  // Supprimer l'utilisateur (cascade supprimera aussi le profil candidat si il existe)
  await prisma.user.delete({
    where: { id: userId }
  })

  console.log('✅ User deleted successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
