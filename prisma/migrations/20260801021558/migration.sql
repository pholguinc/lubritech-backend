/*
  Warnings:

  - You are about to drop the column `taxId` on the `suppliers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[documentNumber]` on the table `suppliers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `documentNumber` to the `suppliers` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "suppliers_taxId_key";

-- AlterTable
ALTER TABLE "suppliers" DROP COLUMN "taxId",
ADD COLUMN     "documentNumber" VARCHAR(20) NOT NULL,
ADD COLUMN     "documentType" VARCHAR(10) NOT NULL DEFAULT 'RUC';

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_documentNumber_key" ON "suppliers"("documentNumber");
