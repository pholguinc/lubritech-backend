/*
  Warnings:

  - You are about to drop the column `clientName` on the `system_config` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[client_name]` on the table `system_config` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `client_name` to the `system_config` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "system_config" DROP COLUMN "clientName",
ADD COLUMN     "client_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "system_config_client_name_key" ON "system_config"("client_name");
