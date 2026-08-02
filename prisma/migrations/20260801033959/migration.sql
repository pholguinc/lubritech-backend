/*
  Warnings:

  - You are about to drop the column `purchasePrice` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `salePrice` on the `products` table. All the data in the column will be lost.
  - Added the required column `sale_price` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "purchasePrice",
DROP COLUMN "salePrice",
ADD COLUMN     "purchase_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "sale_price" DOUBLE PRECISION NOT NULL;
