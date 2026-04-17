import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const PurchaseSchema = z.object({
  supplierId: z.string().uuid().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
    price: z.number().min(0),     // purchase price per unit
    gstPercentage: z.number().min(0).max(100).default(0),
  })).min(1),
  paymentAmount: z.number().min(0).optional(),
  paymentMode: z.enum(["cash", "upi", "bank", "card"]).default("cash"),
  notes: z.string().optional(),
  gstEnabled: z.boolean().default(false),
});

export const PurchaseService = {
  async create(body: unknown, shopId: string) {
    const data = PurchaseSchema.parse(body);

    return prisma.$transaction(async (tx) => {
      // 1. Resolve supplier — create a generic one if not provided
      let finalSupplierId = data.supplierId;
      if (!finalSupplierId) {
        let walkIn = await tx.supplier.findFirst({
          where: { shopId, name: "Walk-in Supplier" },
        });
        if (!walkIn) {
          walkIn = await tx.supplier.create({
            data: { shopId, name: "Walk-in Supplier" },
          });
        }
        finalSupplierId = walkIn.id;
      }

      // 2. Calculate totals
      let subtotal = 0;
      let totalTax = 0;

      const computedItems = data.items.map((item) => {
        const lineSubtotal = item.price * item.quantity;
        const taxAmount = data.gstEnabled
          ? parseFloat(((lineSubtotal * item.gstPercentage) / 100).toFixed(2))
          : 0;
        const total = lineSubtotal + taxAmount;
        subtotal += lineSubtotal;
        totalTax += taxAmount;
        return { ...item, taxAmount, total };
      });

      const totalAmount = subtotal + totalTax;
      const actualPayment = data.paymentAmount !== undefined ? data.paymentAmount : totalAmount;

      // 3. Generate purchase reference number (PO-YYYYMM-XXXX)
      const date = new Date();
      const prefix = `PO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
      const lastPurchase = await tx.ledgerEntry.findFirst({
        where: { shopId, entityType: "supplier", description: { startsWith: prefix } },
        orderBy: { createdAt: "desc" },
        select: { description: true },
      });
      const lastNum = lastPurchase?.description?.match(/(\d{4})$/)?.[1];
      const nextNum = lastNum ? parseInt(lastNum, 10) + 1 : 1;
      const purchaseRef = `${prefix}-${String(nextNum).padStart(4, "0")}`;

      // 4. Increase inventory for each item
      await Promise.all(
        data.items.map((item) =>
          tx.inventoryLog.create({
            data: {
              shopId,
              productId: item.productId,
              changeType: "purchase",
              quantityChange: item.quantity,
              referenceType: "purchase_order",
              referenceId: purchaseRef,
              notes: data.notes,
            },
          })
        )
      );

      // 5. Update product purchase price (weighted avg would need cost tracking — use latest price for now)
      await Promise.all(
        data.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { purchasePrice: item.price },
          })
        )
      );

      // 6. Create ledger entry — supplier owes us delivery = debit supplier
      await tx.ledgerEntry.create({
        data: {
          shopId,
          entityType: "supplier",
          entityId: finalSupplierId,
          debit: totalAmount,
          credit: 0,
          referenceType: "purchase_order",
          referenceId: purchaseRef,
          description: `${purchaseRef}: Purchase from supplier`,
        },
      });

      // 7. Create payment entry against supplier ledger if paid
      if (actualPayment > 0) {
        await tx.payment.create({
          data: {
            shopId,
            referenceType: "purchase",
            referenceId: purchaseRef,
            amount: actualPayment,
            mode: data.paymentMode,
            notes: data.notes,
          },
        });

        // Credit supplier ledger for the payment made
        await tx.ledgerEntry.create({
          data: {
            shopId,
            entityType: "supplier",
            entityId: finalSupplierId,
            debit: 0,
            credit: actualPayment,
            referenceType: "payment",
            referenceId: purchaseRef,
            description: `Payment for ${purchaseRef}`,
          },
        });
      }

      return {
        purchaseRef,
        supplierId: finalSupplierId,
        subtotal,
        totalTax,
        totalAmount,
        paymentAmount: actualPayment,
        paymentStatus: actualPayment >= totalAmount ? "paid" : actualPayment > 0 ? "partial" : "unpaid",
        items: computedItems,
      };
    });
  },
};
