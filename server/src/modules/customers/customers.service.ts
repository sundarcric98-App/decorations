import { prisma } from '../../config/database.js';

export class CustomersService {
  static async getAllCustomers(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, page = 1, limit = 20 } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { enquiries: true, bookings: true, quotations: true, payments: true },
          },
        },
      }),
    ]);

    return {
      customers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        enquiries: { orderBy: { createdAt: 'desc' } },
        bookings: {
          orderBy: { startDate: 'desc' },
          include: { payments: true },
        },
        quotations: { orderBy: { createdAt: 'desc' } },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer;
  }

  static async createCustomer(data: any) {
    return prisma.customer.create({ data });
  }

  static async updateCustomer(id: string, data: any) {
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  static async deleteCustomer(id: string) {
    return prisma.customer.delete({ where: { id } });
  }
}
