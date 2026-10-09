import { query, queryOne, transaction } from '../../config/database.js';

export class BookingsService {
  private static async generateReference(): Promise<string> {
    const year = new Date().getFullYear();
    const countRes = await queryOne<{ count: number }>(`SELECT COUNT(*)::int AS count FROM "Booking"`);
    const count = countRes?.count || 0;
    return `BKG-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  static async checkOverlap(startDate: Date, endDate: Date | null, venueName?: string, excludeBookingId?: string) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const conditions: string[] = [
      `b."status" IN ('CONFIRMED', 'IN_PROGRESS', 'TENTATIVE')`,
      `((b."startDate" <= $2 AND b."endDate" >= $1) OR (b."startDate" >= $1 AND b."startDate" <= $2))`,
    ];
    const values: any[] = [start, end];

    if (excludeBookingId) {
      values.push(excludeBookingId);
      conditions.push(`b."id" != $${values.length}`);
    }

    const sql = `
      SELECT 
        b.*,
        json_build_object('name', c."name") AS customer
      FROM "Booking" b
      LEFT JOIN "Customer" c ON c."id" = b."customerId"
      WHERE ${conditions.join(' AND ')}
    `;

    const overlappingBookings = await query<any>(sql, values);

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
    const startDate = new Date(rest.startDate);
    const endDate = rest.endDate ? new Date(rest.endDate) : null;

    return transaction(async (client) => {
      const bRes = await client.query(
        `INSERT INTO "Booking" (
          "reference", "customerId", "enquiryId", "eventName", "eventType",
          "startDate", "endDate", "venueName", "venueAddress", "venueCity",
          "guestCount", "status", "totalAmount", "discountAmount", "taxAmount",
          "finalAmount", "internalNotes", "termsAndConditions"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *`,
        [
          reference,
          rest.customerId,
          rest.enquiryId || null,
          rest.eventName,
          rest.eventType,
          startDate,
          endDate,
          rest.venueName || null,
          rest.venueAddress || null,
          rest.venueCity || null,
          rest.guestCount || null,
          rest.status || 'CONFIRMED',
          Number(rest.totalAmount) || 0,
          Number(rest.discountAmount) || 0,
          Number(rest.taxAmount) || 0,
          Number(rest.finalAmount) || 0,
          rest.internalNotes || null,
          rest.termsAndConditions || null,
        ]
      );
      const booking = bRes.rows[0];

      if (services && Array.isArray(services) && services.length > 0) {
        for (const item of services) {
          await client.query(
            `INSERT INTO "BookingService" (
              "bookingId", "serviceId", "serviceName", "quantity", "unitPrice", "notes"
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              booking.id,
              item.serviceId || null,
              item.serviceName,
              item.quantity || 1,
              item.unitPrice || 0,
              item.notes || null,
            ]
          );
        }
      }

      await client.query(
        `INSERT INTO "AuditLog" ("userId", "action", "entity", "entityId", "details") VALUES ($1, $2, $3, $4, $5)`,
        [
          userId || null,
          'CREATE',
          'BOOKING',
          booking.id,
          JSON.stringify({ reference, eventName: booking.eventName }),
        ]
      );

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
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];

    if (status && status !== 'ALL') {
      values.push(status);
      conditions.push(`b."status" = $${values.length}`);
    }

    if (startDate) {
      values.push(new Date(startDate));
      conditions.push(`b."startDate" >= $${values.length}`);
    }

    if (endDate) {
      values.push(new Date(endDate));
      conditions.push(`b."startDate" <= $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      const sIdx = values.length;
      conditions.push(`(b."reference" ILIKE $${sIdx} OR b."eventName" ILIKE $${sIdx} OR b."venueName" ILIKE $${sIdx} OR b."venueCity" ILIKE $${sIdx} OR c."name" ILIKE $${sIdx} OR c."phone" ILIKE $${sIdx})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count 
       FROM "Booking" b
       LEFT JOIN "Customer" c ON c."id" = b."customerId"
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
        b.*,
        row_to_json(c.*) AS customer,
        COALESCE(
          (
            SELECT json_agg(json_build_object('amount', p."amount", 'status', p."status", 'paymentType', p."paymentType"))
            FROM "Payment" p WHERE p."bookingId" = b."id"
          ),
          '[]'::json
        ) AS payments,
        (SELECT COUNT(*)::int FROM "BookingService" bs WHERE bs."bookingId" = b."id") AS "servicesCount",
        (SELECT COUNT(*)::int FROM "BookingAssignment" ba WHERE ba."bookingId" = b."id") AS "assignmentsCount",
        (SELECT COUNT(*)::int FROM "Quotation" q WHERE q."bookingId" = b."id") AS "quotationsCount"
      FROM "Booking" b
      LEFT JOIN "Customer" c ON c."id" = b."customerId"
      ${whereClause}
      ORDER BY b."startDate" DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const rows = await query<any>(sql, dataParams);

    const formatted = rows.map((b) => {
      const payments = Array.isArray(b.payments) ? b.payments : [];
      const totalPaid = payments
        .filter((p: any) => p.status === 'PAID')
        .reduce((sum: number, p: any) => (p.paymentType === 'REFUND' ? sum - Number(p.amount) : sum + Number(p.amount)), 0);
      const balance = Math.max(0, Number(b.finalAmount) - totalPaid);

      return {
        ...b,
        totalPaid,
        balance,
        _count: {
          services: b.servicesCount || 0,
          assignments: b.assignmentsCount || 0,
          quotations: b.quotationsCount || 0,
        },
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
    const bookingSql = `
      SELECT 
        b.*,
        row_to_json(c.*) AS customer,
        CASE WHEN e."id" IS NOT NULL THEN row_to_json(e.*) ELSE NULL END AS enquiry,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', bs."id",
                'bookingId', bs."bookingId",
                'serviceId', bs."serviceId",
                'serviceName', bs."serviceName",
                'quantity', bs."quantity",
                'unitPrice', bs."unitPrice",
                'notes', bs."notes",
                'service', CASE WHEN s."id" IS NOT NULL THEN row_to_json(s.*) ELSE NULL END
              )
            )
            FROM "BookingService" bs
            LEFT JOIN "Service" s ON s."id" = bs."serviceId"
            WHERE bs."bookingId" = b."id"
          ),
          '[]'::json
        ) AS services,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', ba."id",
                'bookingId', ba."bookingId",
                'staffId', ba."staffId",
                'vendorId', ba."vendorId",
                'role', ba."role",
                'notes', ba."notes",
                'assignedAt', ba."assignedAt",
                'staff', CASE WHEN sp."id" IS NOT NULL THEN row_to_json(sp.*) ELSE NULL END,
                'vendor', CASE WHEN v."id" IS NOT NULL THEN row_to_json(v.*) ELSE NULL END
              )
            )
            FROM "BookingAssignment" ba
            LEFT JOIN "StaffProfile" sp ON sp."id" = ba."staffId"
            LEFT JOIN "Vendor" v ON v."id" = ba."vendorId"
            WHERE ba."bookingId" = b."id"
          ),
          '[]'::json
        ) AS assignments,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', q."id",
                'quotationNumber', q."quotationNumber",
                'grandTotal', q."grandTotal",
                'status', q."status",
                'createdAt', q."createdAt",
                'items', (SELECT json_agg(qi.*) FROM "QuotationItem" qi WHERE qi."quotationId" = q."id")
              ) ORDER BY q."createdAt" DESC
            )
            FROM "Quotation" q
            WHERE q."bookingId" = b."id"
          ),
          '[]'::json
        ) AS quotations,
        COALESCE(
          (
            SELECT json_agg(p.* ORDER BY p."paymentDate" DESC)
            FROM "Payment" p
            WHERE p."bookingId" = b."id"
          ),
          '[]'::json
        ) AS payments,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', ex."id",
                'category', ex."category",
                'description', ex."description",
                'amount', ex."amount",
                'expenseDate', ex."expenseDate",
                'paymentMethod', ex."paymentMethod",
                'vendor', CASE WHEN ev."id" IS NOT NULL THEN row_to_json(ev.*) ELSE NULL END
              ) ORDER BY ex."expenseDate" DESC
            )
            FROM "Expense" ex
            LEFT JOIN "Vendor" ev ON ev."id" = ex."vendorId"
            WHERE ex."bookingId" = b."id"
          ),
          '[]'::json
        ) AS expenses
      FROM "Booking" b
      LEFT JOIN "Customer" c ON c."id" = b."customerId"
      LEFT JOIN "Enquiry" e ON e."id" = b."enquiryId"
      WHERE b."id" = $1 OR b."reference" = $1
    `;

    const booking = await queryOne<any>(bookingSql, [id]);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const payments = Array.isArray(booking.payments) ? booking.payments : [];
    const expenses = Array.isArray(booking.expenses) ? booking.expenses : [];

    const totalPaid = payments
      .filter((p: any) => p.status === 'PAID')
      .reduce((sum: number, p: any) => (p.paymentType === 'REFUND' ? sum - Number(p.amount) : sum + Number(p.amount)), 0);
    const balance = Math.max(0, Number(booking.finalAmount) - totalPaid);
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
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
    const allowedFields = [
      'customerId', 'enquiryId', 'eventName', 'eventType', 'startDate', 'endDate',
      'venueName', 'venueAddress', 'venueCity', 'guestCount', 'status',
      'totalAmount', 'discountAmount', 'taxAmount', 'finalAmount', 'internalNotes', 'termsAndConditions'
    ];

    const fieldsToUpdate: Record<string, any> = { ...rest };
    if (startDate) fieldsToUpdate.startDate = new Date(startDate);
    if (endDate !== undefined) fieldsToUpdate.endDate = endDate ? new Date(endDate) : null;

    return transaction(async (client) => {
      const setClauses: string[] = [];
      const vals: any[] = [];

      allowedFields.forEach((f) => {
        if (fieldsToUpdate[f] !== undefined) {
          vals.push(fieldsToUpdate[f]);
          setClauses.push(`"${f}" = $${vals.length}`);
        }
      });

      if (setClauses.length > 0) {
        vals.push(id);
        await client.query(`UPDATE "Booking" SET ${setClauses.join(', ')} WHERE "id" = $${vals.length}`, vals);
      }

      if (services && Array.isArray(services)) {
        await client.query(`DELETE FROM "BookingService" WHERE "bookingId" = $1`, [id]);
        for (const item of services) {
          await client.query(
            `INSERT INTO "BookingService" (
              "bookingId", "serviceId", "serviceName", "quantity", "unitPrice", "notes"
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              id,
              item.serviceId || null,
              item.serviceName,
              item.quantity || 1,
              item.unitPrice || 0,
              item.notes || null,
            ]
          );
        }
      }

      if (userId) {
        await client.query(
          `INSERT INTO "AuditLog" ("userId", "action", "entity", "entityId", "details") VALUES ($1, $2, $3, $4, $5)`,
          [
            userId,
            'UPDATE',
            'BOOKING',
            id,
            JSON.stringify({ changes: Object.keys(data) }),
          ]
        );
      }

      return BookingsService.getBookingById(id);
    });
  }

  static async assignStaffOrVendor(bookingId: string, data: any) {
    const res = await queryOne<any>(
      `INSERT INTO "BookingAssignment" ("bookingId", "staffId", "vendorId", "role", "notes")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [bookingId, data.staffId || null, data.vendorId || null, data.role, data.notes || null]
    );

    if (!res) throw new Error('Failed to create assignment');

    const assignmentSql = `
      SELECT 
        ba.*,
        CASE WHEN sp."id" IS NOT NULL THEN row_to_json(sp.*) ELSE NULL END AS staff,
        CASE WHEN v."id" IS NOT NULL THEN row_to_json(v.*) ELSE NULL END AS vendor
      FROM "BookingAssignment" ba
      LEFT JOIN "StaffProfile" sp ON sp."id" = ba."staffId"
      LEFT JOIN "Vendor" v ON v."id" = ba."vendorId"
      WHERE ba."id" = $1
    `;

    return queryOne<any>(assignmentSql, [res.id]);
  }

  static async removeAssignment(assignmentId: string) {
    const deleted = await queryOne<any>(`DELETE FROM "BookingAssignment" WHERE "id" = $1 RETURNING *`, [assignmentId]);
    if (!deleted) {
      throw new Error('Assignment not found');
    }
    return deleted;
  }

  static async deleteBooking(id: string) {
    const deleted = await queryOne<any>(`DELETE FROM "Booking" WHERE "id" = $1 RETURNING *`, [id]);
    if (!deleted) {
      throw new Error('Booking not found');
    }
    return deleted;
  }
}
