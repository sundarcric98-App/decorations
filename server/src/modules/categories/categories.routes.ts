import { Router } from 'express';
import { CategoriesController } from './categories.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

// Public router (mounted at /api/categories)
export const categoriesPublicRouter = Router();
categoriesPublicRouter.get('/', CategoriesController.getPublicCategories);
categoriesPublicRouter.get('/:slug', CategoriesController.getCategoryBySlug);

// Admin router (mounted at /api/admin/categories)
export const categoriesAdminRouter = Router();
categoriesAdminRouter.use(authenticate);
categoriesAdminRouter.get('/', CategoriesController.getAdminCategories);
categoriesAdminRouter.post('/', CategoriesController.createCategory);
categoriesAdminRouter.put('/:id', CategoriesController.updateCategory);
categoriesAdminRouter.delete('/:id', CategoriesController.deleteCategory);

export default categoriesPublicRouter;
