import { query, queryOne } from '../../config/database.js';

export class VendorsService {
  static async getAllVendors(params?: { category?: string; search?: string; onlyActive?: boolean }) {
    const { category, search, onlyActive } = params || {};
    const conditions: string[] = [];
    const values: any[] = [];

    if (onlyActive) {
      conditions.push(`v."isActive" = true`);
    }

    if (category && category !== 'ALL') {
      values.push(category);
      conditions.push(`v."category" = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      const sIdx = values.length;
      conditions.push(`(v."businessName" ILIKE $${sIdx} OR v."contactPerson" ILIKE $${sIdx} OR v."phone" ILIKE $${sIdx})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        v.*,
        (SELECT COUNT(*)::int FROM "BookingAssignment" a WHERE a."vendorId" = v."id") AS "assignmentsCount",
        (SELECT COUNT(*)::int FROM "Expense" e WHERE e."vendorId" = v."id") AS "expensesCount"
      FROM "Vendor" v
      ${whereClause}
      ORDER BY v."businessName" ASC
    `;

    const rows = await query<any>(sql, values);
    return rows.map((r) => ({
      ...r,
      _count: {
        assignments: r.assignmentsCount || 0,
        expenses: r.expensesCount || 0,
      },
    }));
  }

  static async getVendorById(id: string) {
    const vendor = await queryOne<any>(`SELECT * FROM "Vendor" WHERE "id" = $1`, [id]);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const assignmentsSql = `
      SELECT 
        a.*,
        json_build_object(
          'id', b."id",
          'reference', b."reference",
          'eventName', b."eventName",
          'startDate', b."startDate",
          'status', b."status"
        ) AS booking
      FROM "BookingAssignment" a
      LEFT JOIN "Booking" b ON b."id" = a."bookingId"
      WHERE a."vendorId" = $1
      ORDER BY a."assignedAt" DESC
    `;
    const assignments = await query<any>(assignmentsSql, [id]);

    const expenses = await query<any>(
      `SELECT * FROM "Expense" WHERE "vendorId" = $1 ORDER BY "expenseDate" DESC`,
      [id]
    );

    return {
      ...vendor,
      assignments,
      expenses,
    };
  }

  static async createVendor(data: any) {
    const fields = ['businessName', 'contactPerson', 'phone', 'email', 'category', 'servicesSupplied', 'agreedRates', 'notes', 'isActive'];
    const cols: string[] = [];
    const vals: any[] = [];

    fields.forEach((f) => {
      if (data[f] !== undefined) {
        cols.push(`"${f}"`);
        vals.push(data[f]);
      }
    });

    const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO "Vendor" (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    return queryOne<any>(sql, vals);
  }

  static async updateVendor(id: string, data: any) {
    const fields = ['businessName', 'contactPerson', 'phone', 'email', 'category', 'servicesSupplied', 'agreedRates', 'notes', 'isActive'];
    const setClauses: string[] = [];
    const vals: any[] = [];

    fields.forEach((f) => {
      if (data[f] !== undefined) {
        vals.push(data[f]);
        setClauses.push(`"${f}" = $${vals.length}`);
      }
    });

    if (setClauses.length === 0) {
      return this.getVendorById(id);
    }

    vals.push(id);
    const sql = `UPDATE "Vendor" SET ${setClauses.join(', ')} WHERE "id" = $${vals.length} RETURNING *`;
    const updated = await queryOne<any>(sql, vals);
    if (!updated) {
      throw new Error('Vendor not found');
    }
    return updated;
  }

  static async deleteVendor(id: string) {
    const deleted = await queryOne<any>(`DELETE FROM "Vendor" WHERE "id" = $1 RETURNING *`, [id]);
    if (!deleted) {
      throw new Error('Vendor not found');
    }
    return deleted;
  }
}
