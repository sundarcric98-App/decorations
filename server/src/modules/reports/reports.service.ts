import { query, queryOne } from '../../config/database.js';
import { generateCsv } from '../../utils/csv.js';

export class ReportsService {
  static async getOverviewReports(startDate?: string, endDate?: string) {
    const values: any[] = [];
    let enquiryDateCond = '';
    let bookingDateCond = '';
    let paymentDateCond = '';
    let expenseDateCond = '';

    if (startDate || endDate) {
      if (startDate && endDate) {
        values.push(new Date(startDate), new Date(endDate));
        enquiryDateCond = `AND e."createdAt" >= $1 AND e."createdAt" <= $2`;
        bookingDateCond = `AND b."startDate" >= $1 AND b."startDate" <= $2`;
        paymentDateCond = `AND p."paymentDate" >= $1 AND p."paymentDate" <= $2`;
        expenseDateCond = `AND ex."expenseDate" >= $1 AND ex."expenseDate" <= $2`;
      } else if (startDate) {
        values.push(new Date(startDate));
        enquiryDateCond = `AND e."createdAt" >= $1`;
        bookingDateCond = `AND b."startDate" >= $1`;
        paymentDateCond = `AND p."paymentDate" >= $1`;
        expenseDateCond = `AND ex."expenseDate" >= $1`;
      } else if (endDate) {
        values.push(new Date(endDate));
        enquiryDateCond = `AND e."createdAt" <= $1`;
        bookingDateCond = `AND b."startDate" <= $1`;
        paymentDateCond = `AND p."paymentDate" <= $1`;
        expenseDateCond = `AND ex."expenseDate" <= $1`;
      }
    }

    const [
      totalEnquiriesRes,
      convertedEnquiriesRes,
      totalBookingsRes,
      completedBookingsRes,
      payments,
      expenses,
      categoryPopularity,
    ] = await Promise.all([
      queryOne<{ count: number }>(`SELECT COUNT(*)::int AS count FROM "Enquiry" e WHERE 1=1 ${enquiryDateCond}`, values),
      queryOne<{ count: number }>(`SELECT COUNT(*)::int AS count FROM "Enquiry" e WHERE e."status" = 'CONVERTED' ${enquiryDateCond}`, values),
      queryOne<{ count: number }>(`SELECT COUNT(*)::int AS count FROM "Booking" b WHERE 1=1 ${bookingDateCond}`, values),
      queryOne<{ count: number }>(`SELECT COUNT(*)::int AS count FROM "Booking" b WHERE b."status" = 'COMPLETED' ${bookingDateCond}`, values),
      query<{ amount: number; paymentType: string; paymentMethod: string }>(
        `SELECT p."amount", p."paymentType", p."paymentMethod" FROM "Payment" p WHERE p."status" = 'PAID' ${paymentDateCond}`,
        values
      ),
      query<{ amount: number; category: string }>(
        `SELECT ex."amount", ex."category" FROM "Expense" ex WHERE 1=1 ${expenseDateCond}`,
        values
      ),
      query<{ name: string; bookingsCount: number }>(
        `SELECT 
           sc."name",
           (
             SELECT COUNT(*)::int 
             FROM "BookingService" bs 
             JOIN "Service" s ON s."id" = bs."serviceId" 
             WHERE s."categoryId" = sc."id"
           ) AS "bookingsCount"
         FROM "ServiceCategory" sc
         ORDER BY sc."sortOrder" ASC`
      ),
    ]);

    const totalEnquiries = totalEnquiriesRes?.count || 0;
    const convertedEnquiries = convertedEnquiriesRes?.count || 0;
    const totalBookings = totalBookingsRes?.count || 0;
    const completedBookings = completedBookingsRes?.count || 0;

    const totalRevenue = payments.reduce(
      (sum: number, p: any) => (p.paymentType === 'REFUND' ? sum - Number(p.amount) : sum + Number(p.amount)),
      0
    );
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    const netProfit = totalRevenue - totalExpenses;
    const conversionRate = totalEnquiries > 0 ? ((convertedEnquiries / totalEnquiries) * 100).toFixed(1) : '0';

    // Payment methods breakdown
    const paymentMethods = payments.reduce((acc: Record<string, number>, p: any) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + Number(p.amount);
      return acc;
    }, {});

    // Expense categories breakdown
    const expenseCategories = expenses.reduce((acc: Record<string, number>, e: any) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {});

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
      categoryPopularity: categoryPopularity.map((c) => ({
        name: c.name,
        bookingsCount: Number(c.bookingsCount) || 0,
      })),
    };
  }

  static async exportBookingsCsv() {
    const sql = `
      SELECT 
        b.*,
        json_build_object('name', c."name", 'phone', c."phone") AS customer,
        COALESCE(
          (
            SELECT json_agg(json_build_object('amount', p."amount", 'status', p."status", 'paymentType', p."paymentType"))
            FROM "Payment" p WHERE p."bookingId" = b."id"
          ),
          '[]'::json
        ) AS payments
      FROM "Booking" b
      LEFT JOIN "Customer" c ON c."id" = b."customerId"
      ORDER BY b."startDate" DESC
    `;

    const bookings = await query<any>(sql);

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
      const payments = Array.isArray(b.payments) ? b.payments : [];
      const paid = payments
        .filter((p: any) => p.status === 'PAID')
        .reduce((sum: number, p: any) => (p.paymentType === 'REFUND' ? sum - Number(p.amount) : sum + Number(p.amount)), 0);
      const balance = Math.max(0, Number(b.finalAmount) - paid);

      return [
        b.reference,
        b.eventName,
        b.eventType,
        new Date(b.startDate).toISOString().split('T')[0],
        b.endDate ? new Date(b.endDate).toISOString().split('T')[0] : '',
        b.customer?.name || '',
        b.customer?.phone || '',
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
    const sql = `
      SELECT 
        p.*,
        json_build_object('name', c."name", 'phone', c."phone") AS customer,
        json_build_object('reference', b."reference", 'eventName', b."eventName") AS booking
      FROM "Payment" p
      LEFT JOIN "Customer" c ON c."id" = p."customerId"
      LEFT JOIN "Booking" b ON b."id" = p."bookingId"
      ORDER BY p."paymentDate" DESC
    `;

    const payments = await query<any>(sql);

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
      new Date(p.paymentDate).toISOString().split('T')[0],
      p.customer?.name || '',
      p.customer?.phone || '',
      p.booking?.reference || '',
      p.booking?.eventName || '',
      p.paymentType,
      p.paymentMethod,
      p.reference || '',
      p.amount,
      p.status,
    ]);

    return generateCsv(headers, rows);
  }

  static async exportExpensesCsv() {
    const sql = `
      SELECT 
        ex.*,
        json_build_object('reference', b."reference") AS booking,
        json_build_object('businessName', v."businessName") AS vendor
      FROM "Expense" ex
      LEFT JOIN "Booking" b ON b."id" = ex."bookingId"
      LEFT JOIN "Vendor" v ON v."id" = ex."vendorId"
      ORDER BY ex."expenseDate" DESC
    `;

    const expenses = await query<any>(sql);

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
      new Date(e.expenseDate).toISOString().split('T')[0],
      e.category,
      e.description,
      e.amount,
      e.paymentMethod,
      e.booking?.reference || '',
      e.vendor?.businessName || '',
    ]);

    return generateCsv(headers, rows);
  }
}
