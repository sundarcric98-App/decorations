import { query } from '../../config/database.js';

export class CalendarService {
  static async getEvents(month?: number, year?: number) {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month !== undefined ? month : new Date().getMonth();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const bufferStart = new Date(startOfMonth.getTime() - 7 * 24 * 60 * 60 * 1000);
    const bufferEnd = new Date(endOfMonth.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fetch bookings in this window
    const bookingsSql = `
      SELECT 
        b.*,
        json_build_object('name', c."name", 'phone', c."phone") AS customer,
        COALESCE(
          json_agg(
            json_build_object(
              'id', a."id",
              'bookingId', a."bookingId",
              'staffId', a."staffId",
              'vendorId', a."vendorId",
              'role', a."role",
              'notes', a."notes",
              'assignedAt', a."assignedAt",
              'staff', CASE WHEN s."id" IS NOT NULL THEN row_to_json(s.*) ELSE NULL END,
              'vendor', CASE WHEN v."id" IS NOT NULL THEN row_to_json(v.*) ELSE NULL END
            )
          ) FILTER (WHERE a."id" IS NOT NULL),
          '[]'::json
        ) AS assignments
      FROM "Booking" b
      LEFT JOIN "Customer" c ON c."id" = b."customerId"
      LEFT JOIN "BookingAssignment" a ON a."bookingId" = b."id"
      LEFT JOIN "StaffProfile" s ON s."id" = a."staffId"
      LEFT JOIN "Vendor" v ON v."id" = a."vendorId"
      WHERE b."startDate" >= $1 AND b."startDate" <= $2
      GROUP BY b."id", c."name", c."phone"
      ORDER BY b."startDate" ASC
    `;

    const bookings = await query<any>(bookingsSql, [bufferStart, bufferEnd]);

    // Fetch scheduled consultations and follow-up notes
    const followUpsSql = `
      SELECT 
        n.*,
        json_build_object(
          'id', e."id",
          'reference', e."reference",
          'eventType', e."eventType",
          'eventTitle', e."eventTitle",
          'customer', json_build_object('id', c."id", 'name', c."name", 'phone', c."phone")
        ) AS enquiry
      FROM "EnquiryNote" n
      JOIN "Enquiry" e ON e."id" = n."enquiryId"
      JOIN "Customer" c ON c."id" = e."customerId"
      WHERE n."followUpDate" >= $1 AND n."followUpDate" <= $2
      ORDER BY n."followUpDate" ASC
    `;

    const followUps = await query<any>(followUpsSql, [startOfMonth, endOfMonth]);

    // Check for duplicate dates / overlaps
    const dateMap: { [dateStr: string]: string[] } = {};
    const conflicts: { date: string; bookingIds: string[]; eventNames: string[] }[] = [];

    bookings.forEach((b: any) => {
      const dateStr = new Date(b.startDate).toISOString().split('T')[0];
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = [];
      }
      dateMap[dateStr].push(b.id);
    });

    Object.entries(dateMap).forEach(([dateStr, bkgIds]) => {
      if (bkgIds.length > 1) {
        const conflictBookings = bookings.filter((b: any) => bkgIds.includes(b.id));
        conflicts.push({
          date: dateStr,
          bookingIds: bkgIds,
          eventNames: conflictBookings.map((b: any) => b.eventName),
        });
      }
    });

    return {
      month: currentMonth,
      year: currentYear,
      bookings,
      followUps,
      conflicts,
    };
  }
}
