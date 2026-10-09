import { query, queryOne } from '../../config/database.js';

export class StaffService {
  static async getAllStaff(onlyActive = false) {
    const whereClause = onlyActive ? `WHERE s."isActive" = true` : ``;
    const sql = `
      SELECT 
        s.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', a."id",
              'bookingId', a."bookingId",
              'staffId', a."staffId",
              'role', a."role",
              'notes', a."notes",
              'assignedAt', a."assignedAt",
              'booking', json_build_object(
                'id', b."id",
                'reference', b."reference",
                'eventName', b."eventName",
                'startDate', b."startDate",
                'status', b."status"
              )
            )
          ) FILTER (WHERE a."id" IS NOT NULL),
          '[]'::json
        ) AS assignments
      FROM "StaffProfile" s
      LEFT JOIN "BookingAssignment" a ON a."staffId" = s."id"
      LEFT JOIN "Booking" b ON b."id" = a."bookingId"
      ${whereClause}
      GROUP BY s."id"
      ORDER BY s."name" ASC
    `;

    return query<any>(sql);
  }

  static async getStaffById(id: string) {
    const sql = `
      SELECT 
        s.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', a."id",
              'bookingId', a."bookingId",
              'staffId', a."staffId",
              'role', a."role",
              'notes', a."notes",
              'assignedAt', a."assignedAt",
              'booking', json_build_object(
                'id', b."id",
                'reference', b."reference",
                'eventName', b."eventName",
                'startDate', b."startDate",
                'status', b."status",
                'customer', json_build_object(
                  'id', c."id",
                  'name', c."name",
                  'phone', c."phone",
                  'email', c."email"
                )
              )
            )
          ) FILTER (WHERE a."id" IS NOT NULL),
          '[]'::json
        ) AS assignments
      FROM "StaffProfile" s
      LEFT JOIN "BookingAssignment" a ON a."staffId" = s."id"
      LEFT JOIN "Booking" b ON b."id" = a."bookingId"
      LEFT JOIN "Customer" c ON c."id" = b."customerId"
      WHERE s."id" = $1
      GROUP BY s."id"
    `;

    const staff = await queryOne<any>(sql, [id]);
    if (!staff) {
      throw new Error('Staff profile not found');
    }

    return staff;
  }

  static async createStaff(data: any) {
    const fields = ['userId', 'name', 'phone', 'email', 'roleTitle', 'skills', 'availabilityStatus', 'isActive'];
    const cols: string[] = [];
    const vals: any[] = [];

    fields.forEach((f) => {
      if (data[f] !== undefined) {
        cols.push(`"${f}"`);
        vals.push(data[f]);
      }
    });

    const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO "StaffProfile" (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    return queryOne<any>(sql, vals);
  }

  static async updateStaff(id: string, data: any) {
    const fields = ['userId', 'name', 'phone', 'email', 'roleTitle', 'skills', 'availabilityStatus', 'isActive'];
    const setClauses: string[] = [];
    const vals: any[] = [];

    fields.forEach((f) => {
      if (data[f] !== undefined) {
        vals.push(data[f]);
        setClauses.push(`"${f}" = $${vals.length}`);
      }
    });

    if (setClauses.length === 0) {
      return this.getStaffById(id);
    }

    vals.push(id);
    const sql = `UPDATE "StaffProfile" SET ${setClauses.join(', ')} WHERE "id" = $${vals.length} RETURNING *`;
    const updated = await queryOne<any>(sql, vals);
    if (!updated) {
      throw new Error('Staff profile not found');
    }
    return updated;
  }

  static async deleteStaff(id: string) {
    const deleted = await queryOne<any>(`DELETE FROM "StaffProfile" WHERE "id" = $1 RETURNING *`, [id]);
    if (!deleted) {
      throw new Error('Staff profile not found');
    }
    return deleted;
  }
}
