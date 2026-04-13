/*
  Warnings:

  - A unique constraint covering the columns `[shop_id,barcode]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "valuation_method" TEXT NOT NULL DEFAULT 'WEIGHTED_AVERAGE';

-- CreateIndex
CREATE UNIQUE INDEX "products_shop_id_barcode_key" ON "products"("shop_id", "barcode");
