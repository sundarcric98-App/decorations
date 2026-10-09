import { prisma } from '../../config/database.js';

export class StaffService {
  static async getAllStaff(onlyActive = false) {
    return prisma.staffProfile.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
      include: {
        assignments: {
          include: {
            booking: { select: { id: true, reference: true, eventName: true, startDate: true, status: true } },
          },
        },
      },
    });
  }

  static async getStaffById(id: string) {
    const staff = await prisma.staffProfile.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            booking: {
              include: { customer: true },
            },
          },
        },
      },
    });

    if (!staff) {
      throw new Error('Staff profile not found');
    }

    return staff;
  }

  static async createStaff(data: any) {
    return prisma.staffProfile.create({ data });
  }

  static async updateStaff(id: string, data: any) {
    return prisma.staffProfile.update({
      where: { id },
      data,
    });
  }

  static async deleteStaff(id: string) {
    return prisma.staffProfile.delete({ where: { id } });
  }
}
