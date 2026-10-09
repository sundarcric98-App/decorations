import { query, queryOne } from '../../config/database.js';

export class ExpensesService {
  static async getAllExpenses(params?: {
    category?: string;
    bookingId?: string;
    vendorId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { category, bookingId, vendorId, startDate, endDate, page = 1, limit = 20 } = params || {};
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];

    if (category && category !== 'ALL') {
      values.push(category);
      conditions.push(`e."category" = $${values.length}`);
    }

    if (bookingId) {
      values.push(bookingId);
      conditions.push(`e."bookingId" = $${values.length}`);
    }

    if (vendorId) {
      values.push(vendorId);
      conditions.push(`e."vendorId" = $${values.length}`);
    }

    if (startDate) {
      values.push(new Date(startDate));
      conditions.push(`e."expenseDate" >= $${values.length}`);
    }

    if (endDate) {
      values.push(new Date(endDate));
      conditions.push(`e."expenseDate" <= $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM "Expense" e ${whereClause}`,
      values
    );
    const total = countRes?.count || 0;

    const categoryAggregates = await query<{ category: string; total: number }>(
      `SELECT e."category", COALESCE(SUM(e."amount"), 0)::double precision AS total FROM "Expense" e ${whereClause} GROUP BY e."category"`,
      values
    );

    const totalExpenseAmount = categoryAggregates.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

    const dataParams = [...values];
    dataParams.push(limit);
    dataParams.push(offset);
    const limitIdx = dataParams.length - 1;
    const offsetIdx = dataParams.length;

    const dataSql = `
      SELECT 
        e.*,
        CASE WHEN b."id" IS NOT NULL THEN json_build_object('id', b."id", 'reference', b."reference", 'eventName', b."eventName") ELSE NULL END AS booking,
        CASE WHEN v."id" IS NOT NULL THEN json_build_object('id', v."id", 'businessName', v."businessName", 'contactPerson', v."contactPerson") ELSE NULL END AS vendor,
        CASE WHEN u."id" IS NOT NULL THEN json_build_object('id', u."id", 'name', u."name") ELSE NULL END AS "recordedBy"
      FROM "Expense" e
      LEFT JOIN "Booking" b ON b."id" = e."bookingId"
      LEFT JOIN "Vendor" v ON v."id" = e."vendorId"
      LEFT JOIN "User" u ON u."id" = e."recordedByUserId"
      ${whereClause}
      ORDER BY e."expenseDate" DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const expenses = await query<any>(dataSql, dataParams);

    return {
      expenses,
      categoryBreakdown: categoryAggregates.map((c) => ({
        category: c.category,
        total: Number(c.total) || 0,
      })),
      totalExpenseAmount,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getExpenseById(id: string) {
    const sql = `
      SELECT 
        e.*,
        CASE WHEN b."id" IS NOT NULL THEN row_to_json(b.*) ELSE NULL END AS booking,
        CASE WHEN v."id" IS NOT NULL THEN row_to_json(v.*) ELSE NULL END AS vendor,
        CASE WHEN u."id" IS NOT NULL THEN json_build_object('id', u."id", 'name', u."name") ELSE NULL END AS "recordedBy"
      FROM "Expense" e
      LEFT JOIN "Booking" b ON b."id" = e."bookingId"
      LEFT JOIN "Vendor" v ON v."id" = e."vendorId"
      LEFT JOIN "User" u ON u."id" = e."recordedByUserId"
      WHERE e."id" = $1
    `;

    const expense = await queryOne<any>(sql, [id]);
    if (!expense) {
      throw new Error('Expense not found');
    }

    return expense;
  }

  static async createExpense(data: any, userId?: string) {
    const expenseDate = data.expenseDate ? new Date(data.expenseDate) : new Date();
    const recordedByUserId = userId || null;

    const fields = ['category', 'description', 'amount', 'expenseDate', 'bookingId', 'vendorId', 'paymentMethod', 'receiptUrl', 'recordedByUserId'];
    const insertData: any = {
      ...data,
      expenseDate,
      recordedByUserId,
    };

    const cols: string[] = [];
    const vals: any[] = [];

    fields.forEach((f) => {
      if (insertData[f] !== undefined) {
        cols.push(`"${f}"`);
        vals.push(insertData[f]);
      }
    });

    const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO "Expense" (${cols.join(', ')}) VALUES (${placeholders}) RETURNING "id"`;
    const created = await queryOne<{ id: string }>(sql, vals);
    if (!created) throw new Error('Failed to create expense');

    return this.getExpenseById(created.id);
  }

  static async updateExpense(id: string, data: any) {
    const fields = ['category', 'description', 'amount', 'expenseDate', 'bookingId', 'vendorId', 'paymentMethod', 'receiptUrl'];
    const setClauses: string[] = [];
    const vals: any[] = [];

    fields.forEach((f) => {
      if (data[f] !== undefined) {
        const val = f === 'expenseDate' ? new Date(data[f]) : data[f];
        vals.push(val);
        setClauses.push(`"${f}" = $${vals.length}`);
      }
    });

    if (setClauses.length === 0) {
      return this.getExpenseById(id);
    }

    vals.push(id);
    const sql = `UPDATE "Expense" SET ${setClauses.join(', ')} WHERE "id" = $${vals.length} RETURNING *`;
    const updated = await queryOne<any>(sql, vals);
    if (!updated) {
      throw new Error('Expense not found');
    }
    return updated;
  }

  static async deleteExpense(id: string) {
    const deleted = await queryOne<any>(`DELETE FROM "Expense" WHERE "id" = $1 RETURNING *`, [id]);
    if (!deleted) {
      throw new Error('Expense not found');
    }
    return deleted;
  }
}
