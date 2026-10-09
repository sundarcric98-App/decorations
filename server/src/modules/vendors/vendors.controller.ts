import { Request, Response, NextFunction } from 'express';
import { VendorsService } from './vendors.service.js';
import { apiSuccess } from '../../utils/response.js';

export class VendorsController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search, active } = req.query;
      const vendors = await VendorsService.getAllVendors({
        category: category as string,
        search: search as string,
        onlyActive: active === 'true',
      });
      return apiSuccess(res, vendors, 'Vendors fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await VendorsService.getVendorById(req.params.id);
      return apiSuccess(res, vendor, 'Vendor details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await VendorsService.createVendor(req.body);
      return apiSuccess(res, vendor, 'Vendor created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await VendorsService.updateVendor(req.params.id, req.body);
      return apiSuccess(res, vendor, 'Vendor updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await VendorsService.deleteVendor(req.params.id);
      return apiSuccess(res, null, 'Vendor deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
