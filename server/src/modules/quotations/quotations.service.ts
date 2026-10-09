import { prisma } from '../../config/database.js';

export class QuotationsService {
  private static async generateQuotationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.quotation.count();
    return `QTN-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  static async createQuotation(data: any, userId?: string) {
    const { items, overallDiscount = 0, taxRate = 18, ...rest } = data;

    // Recalculate line item totals and subtotal on server
    let calculatedSubtotal = 0;
    const computedItems = items.map((item: any) => {
      const lineQty = Number(item.quantity) || 1;
      const lineUnitPrice = Number(item.unitPrice) || 0;
      const lineDiscount = Number(item.discount) || 0;
      const lineTotal = Math.max(0, lineQty * lineUnitPrice - lineDiscount);
      calculatedSubtotal += lineTotal;

      return {
        serviceId: item.serviceId || null,
        name: item.name,
        description: item.description || null,
        quantity: lineQty,
        unit: item.unit || 'Set',
        unitPrice: lineUnitPrice,
        discount: lineDiscount,
        total: lineTotal,
      };
    });

    const discount = Math.min(calculatedSubtotal, Number(overallDiscount) || 0);
    const taxableAmount = Math.max(0, calculatedSubtotal - discount);
    const taxAmount = (taxableAmount * (Number(taxRate) || 0)) / 100;
    const grandTotal = Math.round(taxableAmount + taxAmount);

    const quotationNumber = await this.generateQuotationNumber();

    return prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.create({
        data: {
          ...rest,
          quotationNumber,
          validUntil: new Date(rest.validUntil),
          subtotal: calculatedSubtotal,
          discount,
          taxRate: Number(taxRate) || 0,
          taxAmount,
          grandTotal,
        },
      });

      for (const item of computedItems) {
        await tx.quotationItem.create({
          data: {
            quotationId: quotation.id,
            ...item,
          },
        });
      }

      // If linked to booking and accepted, update booking total
      if (rest.bookingId && rest.status === 'ACCEPTED') {
        await tx.booking.update({
          where: { id: rest.bookingId },
          data: {
            totalAmount: calculatedSubtotal,
            discountAmount: discount,
            taxAmount,
            finalAmount: grandTotal,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: userId || null,
          action: 'CREATE',
          entity: 'QUOTATION',
          entityId: quotation.id,
          details: JSON.stringify({ quotationNumber, grandTotal }),
        },
      });

      return tx.quotation.findUnique({
        where: { id: quotation.id },
        include: { items: true, customer: true, booking: true },
      });
    });
  }

  static async getAllQuotations(params?: {
    status?: string;
    search?: string;
    customerId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, search, customerId, page = 1, limit = 20 } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (customerId) where.customerId = customerId;
    if (search) {
      where.OR = [
        { quotationNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    const [total, quotations] = await Promise.all([
      prisma.quotation.count({ where }),
      prisma.quotation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          booking: { select: { id: true, reference: true, eventName: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);

    return {
      quotations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getQuotationById(id: string) {
    const quotation = await prisma.quotation.findFirst({
      where: {
        OR: [{ id }, { quotationNumber: id }],
      },
      include: {
        customer: true,
        booking: true,
        enquiry: true,
        items: true,
      },
    });

    if (!quotation) {
      throw new Error('Quotation not found');
    }

    return quotation;
  }

  static async updateQuotation(id: string, data: any, userId?: string) {
    const { items, overallDiscount, taxRate, validUntil, ...rest } = data;
    const existing = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      throw new Error('Quotation not found');
    }

    const currentTaxRate = taxRate !== undefined ? Number(taxRate) : existing.taxRate;
    const currentDiscount = overallDiscount !== undefined ? Number(overallDiscount) : existing.discount;

    return prisma.$transaction(async (tx) => {
      let calculatedSubtotal = existing.subtotal;

      if (items && Array.isArray(items)) {
        await tx.quotationItem.deleteMany({ where: { quotationId: id } });
        calculatedSubtotal = 0;

        for (const item of items) {
          const lineQty = Number(item.quantity) || 1;
          const lineUnitPrice = Number(item.unitPrice) || 0;
          const lineDiscount = Number(item.discount) || 0;
          const lineTotal = Math.max(0, lineQty * lineUnitPrice - lineDiscount);
          calculatedSubtotal += lineTotal;

          await tx.quotationItem.create({
            data: {
              quotationId: id,
              serviceId: item.serviceId || null,
              name: item.name,
              description: item.description || null,
              quantity: lineQty,
              unit: item.unit || 'Set',
              unitPrice: lineUnitPrice,
              discount: lineDiscount,
              total: lineTotal,
            },
          });
        }
      }

      const discount = Math.min(calculatedSubtotal, currentDiscount);
      const taxableAmount = Math.max(0, calculatedSubtotal - discount);
      const taxAmount = (taxableAmount * currentTaxRate) / 100;
      const grandTotal = Math.round(taxableAmount + taxAmount);

      const updateData: any = {
        ...rest,
        subtotal: calculatedSubtotal,
        discount,
        taxRate: currentTaxRate,
        taxAmount,
        grandTotal,
      };

      if (validUntil) updateData.validUntil = new Date(validUntil);

      const updated = await tx.quotation.update({
        where: { id },
        data: updateData,
        include: { items: true, customer: true, booking: true },
      });

      // If status changed to ACCEPTED and linked to booking, sync booking amount
      if (rest.status === 'ACCEPTED' && existing.bookingId) {
        await tx.booking.update({
          where: { id: existing.bookingId },
          data: {
            totalAmount: calculatedSubtotal,
            discountAmount: discount,
            taxAmount,
            finalAmount: grandTotal,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: userId || null,
          action: 'UPDATE',
          entity: 'QUOTATION',
          entityId: id,
          details: JSON.stringify({ grandTotal, status: rest.status }),
        },
      });

      return updated;
    });
  }

  static async deleteQuotation(id: string) {
    return prisma.quotation.delete({ where: { id } });
  }
}
