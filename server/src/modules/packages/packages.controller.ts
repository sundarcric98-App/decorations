import { Request, Response, NextFunction } from 'express';
import { PackagesService } from './packages.service.js';
import { createPackageSchema, updatePackageSchema } from './packages.schema.js';
import { apiSuccess } from '../../utils/response.js';

export class PackagesController {
  static async getPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const onlyActive = req.query.all !== 'true';
      const packages = await PackagesService.getAllPackages(onlyActive);
      return apiSuccess(res, packages, 'Packages fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getPackageBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const pkg = await PackagesService.getPackageBySlug(req.params.slug);
      return apiSuccess(res, pkg, 'Package fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createPackageSchema.parse(req.body);
      const pkg = await PackagesService.createPackage(validatedData);
      return apiSuccess(res, pkg, 'Package created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updatePackage(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = updatePackageSchema.parse(req.body);
      const pkg = await PackagesService.updatePackage(req.params.id, validatedData);
      return apiSuccess(res, pkg, 'Package updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deletePackage(req: Request, res: Response, next: NextFunction) {
    try {
      await PackagesService.deletePackage(req.params.id);
      return apiSuccess(res, null, 'Package deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
