/*
  Warnings:

  - Changed the type of `userType` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "userType",
ADD COLUMN     "userType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "UserType";

-- CreateIndex
CREATE INDEX "User_userType_idx" ON "User"("userType");
