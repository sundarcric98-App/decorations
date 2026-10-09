import { prisma } from '../../config/database.js';

export class PaymentsService {
  private static async generateReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.payment.count();
    return `RCT-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  static async createPayment(data: any, userId?: string) {
    const receiptNumber = await this.generateReceiptNumber();

    return prisma.$transaction(async (tx: any) => {
      const payment = await tx.payment.create({
        data: {
          ...data,
          receiptNumber,
          paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
          recordedByUserId: userId || null,
        },
        include: {
          customer: true,
          booking: true,
          recordedBy: { select: { id: true, name: true } },
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          title: 'Payment Received',
          message: `₹${Number(payment.amount).toLocaleString('en-IN')} received from ${payment.customer.name} (${receiptNumber})`,
          type: 'PAYMENT',
          link: `/admin/payments`,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: userId || null,
          action: 'CREATE',
          entity: 'PAYMENT',
          entityId: payment.id,
          details: JSON.stringify({ receiptNumber, amount: payment.amount, method: payment.paymentMethod }),
        },
      });

      return payment;
    });
  }

  static async getAllPayments(params?: {
    bookingId?: string;
    customerId?: string;
    paymentMethod?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { bookingId, customerId, paymentMethod, search, page = 1, limit = 20 } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (bookingId) where.bookingId = bookingId;
    if (customerId) where.customerId = customerId;
    if (paymentMethod && paymentMethod !== 'ALL') where.paymentMethod = paymentMethod;
    if (search) {
      where.OR = [
        { receiptNumber: { contains: search } },
        { reference: { contains: search } },
        { customer: { name: { contains: search } } },
        { booking: { reference: { contains: search } } },
      ];
    }

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paymentDate: 'desc' },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          booking: { select: { id: true, reference: true, eventName: true, finalAmount: true } },
          recordedBy: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      payments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getPaymentById(id: string) {
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ id }, { receiptNumber: id }],
      },
      include: {
        customer: true,
        booking: true,
        recordedBy: { select: { id: true, name: true } },
      },
    });

    if (!payment) {
      throw new Error('Payment record not found');
    }

    return payment;
  }

  static async deletePayment(id: string, userId?: string) {
    return prisma.$transaction(async (tx: any) => {
      const payment = await tx.payment.findUnique({ where: { id } });
      if (!payment) throw new Error('Payment not found');

      await tx.auditLog.create({
        data: {
          userId: userId || null,
          action: 'DELETE',
          entity: 'PAYMENT',
          entityId: id,
          details: JSON.stringify({ receiptNumber: payment.receiptNumber, amount: payment.amount }),
        },
      });

      return tx.payment.delete({ where: { id } });
    });
  }
}
