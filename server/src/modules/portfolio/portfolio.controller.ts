import { Request, Response, NextFunction } from 'express';
import { PortfolioService } from './portfolio.service.js';
import { createPortfolioSchema, updatePortfolioSchema } from './portfolio.schema.js';
import { apiSuccess } from '../../utils/response.js';

export class PortfolioController {
  static async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, featured, search, all } = req.query;
      const projects = await PortfolioService.getAllProjects({
        category: category as string,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        search: search as string,
        onlyPublished: all !== 'true',
      });
      return apiSuccess(res, projects, 'Portfolio projects fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getProjectBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await PortfolioService.getProjectBySlug(req.params.slug);
      return apiSuccess(res, project, 'Project details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createPortfolioSchema.parse(req.body);
      const project = await PortfolioService.createProject(validatedData);
      return apiSuccess(res, project, 'Portfolio project created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = updatePortfolioSchema.parse(req.body);
      const project = await PortfolioService.updateProject(req.params.id, validatedData);
      return apiSuccess(res, project, 'Portfolio project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      await PortfolioService.deleteProject(req.params.id);
      return apiSuccess(res, null, 'Portfolio project deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
