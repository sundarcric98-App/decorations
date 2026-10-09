import { prisma } from '../../config/database.js';
import { generateCsv } from '../../utils/csv.js';

export class ReportsService {
  static async getOverviewReports(startDate?: string, endDate?: string) {
    const whereDate: any = {};
    if (startDate || endDate) {
      if (startDate) whereDate.gte = new Date(startDate);
      if (endDate) whereDate.lte = new Date(endDate);
    }

    const [
      totalEnquiries,
      convertedEnquiries,
      totalBookings,
      completedBookings,
      payments,
      expenses,
      serviceCategories,
    ] = await Promise.all([
      prisma.enquiry.count({
        where: Object.keys(whereDate).length ? { createdAt: whereDate } : undefined,
      }),
      prisma.enquiry.count({
        where: {
          status: 'CONVERTED',
          ...(Object.keys(whereDate).length && { createdAt: whereDate }),
        },
      }),
      prisma.booking.count({
        where: Object.keys(whereDate).length ? { startDate: whereDate } : undefined,
      }),
      prisma.booking.count({
        where: {
          status: 'COMPLETED',
          ...(Object.keys(whereDate).length && { startDate: whereDate }),
        },
      }),
      prisma.payment.findMany({
        where: {
          status: 'PAID',
          ...(Object.keys(whereDate).length && { paymentDate: whereDate }),
        },
        select: { amount: true, paymentType: true, paymentMethod: true },
      }),
      prisma.expense.findMany({
        where: Object.keys(whereDate).length ? { expenseDate: whereDate } : undefined,
        select: { amount: true, category: true },
      }),
      prisma.serviceCategory.findMany({
        include: {
          services: {
            include: { _count: { select: { bookingServices: true } } },
          },
        },
      }),
    ]);

    const totalRevenue = payments.reduce(
      (sum: number, p: any) => (p.paymentType === 'REFUND' ? sum - p.amount : sum + p.amount),
      0
    );
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const conversionRate = totalEnquiries > 0 ? ((convertedEnquiries / totalEnquiries) * 100).toFixed(1) : '0';

    // Payment methods breakdown
    const paymentMethods = payments.reduce((acc: Record<string, number>, p: any) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
      return acc;
    }, {});

    // Expense categories breakdown
    const expenseCategories = expenses.reduce((acc: Record<string, number>, e: any) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    // Category Popularity
    const categoryPopularity = serviceCategories.map((c: any) => ({
      name: c.name,
      bookingsCount: c.services.reduce((sum: number, s: any) => sum + s._count.bookingServices, 0),
    }));

    return {
      summary: {
        totalEnquiries,
        convertedEnquiries,
        conversionRate: `${conversionRate}%`,
        totalBookings,
        completedBookings,
        totalRevenue,
        totalExpenses,
        netProfit,
      },
      paymentMethods,
      expenseCategories,
      categoryPopularity,
    };
  }

  static async exportBookingsCsv() {
    const bookings = await prisma.booking.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        customer: true,
        payments: { select: { amount: true, status: true, paymentType: true } },
      },
    });

    const headers = [
      'Booking Reference',
      'Event Name',
      'Event Type',
      'Start Date',
      'End Date',
      'Customer Name',
      'Customer Phone',
      'Venue',
      'City',
      'Status',
      'Total Amount (INR)',
      'Paid Amount (INR)',
      'Balance (INR)',
    ];

    const rows = bookings.map((b: any) => {
      const paid = b.payments
        .filter((p: any) => p.status === 'PAID')
        .reduce((sum: number, p: any) => (p.paymentType === 'REFUND' ? sum - p.amount : sum + p.amount), 0);
      const balance = Math.max(0, b.finalAmount - paid);

      return [
        b.reference,
        b.eventName,
        b.eventType,
        b.startDate.toISOString().split('T')[0],
        b.endDate ? b.endDate.toISOString().split('T')[0] : '',
        b.customer.name,
        b.customer.phone,
        b.venueName || '',
        b.venueCity || '',
        b.status,
        b.finalAmount,
        paid,
        balance,
      ];
    });

    return generateCsv(headers, rows);
  }

  static async exportPaymentsCsv() {
    const payments = await prisma.payment.findMany({
      orderBy: { paymentDate: 'desc' },
      include: {
        customer: true,
        booking: true,
      },
    });

    const headers = [
      'Receipt Number',
      'Date',
      'Customer Name',
      'Phone',
      'Booking Reference',
      'Event Name',
      'Payment Type',
      'Payment Method',
      'Transaction Reference',
      'Amount (INR)',
      'Status',
    ];

    const rows = payments.map((p: any) => [
      p.receiptNumber,
      p.paymentDate.toISOString().split('T')[0],
      p.customer.name,
      p.customer.phone,
      p.booking.reference,
      p.booking.eventName,
      p.paymentType,
      p.paymentMethod,
      p.reference || '',
      p.amount,
      p.status,
    ]);

    return generateCsv(headers, rows);
  }

  static async exportExpensesCsv() {
    const expenses = await prisma.expense.findMany({
      orderBy: { expenseDate: 'desc' },
      include: {
        booking: true,
        vendor: true,
      },
    });

    const headers = [
      'Expense ID',
      'Date',
      'Category',
      'Description',
      'Amount (INR)',
      'Payment Method',
      'Booking Reference',
      'Vendor Name',
    ];

    const rows = expenses.map((e: any) => [
      e.id,
      e.expenseDate.toISOString().split('T')[0],
      e.category,
      e.description,
      e.amount,
      e.paymentMethod,
      e.booking ? e.booking.reference : '',
      e.vendor ? e.vendor.businessName : '',
    ]);

    return generateCsv(headers, rows);
  }
}
