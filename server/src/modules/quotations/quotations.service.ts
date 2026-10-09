import { query, queryOne, transaction } from '../../config/database.js';

export class QuotationsService {
  private static async generateQuotationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const countRes = await queryOne<{ count: number }>(`SELECT COUNT(*)::int AS count FROM "Quotation"`);
    const count = countRes?.count || 0;
    return `QTN-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  static async createQuotation(data: any, userId?: string) {
    const { items = [], overallDiscount = 0, taxRate = 18, ...rest } = data;

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

    return transaction(async (client) => {
      const qRes = await client.query(
        `INSERT INTO "Quotation" (
          "quotationNumber", "customerId", "bookingId", "enquiryId", "validUntil",
          "subtotal", "discount", "taxRate", "taxAmount", "grandTotal",
          "terms", "exclusions", "paymentSchedule", "status", "notes"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          quotationNumber,
          rest.customerId,
          rest.bookingId || null,
          rest.enquiryId || null,
          new Date(rest.validUntil),
          calculatedSubtotal,
          discount,
          Number(taxRate) || 0,
          taxAmount,
          grandTotal,
          rest.terms || null,
          rest.exclusions || null,
          rest.paymentSchedule || null,
          rest.status || 'DRAFT',
          rest.notes || null,
        ]
      );
      const quotation = qRes.rows[0];

      for (const item of computedItems) {
        await client.query(
          `INSERT INTO "QuotationItem" (
            "quotationId", "serviceId", "name", "description", "quantity", "unit", "unitPrice", "discount", "total"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            quotation.id,
            item.serviceId,
            item.name,
            item.description,
            item.quantity,
            item.unit,
            item.unitPrice,
            item.discount,
            item.total,
          ]
        );
      }

      if (rest.bookingId && rest.status === 'ACCEPTED') {
        await client.query(
          `UPDATE "Booking" SET
            "totalAmount" = $1,
            "discountAmount" = $2,
            "taxAmount" = $3,
            "finalAmount" = $4
          WHERE "id" = $5`,
          [calculatedSubtotal, discount, taxAmount, grandTotal, rest.bookingId]
        );
      }

      if (userId) {
        await client.query(
          `INSERT INTO "AuditLog" ("userId", "action", "entity", "entityId", "details") VALUES ($1, $2, $3, $4, $5)`,
          [userId, 'CREATE', 'QUOTATION', quotation.id, JSON.stringify({ quotationNumber, grandTotal })]
        );
      }

      return QuotationsService.getQuotationById(quotation.id);
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
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];

    if (status && status !== 'ALL') {
      values.push(status);
      conditions.push(`q."status" = $${values.length}`);
    }

    if (customerId) {
      values.push(customerId);
      conditions.push(`q."customerId" = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      const sIdx = values.length;
      conditions.push(`(q."quotationNumber" ILIKE $${sIdx} OR c."name" ILIKE $${sIdx} OR c."phone" ILIKE $${sIdx})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count 
       FROM "Quotation" q
       LEFT JOIN "Customer" c ON c."id" = q."customerId"
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
        q.*,
        json_build_object('id', c."id", 'name', c."name", 'phone', c."phone") AS customer,
        CASE WHEN b."id" IS NOT NULL THEN json_build_object('id', b."id", 'reference', b."reference", 'eventName', b."eventName") ELSE NULL END AS booking,
        (SELECT COUNT(*)::int FROM "QuotationItem" qi WHERE qi."quotationId" = q."id") AS "itemsCount"
      FROM "Quotation" q
      LEFT JOIN "Customer" c ON c."id" = q."customerId"
      LEFT JOIN "Booking" b ON b."id" = q."bookingId"
      ${whereClause}
      ORDER BY q."createdAt" DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const rows = await query<any>(sql, dataParams);
    const quotations = rows.map((r) => ({
      ...r,
      _count: { items: r.itemsCount || 0 },
    }));

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
    const sql = `
      SELECT 
        q.*,
        json_build_object('id', c."id", 'name', c."name", 'phone', c."phone", 'email', c."email", 'address', c."address") AS customer,
        CASE WHEN b."id" IS NOT NULL THEN row_to_json(b.*) ELSE NULL END AS booking,
        CASE WHEN e."id" IS NOT NULL THEN row_to_json(e.*) ELSE NULL END AS enquiry,
        COALESCE(
          json_agg(qi.*) FILTER (WHERE qi."id" IS NOT NULL),
          '[]'::json
        ) AS items
      FROM "Quotation" q
      LEFT JOIN "Customer" c ON c."id" = q."customerId"
      LEFT JOIN "Booking" b ON b."id" = q."bookingId"
      LEFT JOIN "Enquiry" e ON e."id" = q."enquiryId"
      LEFT JOIN "QuotationItem" qi ON qi."quotationId" = q."id"
      WHERE q."id" = $1 OR q."quotationNumber" = $1
      GROUP BY q."id", c."id", b."id", e."id"
    `;

    const quotation = await queryOne<any>(sql, [id]);
    if (!quotation) {
      throw new Error('Quotation not found');
    }

    return quotation;
  }

  static async updateQuotation(id: string, data: any, userId?: string) {
    const existing = await this.getQuotationById(id);
    const { items, overallDiscount, taxRate, validUntil, ...rest } = data;

    const currentTaxRate = taxRate !== undefined ? Number(taxRate) : existing.taxRate;
    const currentDiscount = overallDiscount !== undefined ? Number(overallDiscount) : existing.discount;

    return transaction(async (client) => {
      let calculatedSubtotal = existing.subtotal;

      if (items && Array.isArray(items)) {
        await client.query(`DELETE FROM "QuotationItem" WHERE "quotationId" = $1`, [id]);
        calculatedSubtotal = 0;

        for (const item of items) {
          const lineQty = Number(item.quantity) || 1;
          const lineUnitPrice = Number(item.unitPrice) || 0;
          const lineDiscount = Number(item.discount) || 0;
          const lineTotal = Math.max(0, lineQty * lineUnitPrice - lineDiscount);
          calculatedSubtotal += lineTotal;

          await client.query(
            `INSERT INTO "QuotationItem" (
              "quotationId", "serviceId", "name", "description", "quantity", "unit", "unitPrice", "discount", "total"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              id,
              item.serviceId || null,
              item.name,
              item.description || null,
              lineQty,
              item.unit || 'Set',
              lineUnitPrice,
              lineDiscount,
              lineTotal,
            ]
          );
        }
      }

      const discount = Math.min(calculatedSubtotal, currentDiscount);
      const taxableAmount = Math.max(0, calculatedSubtotal - discount);
      const taxAmount = (taxableAmount * currentTaxRate) / 100;
      const grandTotal = Math.round(taxableAmount + taxAmount);

      const fields: Record<string, any> = {
        ...rest,
        subtotal: calculatedSubtotal,
        discount,
        taxRate: currentTaxRate,
        taxAmount,
        grandTotal,
      };

      if (validUntil) {
        fields.validUntil = new Date(validUntil);
      }

      const setClauses: string[] = [];
      const vals: any[] = [];
      const allowedCols = ['customerId', 'bookingId', 'enquiryId', 'validUntil', 'subtotal', 'discount', 'taxRate', 'taxAmount', 'grandTotal', 'terms', 'exclusions', 'paymentSchedule', 'status', 'notes'];

      allowedCols.forEach((col) => {
        if (fields[col] !== undefined) {
          vals.push(fields[col]);
          setClauses.push(`"${col}" = $${vals.length}`);
        }
      });

      if (setClauses.length > 0) {
        vals.push(id);
        await client.query(`UPDATE "Quotation" SET ${setClauses.join(', ')} WHERE "id" = $${vals.length}`, vals);
      }

      if (rest.status === 'ACCEPTED' && existing.bookingId) {
        await client.query(
          `UPDATE "Booking" SET
            "totalAmount" = $1,
            "discountAmount" = $2,
            "taxAmount" = $3,
            "finalAmount" = $4
          WHERE "id" = $5`,
          [calculatedSubtotal, discount, taxAmount, grandTotal, existing.bookingId]
        );
      }

      if (userId) {
        await client.query(
          `INSERT INTO "AuditLog" ("userId", "action", "entity", "entityId", "details") VALUES ($1, $2, $3, $4, $5)`,
          [userId, 'UPDATE', 'QUOTATION', id, JSON.stringify({ grandTotal, status: rest.status })]
        );
      }

      return QuotationsService.getQuotationById(id);
    });
  }

  static async deleteQuotation(id: string) {
    const deleted = await queryOne<any>(`DELETE FROM "Quotation" WHERE "id" = $1 RETURNING *`, [id]);
    if (!deleted) {
      throw new Error('Quotation not found');
    }
    return deleted;
  }
}
