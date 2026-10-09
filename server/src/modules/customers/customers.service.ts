import { query, queryOne } from '../../config/database.js';

export class CustomersService {
  static async getAllCustomers(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, page = 1, limit = 20 } = params || {};
    const offset = (page - 1) * limit;

    let whereClause = '';
    const queryParams: any[] = [];

    if (search) {
      queryParams.push(`%${search}%`);
      whereClause = `WHERE ("name" ILIKE $1 OR "phone" ILIKE $1 OR "email" ILIKE $1 OR "address" ILIKE $1)`;
    }

    const countSql = `SELECT COUNT(*)::int AS count FROM "Customer" ${whereClause}`;
    const countRes = await queryOne<{ count: number }>(countSql, queryParams);
    const total = countRes?.count || 0;

    const dataParams = [...queryParams];
    dataParams.push(limit);
    dataParams.push(offset);
    const limitIdx = dataParams.length - 1;
    const offsetIdx = dataParams.length;

    const sql = `
      SELECT c.*,
        (SELECT COUNT(*)::int FROM "Enquiry" e WHERE e."customerId" = c."id") AS "enquiriesCount",
        (SELECT COUNT(*)::int FROM "Booking" b WHERE b."customerId" = c."id") AS "bookingsCount",
        (SELECT COUNT(*)::int FROM "Quotation" q WHERE q."customerId" = c."id") AS "quotationsCount",
        (SELECT COUNT(*)::int FROM "Payment" p WHERE p."customerId" = c."id") AS "paymentsCount"
      FROM "Customer" c
      ${whereClause}
      ORDER BY c."createdAt" DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const rows = await query<any>(sql, dataParams);

    const customers = rows.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      email: r.email,
      address: r.address,
      notes: r.notes,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      _count: {
        enquiries: r.enquiriesCount || 0,
        bookings: r.bookingsCount || 0,
        quotations: r.quotationsCount || 0,
        payments: r.paymentsCount || 0,
      },
    }));

    return {
      customers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCustomerById(id: string) {
    const customer = await queryOne<any>(`SELECT * FROM "Customer" WHERE "id" = $1`, [id]);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const enquiries = await query<any>(
      `SELECT * FROM "Enquiry" WHERE "customerId" = $1 ORDER BY "createdAt" DESC`,
      [id]
    );

    const bookings = await query<any>(
      `SELECT * FROM "Booking" WHERE "customerId" = $1 ORDER BY "startDate" DESC`,
      [id]
    );

    // Fetch payments for each booking or customer
    const payments = await query<any>(
      `SELECT * FROM "Payment" WHERE "customerId" = $1 ORDER BY "paymentDate" DESC`,
      [id]
    );

    const quotations = await query<any>(
      `SELECT * FROM "Quotation" WHERE "customerId" = $1 ORDER BY "createdAt" DESC`,
      [id]
    );

    const bookingsWithPayments = bookings.map((b) => ({
      ...b,
      payments: payments.filter((p) => p.bookingId === b.id),
    }));

    return {
      ...customer,
      enquiries,
      bookings: bookingsWithPayments,
      quotations,
      payments,
    };
  }

  static async createCustomer(data: any) {
    const fields = ['name', 'phone', 'email', 'address', 'notes'];
    const setCols: string[] = [];
    const values: any[] = [];

    fields.forEach((f) => {
      if (data[f] !== undefined) {
        setCols.push(`"${f}"`);
        values.push(data[f]);
      }
    });

    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO "Customer" (${setCols.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    return queryOne<any>(sql, values);
  }

  static async updateCustomer(id: string, data: any) {
    const fields = ['name', 'phone', 'email', 'address', 'notes'];
    const setClauses: string[] = [];
    const values: any[] = [];

    fields.forEach((f) => {
      if (data[f] !== undefined) {
        values.push(data[f]);
        setClauses.push(`"${f}" = $${values.length}`);
      }
    });

    if (setClauses.length === 0) {
      return this.getCustomerById(id);
    }

    values.push(id);
    const sql = `UPDATE "Customer" SET ${setClauses.join(', ')} WHERE "id" = $${values.length} RETURNING *`;
    const updated = await queryOne<any>(sql, values);
    if (!updated) {
      throw new Error('Customer not found');
    }
    return updated;
  }

  static async deleteCustomer(id: string) {
    const deleted = await queryOne<any>(`DELETE FROM "Customer" WHERE "id" = $1 RETURNING *`, [id]);
    if (!deleted) {
      throw new Error('Customer not found');
    }
    return deleted;
  }
}
