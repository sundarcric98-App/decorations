import { query, queryOne, transaction } from '../../config/database.js';

export class PaymentsService {
  private static async generateReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const countRes = await queryOne<{ count: number }>(`SELECT COUNT(*)::int AS count FROM "Payment"`);
    const count = countRes?.count || 0;
    return `RCT-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  static async createPayment(data: any, userId?: string) {
    const receiptNumber = await this.generateReceiptNumber();
    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : new Date();

    return transaction(async (client) => {
      const pRes = await client.query(
        `INSERT INTO "Payment" (
          "receiptNumber", "bookingId", "customerId", "amount", "paymentMethod",
          "paymentType", "reference", "paymentDate", "notes", "status", "recordedByUserId"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          receiptNumber,
          data.bookingId,
          data.customerId,
          Number(data.amount),
          data.paymentMethod || 'UPI',
          data.paymentType || 'ADVANCE',
          data.reference || null,
          paymentDate,
          data.notes || null,
          data.status || 'PAID',
          userId || null,
        ]
      );
      const payment = pRes.rows[0];

      // Get customer name for notification
      const custRes = await client.query(`SELECT "name" FROM "Customer" WHERE "id" = $1`, [data.customerId]);
      const customerName = custRes.rows[0]?.name || 'Customer';

      // Create notification
      await client.query(
        `INSERT INTO "Notification" ("title", "message", "type", "link") VALUES ($1, $2, $3, $4)`,
        [
          'Payment Received',
          `₹${Number(payment.amount).toLocaleString('en-IN')} received from ${customerName} (${receiptNumber})`,
          'PAYMENT',
          '/admin/payments',
        ]
      );

      // Audit Log
      await client.query(
        `INSERT INTO "AuditLog" ("userId", "action", "entity", "entityId", "details") VALUES ($1, $2, $3, $4, $5)`,
        [
          userId || null,
          'CREATE',
          'PAYMENT',
          payment.id,
          JSON.stringify({ receiptNumber, amount: payment.amount, method: payment.paymentMethod }),
        ]
      );

      return PaymentsService.getPaymentById(payment.id);
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
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];

    if (bookingId) {
      values.push(bookingId);
      conditions.push(`p."bookingId" = $${values.length}`);
    }

    if (customerId) {
      values.push(customerId);
      conditions.push(`p."customerId" = $${values.length}`);
    }

    if (paymentMethod && paymentMethod !== 'ALL') {
      values.push(paymentMethod);
      conditions.push(`p."paymentMethod" = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      const sIdx = values.length;
      conditions.push(`(p."receiptNumber" ILIKE $${sIdx} OR p."reference" ILIKE $${sIdx} OR c."name" ILIKE $${sIdx} OR b."reference" ILIKE $${sIdx})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count 
       FROM "Payment" p
       LEFT JOIN "Customer" c ON c."id" = p."customerId"
       LEFT JOIN "Booking" b ON b."id" = p."bookingId"
       ${whereClause}`,
      values
    );
    const total = countRes?.count || 0;

    const dataParams = [...values];
    dataParams.push(limit);
    dataParams.push(offset);
    const limitIdx = dataParams.length - 1;
    const offsetIdx = dataParams.length;

    const sql = `
      SELECT 
        p.*,
        json_build_object('id', c."id", 'name', c."name", 'phone', c."phone") AS customer,
        json_build_object('id', b."id", 'reference', b."reference", 'eventName', b."eventName", 'finalAmount', b."finalAmount") AS booking,
        CASE WHEN u."id" IS NOT NULL THEN json_build_object('id', u."id", 'name', u."name") ELSE NULL END AS "recordedBy"
      FROM "Payment" p
      LEFT JOIN "Customer" c ON c."id" = p."customerId"
      LEFT JOIN "Booking" b ON b."id" = p."bookingId"
      LEFT JOIN "User" u ON u."id" = p."recordedByUserId"
      ${whereClause}
      ORDER BY p."paymentDate" DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const payments = await query<any>(sql, dataParams);

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
    const sql = `
      SELECT 
        p.*,
        row_to_json(c.*) AS customer,
        row_to_json(b.*) AS booking,
        CASE WHEN u."id" IS NOT NULL THEN json_build_object('id', u."id", 'name', u."name") ELSE NULL END AS "recordedBy"
      FROM "Payment" p
      LEFT JOIN "Customer" c ON c."id" = p."customerId"
      LEFT JOIN "Booking" b ON b."id" = p."bookingId"
      LEFT JOIN "User" u ON u."id" = p."recordedByUserId"
      WHERE p."id" = $1 OR p."receiptNumber" = $1
    `;

    const payment = await queryOne<any>(sql, [id]);
    if (!payment) {
      throw new Error('Payment record not found');
    }

    return payment;
  }

  static async deletePayment(id: string, userId?: string) {
    return transaction(async (client) => {
      const pRes = await client.query(`SELECT * FROM "Payment" WHERE "id" = $1`, [id]);
      const payment = pRes.rows[0];
      if (!payment) throw new Error('Payment not found');

      await client.query(
        `INSERT INTO "AuditLog" ("userId", "action", "entity", "entityId", "details") VALUES ($1, $2, $3, $4, $5)`,
        [
          userId || null,
          'DELETE',
          'PAYMENT',
          id,
          JSON.stringify({ receiptNumber: payment.receiptNumber, amount: payment.amount }),
        ]
      );

      const delRes = await client.query(`DELETE FROM "Payment" WHERE "id" = $1 RETURNING *`, [id]);
      return delRes.rows[0];
    });
  }
}
