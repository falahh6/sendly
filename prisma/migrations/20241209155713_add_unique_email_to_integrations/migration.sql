/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `integrations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "integrations_email_key" ON "integrations"("email");
