-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "offer_id" TEXT;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "manual_discount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "auto_offer_config" JSONB;

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "product_id" TEXT,
    "category_id" TEXT,
    "name" TEXT NOT NULL,
    "discount_type" TEXT NOT NULL,
    "discount_value" DECIMAL(12,2) NOT NULL,
    "min_quantity" DECIMAL(12,3) NOT NULL DEFAULT 1,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "is_auto_offer" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
