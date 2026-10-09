import { Request, Response, NextFunction } from 'express';
import { ServicesService } from './services.service.js';
import { createServiceSchema, updateServiceSchema, createCategorySchema } from './services.schema.js';
import { apiSuccess } from '../../utils/response.js';

export class ServicesController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const onlyActive = req.query.all !== 'true';
      const categories = await ServicesService.getAllCategories(onlyActive);
      return apiSuccess(res, categories, 'Categories fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, categorySlug, featured, search, all } = req.query;
      const services = await ServicesService.getAllServices({
        categoryId: categoryId as string,
        categorySlug: categorySlug as string,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        search: search as string,
        onlyActive: all !== 'true',
      });
      return apiSuccess(res, services, 'Services fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getServiceBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await ServicesService.getServiceBySlug(req.params.slug);
      return apiSuccess(res, service, 'Service fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createService(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createServiceSchema.parse(req.body);
      const service = await ServicesService.createService(validatedData);
      return apiSuccess(res, service, 'Service created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = updateServiceSchema.parse(req.body);
      const service = await ServicesService.updateService(req.params.id, validatedData);
      return apiSuccess(res, service, 'Service updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteService(req: Request, res: Response, next: NextFunction) {
    try {
      await ServicesService.deleteService(req.params.id);
      return apiSuccess(res, null, 'Service deleted or deactivated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createCategorySchema.parse(req.body);
      const category = await ServicesService.createCategory(validatedData);
      return apiSuccess(res, category, 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await ServicesService.updateCategory(req.params.id, req.body);
      return apiSuccess(res, category, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      await ServicesService.deleteCategory(req.params.id);
      return apiSuccess(res, null, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
