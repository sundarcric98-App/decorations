import { prisma } from '../../config/database.js';

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
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;
    if (bookingId) where.bookingId = bookingId;
    if (vendorId) where.vendorId = vendorId;
    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate);
      if (endDate) where.expenseDate.lte = new Date(endDate);
    }

    const [total, expenses, categoryAggregates] = await Promise.all([
      prisma.expense.count({ where }),
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { expenseDate: 'desc' },
        include: {
          booking: { select: { id: true, reference: true, eventName: true } },
          vendor: { select: { id: true, businessName: true, contactPerson: true } },
          recordedBy: { select: { id: true, name: true } },
        },
      }),
      prisma.expense.groupBy({
        by: ['category'],
        _sum: { amount: true },
        where,
      }),
    ]);

    const totalExpenseAmount = categoryAggregates.reduce((acc, curr) => acc + (curr._sum.amount || 0), 0);

    return {
      expenses,
      categoryBreakdown: categoryAggregates.map((c) => ({
        category: c.category,
        total: c._sum.amount || 0,
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
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        booking: true,
        vendor: true,
        recordedBy: { select: { id: true, name: true } },
      },
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    return expense;
  }

  static async createExpense(data: any, userId?: string) {
    return prisma.expense.create({
      data: {
        ...data,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
        recordedByUserId: userId || null,
      },
      include: {
        booking: true,
        vendor: true,
      },
    });
  }

  static async updateExpense(id: string, data: any) {
    const updateData = { ...data };
    if (data.expenseDate) updateData.expenseDate = new Date(data.expenseDate);

    return prisma.expense.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteExpense(id: string) {
    return prisma.expense.delete({ where: { id } });
  }
}
