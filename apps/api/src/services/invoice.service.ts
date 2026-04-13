import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const InvoiceSchema = z.object({
  customerId: z.string().uuid().optional(),
  gstEnabled: z.boolean().default(false),
  isIgst: z.boolean().default(false),
  items: z.array(z.object({
    productId: z.string().uuid(),
    uomId: z.string().uuid().optional(),
    quantity: z.number().positive(),
    price: z.number().min(0),
    discount: z.number().min(0).default(0),
    gstPercentage: z.number().min(0).max(100).default(0),
  })).min(1),
  paymentAmount: z.number().min(0).optional(),
  paymentMode: z.enum(["cash", "upi", "bank", "card"]).default("cash"),
  notes: z.string().optional(),
});

export const InvoiceService = {
  async create(body: unknown, shopId: string) {
    const data = InvoiceSchema.parse(body);

    return prisma.$transaction(async (tx) => {
      // 0. Resolve Walk-In Customer
      let finalCustomerId = data.customerId;
      if (!finalCustomerId) {
        let walkIn = await tx.customer.findFirst({
          where: { shopId, name: "Walk-in Customer" }
        });
        if (!walkIn) {
          walkIn = await tx.customer.create({
            data: { shopId, name: "Walk-in Customer" }
          });
        }
        finalCustomerId = walkIn.id;
      }

      // 1. Validate stock for each item (Optional Strict Mode - Currently relaxed, allowing negative stock if needed, but computing totals)
      // Actually, business requirement asks not to block sales if strict check isn't strictly requested,
      // but let's keep the block for now if stock is < quantity as per existing code.
      for (const item of data.items) {
        const agg = await tx.inventoryLog.aggregate({
          where: { productId: item.productId, shopId },
          _sum: { quantityChange: true },
        });
        const stock = Number(agg._sum.quantityChange ?? 0);
        if (stock < item.quantity) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          throw new AppError(422, `Insufficient stock for product: ${product?.name ?? item.productId}`);
        }
      }

      // 2. Calculate totals
      let subtotal = 0;
      let totalDiscount = 0;
      let totalTax = 0;

      const computedItems = data.items.map((item) => {
        const lineSubtotal = item.price * item.quantity;
        const lineDiscount = item.discount;
        const taxableAmount = lineSubtotal - lineDiscount;
        const taxAmount = data.gstEnabled
          ? parseFloat(((taxableAmount * item.gstPercentage) / 100).toFixed(2))
          : 0;
        const total = taxableAmount + taxAmount;
        subtotal += lineSubtotal;
        totalDiscount += lineDiscount;
        totalTax += taxAmount;
        return { ...item, taxAmount, total };
      });

      const totalAmount = subtotal - totalDiscount + totalTax;
      const actualPayment = data.paymentAmount !== undefined ? data.paymentAmount : totalAmount;

      // 3. Generate invoice number (INV-YYYYMM-XXXX)
      const date = new Date();
      const prefix = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      const lastInvoice = await tx.invoice.findFirst({
        where: { shopId, invoiceNumber: { startsWith: prefix } },
        orderBy: { invoiceNumber: "desc" },
        select: { invoiceNumber: true },
      });
      const nextNum = lastInvoice
        ? parseInt(lastInvoice.invoiceNumber.split('-')[2] || "0", 10) + 1
        : 1;
      const invoiceNumber = `${prefix}-${String(nextNum).padStart(4, "0")}`;

      // 4. Create invoice + items
      const invoice = await tx.invoice.create({
        data: {
          shopId,
          invoiceNumber,
          customerId: finalCustomerId,
          gstEnabled: data.gstEnabled,
          isIgst: data.isIgst,
          subtotal,
          totalDiscount,
          totalTax,
          totalAmount,
          paymentStatus: actualPayment >= totalAmount ? "paid" : (actualPayment > 0 ? "partial" : "unpaid"),
          notes: data.notes,
          items: {
            create: computedItems.map((i) => ({
              productId: i.productId,
              uomId: i.uomId,
              quantity: i.quantity,
              price: i.price,
              discount: i.discount,
              gstPercentage: i.gstPercentage,
              taxAmount: i.taxAmount,
              total: i.total,
            })),
          },
        },
        include: { items: true, customer: true },
      });

      // 5. Reduce inventory
      await Promise.all(
        data.items.map((item) =>
          tx.inventoryLog.create({
            data: {
              shopId,
              productId: item.productId,
              uomId: item.uomId,
              changeType: "sale",
              quantityChange: -item.quantity,
              referenceId: invoice.id,
              referenceType: "invoice",
            },
          })
        )
      );

      // 6. Create payment record (if paid > 0)
      if (actualPayment > 0) {
        await tx.payment.create({
          data: {
            shopId,
            invoiceId: invoice.id,
            referenceType: "invoice",
            referenceId: invoice.id,
            amount: actualPayment,
            mode: data.paymentMode,
          },
        });
      }

      // 7. Create ledger entries (Debit invoice, Credit payment)
      // Debit: Customer owes the whole invoice amount
      await tx.ledgerEntry.create({
        data: {
          shopId,
          entityType: "customer",
          entityId: finalCustomerId,
          debit: totalAmount,
          credit: 0,
          referenceType: "invoice",
          referenceId: invoice.id,
          description: `Sale Invoice ${invoiceNumber}`,
        },
      });

      // Credit: Customer paid the `actualPayment`
      if (actualPayment > 0) {
        await tx.ledgerEntry.create({
          data: {
            shopId,
            entityType: "customer",
            entityId: finalCustomerId,
            debit: 0,
            credit: actualPayment,
            referenceType: "payment",
            referenceId: invoice.id,
            description: `Payment for Invoice ${invoiceNumber}`,
          },
        });
      }

      return invoice;
    });
  },

  async list({ shopId, query }: { shopId: string; query: Record<string, unknown> }) {
    const page = Number(query["page"] ?? 1);
    const limit = Math.min(Number(query["limit"] ?? 20), 100);
    const skip = (page - 1) * limit;
    const where = {
      shopId,
      ...(query["customer_id"] ? { customerId: String(query["customer_id"]) } : {}),
      ...(query["status"] ? { status: String(query["status"]) } : {}),
      ...(query["payment_status"] ? { paymentStatus: String(query["payment_status"]) } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.invoice.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: { customer: true } }),
      prisma.invoice.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async getById(id: string, shopId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, shopId },
      include: { items: { include: { product: true, uom: true } }, customer: true, payments: true },
    });
    if (!invoice) throw new AppError(404, "Invoice not found");
    return invoice;
  },

  async voidInvoice(id: string, shopId: string) {
    const invoice = await prisma.invoice.findFirst({ where: { id, shopId } });
    if (!invoice) throw new AppError(404, "Invoice not found");
    if (invoice.status === "voided") throw new AppError(400, "Invoice already voided");
    await prisma.invoice.update({ where: { id }, data: { status: "voided" } });
    
    // Reverse the ledger and inventory
    // To be implemented fully, but marking status voided is step 1.
  },
};
