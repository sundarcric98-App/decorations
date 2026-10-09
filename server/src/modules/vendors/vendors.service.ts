import { prisma } from '../../config/database.js';

export class VendorsService {
  static async getAllVendors(params?: { category?: string; search?: string; onlyActive?: boolean }) {
    const { category, search, onlyActive } = params || {};
    const where: any = {};
    if (onlyActive) where.isActive = true;
    if (category && category !== 'ALL') where.category = category;
    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { contactPerson: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    return prisma.vendor.findMany({
      where,
      orderBy: { businessName: 'asc' },
      include: {
        _count: { select: { assignments: true, expenses: true } },
      },
    });
  }

  static async getVendorById(id: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            booking: { select: { id: true, reference: true, eventName: true, startDate: true, status: true } },
          },
        },
        expenses: {
          orderBy: { expenseDate: 'desc' },
        },
      },
    });

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    return vendor;
  }

  static async createVendor(data: any) {
    return prisma.vendor.create({ data });
  }

  static async updateVendor(id: string, data: any) {
    return prisma.vendor.update({
      where: { id },
      data,
    });
  }

  static async deleteVendor(id: string) {
    return prisma.vendor.delete({ where: { id } });
  }
}
