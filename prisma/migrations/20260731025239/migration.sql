/*
  Warnings:

  - You are about to drop the column `document` on the `customers` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `customers` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `phone` on the `customers` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `email` on the `customers` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.

*/
-- DropIndex
DROP INDEX "customers_document_key";

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "document",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "code" VARCHAR(30),
ADD COLUMN     "department" VARCHAR(100),
ADD COLUMN     "district" VARCHAR(100),
ADD COLUMN     "documentNumber" VARCHAR(20),
ADD COLUMN     "documentType" VARCHAR(10) NOT NULL DEFAULT 'RUC',
ADD COLUMN     "province" VARCHAR(100),
ADD COLUMN     "ubigeo" VARCHAR(6),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(200);
