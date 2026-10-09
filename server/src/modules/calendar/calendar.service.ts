import { prisma } from '../../config/database.js';

export class CalendarService {
  static async getEvents(month?: number, year?: number) {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month !== undefined ? month : new Date().getMonth();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Fetch bookings in this window
    const bookings = await prisma.booking.findMany({
      where: {
        startDate: {
          gte: new Date(startOfMonth.getTime() - 7 * 24 * 60 * 60 * 1000), // include overlap buffer
          lte: new Date(endOfMonth.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        customer: { select: { name: true, phone: true } },
        assignments: {
          include: { staff: true, vendor: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    // Fetch scheduled consultations and follow-up notes
    const followUps = await prisma.enquiryNote.findMany({
      where: {
        followUpDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        enquiry: {
          include: { customer: true },
        },
      },
      orderBy: { followUpDate: 'asc' },
    });

    // Check for duplicate dates / overlaps
    const dateMap: { [dateStr: string]: string[] } = {};
    const conflicts: { date: string; bookingIds: string[]; eventNames: string[] }[] = [];

    bookings.forEach((b) => {
      const dateStr = b.startDate.toISOString().split('T')[0];
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = [];
      }
      dateMap[dateStr].push(b.id);
    });

    Object.entries(dateMap).forEach(([dateStr, bkgIds]) => {
      if (bkgIds.length > 1) {
        const conflictBookings = bookings.filter((b) => bkgIds.includes(b.id));
        conflicts.push({
          date: dateStr,
          bookingIds: bkgIds,
          eventNames: conflictBookings.map((b) => b.eventName),
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
