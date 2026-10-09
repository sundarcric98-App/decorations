import { Request, Response, NextFunction } from 'express';
import { StaffService } from './staff.service.js';
import { apiSuccess } from '../../utils/response.js';

export class StaffController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const onlyActive = req.query.active === 'true';
      const staff = await StaffService.getAllStaff(onlyActive);
      return apiSuccess(res, staff, 'Staff profiles fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await StaffService.getStaffById(req.params.id);
      return apiSuccess(res, staff, 'Staff details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await StaffService.createStaff(req.body);
      return apiSuccess(res, staff, 'Staff profile created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await StaffService.updateStaff(req.params.id, req.body);
      return apiSuccess(res, staff, 'Staff profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await StaffService.deleteStaff(req.params.id);
      return apiSuccess(res, null, 'Staff profile deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
