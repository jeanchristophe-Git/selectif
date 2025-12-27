import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    })

    console.log(`✅ User ${email} is now an ADMIN`)
    console.log(`User ID: ${user.id}`)
    console.log(`Name: ${user.name}`)
    console.log(`Role: ${user.role}`)
  } catch (error) {
    console.error("❌ Error making user admin:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.error("❌ Please provide an email address")
  console.log("Usage: npm run make-admin <email>")
  process.exit(1)
}

makeAdmin(email)
