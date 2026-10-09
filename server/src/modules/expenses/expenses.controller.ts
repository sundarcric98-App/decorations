import { Request, Response, NextFunction } from 'express';
import { ExpensesService } from './expenses.service.js';
import { createExpenseSchema, updateExpenseSchema } from './expenses.schema.js';
import { apiSuccess } from '../../utils/response.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';

export class ExpensesController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, bookingId, vendorId, startDate, endDate, page, limit } = req.query;
      const result = await ExpensesService.getAllExpenses({
        category: category as string,
        bookingId: bookingId as string,
        vendorId: vendorId as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      return apiSuccess(res, result.expenses, 'Expenses fetched successfully', 200, {
        ...result.meta,
        categoryBreakdown: result.categoryBreakdown,
        totalExpenseAmount: result.totalExpenseAmount,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await ExpensesService.getExpenseById(req.params.id);
      return apiSuccess(res, expense, 'Expense details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createExpenseSchema.parse(req.body);
      const expense = await ExpensesService.createExpense(validatedData, req.user?.id);
      return apiSuccess(res, expense, 'Expense recorded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = updateExpenseSchema.parse(req.body);
      const expense = await ExpensesService.updateExpense(req.params.id, validatedData);
      return apiSuccess(res, expense, 'Expense updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ExpensesService.deleteExpense(req.params.id);
      return apiSuccess(res, null, 'Expense deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
