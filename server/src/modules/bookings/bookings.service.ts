import { prisma } from '../../config/database.js';

export class BookingsService {
  private static async generateReference(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.booking.count();
    return `BKG-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  static async checkOverlap(startDate: Date, endDate: Date | null, venueName?: string, excludeBookingId?: string) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const overlappingBookings = await prisma.booking.findMany({
      where: {
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        status: { in: ['CONFIRMED', 'IN_PROGRESS', 'TENTATIVE'] },
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
          {
            startDate: { gte: start, lte: end },
          },
        ],
      },
      include: {
        customer: { select: { name: true } },
      },
    });

    const venueConflicts = venueName
      ? overlappingBookings.filter(
          (b) => b.venueName && b.venueName.toLowerCase().trim() === venueName.toLowerCase().trim()
        )
      : [];

    return {
      hasOverlap: overlappingBookings.length > 0,
      overlappingCount: overlappingBookings.length,
      overlappingBookings,
      hasVenueConflict: venueConflicts.length > 0,
      venueConflicts,
    };
  }

  static async createBooking(data: any, userId?: string) {
    const { services, ...rest } = data;
    const reference = await this.generateReference();

    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          ...rest,
          reference,
          startDate: new Date(rest.startDate),
          endDate: rest.endDate ? new Date(rest.endDate) : null,
        },
      });

      if (services && Array.isArray(services) && services.length > 0) {
        for (const item of services) {
          await tx.bookingService.create({
            data: {
              bookingId: booking.id,
              serviceId: item.serviceId || null,
              serviceName: item.serviceName,
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice || 0,
              notes: item.notes || null,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId: userId || null,
          action: 'CREATE',
          entity: 'BOOKING',
          entityId: booking.id,
          details: JSON.stringify({ reference, eventName: booking.eventName }),
        },
      });

      return booking;
    });
  }

  static async getAllBookings(params?: {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, search, startDate, endDate, page = 1, limit = 20 } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate);
      if (endDate) where.startDate.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { eventName: { contains: search } },
        { venueName: { contains: search } },
        { venueCity: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'desc' },
        include: {
          customer: true,
          payments: { select: { amount: true, status: true, paymentType: true } },
          _count: { select: { services: true, assignments: true, quotations: true } },
        },
      }),
    ]);

    const formatted = bookings.map((b) => {
      const totalPaid = b.payments
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => (p.paymentType === 'REFUND' ? sum - p.amount : sum + p.amount), 0);
      const balance = Math.max(0, b.finalAmount - totalPaid);

      return {
        ...b,
        totalPaid,
        balance,
      };
    });

    return {
      bookings: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getBookingById(id: string) {
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id }, { reference: id }],
      },
      include: {
        customer: true,
        enquiry: true,
        services: {
          include: { service: true },
        },
        assignments: {
          include: { staff: true, vendor: true },
        },
        quotations: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        expenses: {
          include: { vendor: true },
          orderBy: { expenseDate: 'desc' },
        },
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const totalPaid = booking.payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => (p.paymentType === 'REFUND' ? sum - p.amount : sum + p.amount), 0);
    const balance = Math.max(0, booking.finalAmount - totalPaid);
    const totalExpenses = booking.expenses.reduce((sum, e) => sum + e.amount, 0);
    const estimatedProfit = totalPaid - totalExpenses;

    return {
      ...booking,
      totalPaid,
      balance,
      totalExpenses,
      estimatedProfit,
    };
  }

  static async updateBooking(id: string, data: any, userId?: string) {
    const { services, startDate, endDate, ...rest } = data;
    const updateData: any = { ...rest };
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: updateData,
      });

      if (services && Array.isArray(services)) {
        await tx.bookingService.deleteMany({ where: { bookingId: id } });
        for (const item of services) {
          await tx.bookingService.create({
            data: {
              bookingId: id,
              serviceId: item.serviceId || null,
              serviceName: item.serviceName,
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice || 0,
              notes: item.notes || null,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId: userId || null,
          action: 'UPDATE',
          entity: 'BOOKING',
          entityId: id,
          details: JSON.stringify({ changes: Object.keys(data) }),
        },
      });

      return updated;
    });
  }

  static async assignStaffOrVendor(bookingId: string, data: any) {
    return prisma.bookingAssignment.create({
      data: {
        bookingId,
        staffId: data.staffId || null,
        vendorId: data.vendorId || null,
        role: data.role,
        notes: data.notes || null,
      },
      include: { staff: true, vendor: true },
    });
  }

  static async removeAssignment(assignmentId: string) {
    return prisma.bookingAssignment.delete({ where: { id: assignmentId } });
  }

  static async deleteBooking(id: string) {
    return prisma.booking.delete({ where: { id } });
  }
}
