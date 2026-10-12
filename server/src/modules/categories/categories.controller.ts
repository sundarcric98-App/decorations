import { Request, Response, NextFunction } from 'express';
import { CategoriesService } from './categories.service.js';
import { apiSuccess } from '../../utils/response.js';

export class CategoriesController {
  // Public: GET /api/categories
  static async getPublicCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoriesService.getPublicCategories();
      return apiSuccess(res, categories, 'Categories fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  // Public: GET /api/categories/:slug
  static async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoriesService.getCategoryBySlug(req.params.slug);
      return apiSuccess(res, category, 'Category details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  // Admin: GET /api/admin/categories
  static async getAdminCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoriesService.getAdminCategories();
      return apiSuccess(res, categories, 'Admin categories fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  // Admin: POST /api/admin/categories
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoriesService.createCategory(req.body);
      return apiSuccess(res, category, 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // Admin: PUT /api/admin/categories/:id
  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoriesService.updateCategory(req.params.id, req.body);
      return apiSuccess(res, category, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Admin: DELETE /api/admin/categories/:id
  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CategoriesService.deleteCategory(req.params.id);
      return apiSuccess(res, result, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
