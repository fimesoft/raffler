/*
  Warnings:

  - You are about to drop the column `buyerEmail` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `buyerName` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tickets` table. All the data in the column will be lost.
  - Added the required column `buyerDocument` to the `tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerId` to the `tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "raffleId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SOLD',
    "buyerDocument" TEXT NOT NULL,
    "buyerPhone" TEXT,
    "purchaseDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tickets_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "raffles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tickets_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tickets" ("id", "number", "raffleId") SELECT "id", "number", "raffleId" FROM "tickets";
DROP TABLE "tickets";
ALTER TABLE "new_tickets" RENAME TO "tickets";
CREATE UNIQUE INDEX "tickets_raffleId_number_key" ON "tickets"("raffleId", "number");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "image" TEXT,
    "emailVerified" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "documentType" TEXT,
    "documentNumber" TEXT,
    "phone" TEXT,
    "dateOfBirth" DATETIME,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "documentVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resetToken" TEXT,
    "resetTokenExpires" DATETIME
);
INSERT INTO "new_users" ("createdAt", "email", "emailVerified", "id", "image", "isActive", "name", "password", "resetToken", "resetTokenExpires", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "isActive", "name", "password", "resetToken", "resetTokenExpires", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_documentNumber_key" ON "users"("documentNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
