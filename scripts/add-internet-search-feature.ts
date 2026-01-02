// DEPRECATED: This script is no longer needed as the PricingPlan model has been replaced
// with a Subscription model that uses SubscriptionPlan enum.
// The internetJobSearch feature should be configured directly in the Subscription model.

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("⚠️ This script is deprecated and no longer functional.")
  console.log("The PricingPlan model has been removed from the schema.")
  console.log("Please use the Subscription model directly to manage plan features.")

  // If you need to enable features for subscriptions, update the Subscription model
  // or add logic to your application to check the subscription plan type
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
