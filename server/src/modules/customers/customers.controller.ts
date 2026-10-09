import { Request, Response, NextFunction } from 'express';
import { CustomersService } from './customers.service.js';
import { apiSuccess } from '../../utils/response.js';

export class CustomersController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, page, limit } = req.query;
      const result = await CustomersService.getAllCustomers({
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      return apiSuccess(res, result.customers, 'Customers fetched successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomersService.getCustomerById(req.params.id);
      return apiSuccess(res, customer, 'Customer details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomersService.createCustomer(req.body);
      return apiSuccess(res, customer, 'Customer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomersService.updateCustomer(req.params.id, req.body);
      return apiSuccess(res, customer, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await CustomersService.deleteCustomer(req.params.id);
      return apiSuccess(res, null, 'Customer deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
