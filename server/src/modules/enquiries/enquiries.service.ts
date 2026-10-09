import { db } from '../../config/database.js';

export class EnquiriesService {
  private static async generateReference(): Promise<string> {
    const year = new Date().getFullYear();
    const countRes = await db.queryOne(`SELECT COUNT(*)::int AS count FROM "Enquiry"`);
    const count = countRes ? countRes.count : 0;
    const sequence = String(count + 1).padStart(4, '0');
    return `ENQ-${year}-${sequence}`;
  }

  static async createEnquiry(data: any) {
    const {
      name,
      phone,
      email,
      preferredContactMethod,
      eventType,
      eventTitle,
      eventDate,
      endDate,
      venueName,
      venueAddress,
      venueCity,
      guestCount,
      isOutdoor,
      selectedServiceIds,
      selectedPackageId,
      customRequirements,
      inspirationImages,
      budgetRange,
      consultationTime,
      additionalNotes,
    } = data;

    // Find or create customer by phone
    let customer = await db.queryOne(`SELECT * FROM "Customer" WHERE phone = $1 LIMIT 1`, [phone.trim()]);

    if (!customer) {
      customer = await db.queryOne(
        `INSERT INTO "Customer" (name, phone, email)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name.trim(), phone.trim(), email ? email.trim().toLowerCase() : null]
      );
    } else if (email && !customer.email) {
      customer = await db.queryOne(
        `UPDATE "Customer" SET email = $1 WHERE id = $2 RETURNING *`,
        [email.trim().toLowerCase(), customer.id]
      );
    }

    const reference = await this.generateReference();

    const enquiry = await db.queryOne(
      `INSERT INTO "Enquiry" (
        reference, "customerId", "eventType", "eventTitle", "eventDate", "endDate",
        "venueName", "venueAddress", "venueCity", "guestCount", "isOutdoor",
        "selectedServiceIds", "selectedPackageId", "customRequirements",
        "inspirationImages", "budgetRange", "preferredContactMethod",
        "consultationTime", "additionalNotes", status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'NEW')
      RETURNING *`,
      [
        reference,
        customer.id,
        eventType,
        eventTitle || `${eventType} for ${name}`,
        new Date(eventDate),
        endDate ? new Date(endDate) : null,
        venueName || null,
        venueAddress || null,
        venueCity || null,
        guestCount ? Number(guestCount) : null,
        Boolean(isOutdoor),
        selectedServiceIds ? JSON.stringify(selectedServiceIds) : null,
        selectedPackageId || null,
        customRequirements || null,
        inspirationImages ? JSON.stringify(inspirationImages) : null,
        budgetRange || null,
        preferredContactMethod || 'Phone',
        consultationTime || null,
        additionalNotes || null,
      ]
    );

    // Create system notification
    await db.query(
      `INSERT INTO "Notification" (title, message, type, link)
       VALUES ($1, $2, 'ENQUIRY', '/admin/enquiries')`,
      ['New Event Enquiry Received', `${name} requested a quote for ${eventType} (${reference})`]
    ).catch(() => {});

    return {
      ...enquiry,
      customer,
      selectedServiceIds: typeof enquiry.selectedServiceIds === 'string' ? JSON.parse(enquiry.selectedServiceIds) : enquiry.selectedServiceIds || [],
      inspirationImages: typeof enquiry.inspirationImages === 'string' ? JSON.parse(enquiry.inspirationImages) : enquiry.inspirationImages || [],
    };
  }

  static async getAllEnquiries(params?: {
    status?: string;
    eventType?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, eventType, search, startDate, endDate, page = 1, limit = 20 } = params || {};
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (status && status !== 'ALL') {
      whereClauses.push(`e.status = $${idx++}`);
      values.push(status);
    }

    if (eventType && eventType !== 'ALL') {
      whereClauses.push(`e."eventType" = $${idx++}`);
      values.push(eventType);
    }

    if (startDate) {
      whereClauses.push(`e."eventDate" >= $${idx++}`);
      values.push(new Date(startDate));
    }

    if (endDate) {
      whereClauses.push(`e."eventDate" <= $${idx++}`);
      values.push(new Date(endDate));
    }

    if (search) {
      whereClauses.push(`(e.reference ILIKE $${idx} OR e."eventTitle" ILIKE $${idx} OR e."venueName" ILIKE $${idx} OR c.name ILIKE $${idx} OR c.phone ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRes = await db.queryOne(
      `SELECT COUNT(*)::int AS total
       FROM "Enquiry" e
       LEFT JOIN "Customer" c ON e."customerId" = c.id
       ${whereStr}`,
      values
    );
    const total = countRes ? countRes.total : 0;

    const queryValues = [...values, limit, offset];
    const enquiries = await db.query(
      `SELECT e.*,
        row_to_json(c) AS customer,
        (
          SELECT json_agg(row_to_json(n))
          FROM (
            SELECT * FROM "EnquiryNote" WHERE "enquiryId" = e.id ORDER BY "createdAt" DESC LIMIT 1
          ) n
        ) AS notes
       FROM "Enquiry" e
       LEFT JOIN "Customer" c ON e."customerId" = c.id
       ${whereStr}
       ORDER BY e."createdAt" DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      queryValues
    );

    const formatted = enquiries.map((e) => ({
      ...e,
      notes: e.notes || [],
      selectedServiceIds: typeof e.selectedServiceIds === 'string' ? JSON.parse(e.selectedServiceIds) : e.selectedServiceIds || [],
      inspirationImages: typeof e.inspirationImages === 'string' ? JSON.parse(e.inspirationImages) : e.inspirationImages || [],
    }));

    return {
      enquiries: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getEnquiryById(id: string) {
    const enquiry = await db.queryOne(
      `SELECT e.*,
        row_to_json(c) AS customer,
        (
          SELECT json_agg(
            json_build_object(
              'id', n.id,
              'enquiryId', n."enquiryId",
              'note', n.note,
              'followUpDate', n."followUpDate",
              'createdAt', n."createdAt",
              'user', (SELECT json_build_object('id', u.id, 'name', u.name, 'role', u.role) FROM "User" u WHERE u.id = n."userId")
            )
          )
          FROM "EnquiryNote" n
          WHERE n."enquiryId" = e.id
        ) AS notes,
        (
          SELECT json_agg(row_to_json(b))
          FROM "Booking" b
          WHERE b."enquiryId" = e.id
        ) AS bookings,
        (
          SELECT json_agg(row_to_json(q))
          FROM "Quotation" q
          WHERE q."enquiryId" = e.id
        ) AS quotations
       FROM "Enquiry" e
       LEFT JOIN "Customer" c ON e."customerId" = c.id
       WHERE e.id = $1 OR e.reference = $1
       LIMIT 1`,
      [id]
    );

    if (!enquiry) {
      throw new Error('Enquiry not found');
    }

    return {
      ...enquiry,
      notes: enquiry.notes || [],
      bookings: enquiry.bookings || [],
      quotations: enquiry.quotations || [],
      selectedServiceIds: typeof enquiry.selectedServiceIds === 'string' ? JSON.parse(enquiry.selectedServiceIds) : enquiry.selectedServiceIds || [],
      inspirationImages: typeof enquiry.inspirationImages === 'string' ? JSON.parse(enquiry.inspirationImages) : enquiry.inspirationImages || [],
    };
  }

  static async updateEnquiry(id: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = [
      'eventType', 'eventTitle', 'venueName', 'venueAddress', 'venueCity',
      'guestCount', 'isOutdoor', 'selectedPackageId', 'customRequirements',
      'budgetRange', 'preferredContactMethod', 'consultationTime', 'additionalNotes',
      'status', 'assignedToUserId'
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`"${key}" = $${idx++}`);
        values.push(data[key]);
      }
    }

    if (data.eventDate) {
      fields.push(`"eventDate" = $${idx++}`);
      values.push(new Date(data.eventDate));
    }

    if (data.endDate !== undefined) {
      fields.push(`"endDate" = $${idx++}`);
      values.push(data.endDate ? new Date(data.endDate) : null);
    }

    if (data.selectedServiceIds !== undefined) {
      fields.push(`"selectedServiceIds" = $${idx++}`);
      values.push(JSON.stringify(data.selectedServiceIds));
    }

    if (fields.length === 0) {
      return this.getEnquiryById(id);
    }

    values.push(id);
    await db.query(
      `UPDATE "Enquiry"
       SET ${fields.join(', ')}
       WHERE id = $${idx}`,
      values
    );

    return this.getEnquiryById(id);
  }

  static async addNote(enquiryId: string, userId: string | undefined, note: string, followUpDate?: string | Date | null) {
    const newNote = await db.queryOne(
      `INSERT INTO "EnquiryNote" ("enquiryId", "userId", note, "followUpDate")
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [enquiryId, userId || null, note, followUpDate ? new Date(followUpDate) : null]
    );

    if (followUpDate) {
      await db.query(
        `INSERT INTO "Notification" (title, message, type, link)
         VALUES ($1, $2, 'FOLLOWUP', $3)`,
        ['Follow-up Scheduled', `Follow-up set for note on enquiry (${enquiryId})`, `/admin/enquiries/${enquiryId}`]
      ).catch(() => {});
    }

    const user = userId ? await db.queryOne(`SELECT id, name, role FROM "User" WHERE id = $1`, [userId]) : null;

    return {
      ...newNote,
      user,
    };
  }

  static async convertToBooking(enquiryId: string, data: any, userId?: string) {
    const enquiry = await db.queryOne(
      `SELECT * FROM "Enquiry" WHERE id = $1 LIMIT 1`,
      [enquiryId]
    );

    if (!enquiry) {
      throw new Error('Enquiry not found');
    }

    const year = new Date().getFullYear();
    const countRes = await db.queryOne(`SELECT COUNT(*)::int AS count FROM "Booking"`);
    const count = countRes ? countRes.count : 0;
    const reference = `BKG-${year}-${String(count + 1).padStart(4, '0')}`;

    return db.transaction(async (client) => {
      // 1. Create booking
      const bookingRes = await client.query(
        `INSERT INTO "Booking" (
          reference, "customerId", "enquiryId", "eventName", "eventType",
          "startDate", "endDate", "venueName", "venueAddress", "venueCity",
          "guestCount", status, "totalAmount", "discountAmount", "taxAmount",
          "finalAmount", "internalNotes"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'CONFIRMED', $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          reference,
          enquiry.customerId,
          enquiry.id,
          data.eventName || enquiry.eventTitle || `${enquiry.eventType} Celebration`,
          enquiry.eventType,
          new Date(data.startDate || enquiry.eventDate),
          data.endDate ? new Date(data.endDate) : enquiry.endDate,
          data.venueName || enquiry.venueName,
          data.venueAddress || enquiry.venueAddress,
          data.venueCity || enquiry.venueCity,
          data.guestCount || enquiry.guestCount,
          data.totalAmount || 0,
          data.discountAmount || 0,
          data.taxAmount || 0,
          data.finalAmount || data.totalAmount || 0,
          data.internalNotes || enquiry.additionalNotes,
        ]
      );
      const booking = bookingRes.rows[0];

      // 2. Add booking services
      if (data.selectedServices && Array.isArray(data.selectedServices) && data.selectedServices.length > 0) {
        for (const item of data.selectedServices) {
          await client.query(
            `INSERT INTO "BookingService" ("bookingId", "serviceId", "serviceName", quantity, "unitPrice", notes)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [booking.id, item.serviceId || null, item.serviceName, item.quantity || 1, item.unitPrice || 0, item.notes || null]
          );
        }
      }

      // 3. Mark enquiry as CONVERTED
      await client.query(`UPDATE "Enquiry" SET status = 'CONVERTED' WHERE id = $1`, [enquiryId]);

      // 4. Add conversion note
      await client.query(
        `INSERT INTO "EnquiryNote" ("enquiryId", "userId", note) VALUES ($1, $2, $3)`,
        [enquiryId, userId || null, `Converted enquiry into confirmed Booking ${reference}`]
      );

      // 5. Audit log
      await client.query(
        `INSERT INTO "AuditLog" ("userId", action, entity, "entityId", details) VALUES ($1, 'CONVERT', 'ENQUIRY', $2, $3)`,
        [userId || null, enquiryId, JSON.stringify({ bookingId: booking.id, reference })]
      );

      return booking;
    });
  }
}
