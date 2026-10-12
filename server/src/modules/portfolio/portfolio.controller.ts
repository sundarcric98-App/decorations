import { Request, Response, NextFunction } from 'express';
import { PortfolioService } from './portfolio.service.js';
import { apiSuccess } from '../../utils/response.js';

export class PortfolioController {
  // Public: GET /api/portfolio
  static async getPublicProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search, limit, page } = req.query;
      const projects = await PortfolioService.getPublicProjects({
        category: category as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : 50,
        page: page ? parseInt(page as string, 10) : 1,
      });
      return apiSuccess(res, projects, 'Public portfolio projects fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  // Public: GET /api/portfolio/:slug
  static async getProjectBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await PortfolioService.getProjectBySlug(req.params.slug);
      return apiSuccess(res, project, 'Project details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  // Admin: GET /api/admin/portfolio
  static async getAdminProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, status, search } = req.query;
      const projects = await PortfolioService.getAdminProjects({
        category: category as string,
        status: status as string,
        search: search as string,
      });
      return apiSuccess(res, projects, 'Admin portfolio projects fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  // Admin: GET /api/admin/portfolio/:id
  static async getAdminProjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await PortfolioService.getAdminProjectById(req.params.id);
      return apiSuccess(res, project, 'Project fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  // Admin: POST /api/admin/portfolio
  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await PortfolioService.createProject(req.body);
      return apiSuccess(res, project, 'Project created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // Admin: PUT /api/admin/portfolio/:id
  static async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await PortfolioService.updateProject(req.params.id, req.body);
      return apiSuccess(res, project, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Admin: DELETE /api/admin/portfolio/:id
  static async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PortfolioService.deleteProject(req.params.id);
      return apiSuccess(res, result, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
