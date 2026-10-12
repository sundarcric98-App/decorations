import { query, queryOne } from '../../config/database.js';

export class DashboardService {
  static async getStats() {
    const [
      totalProjectsRes,
      publishedProjectsRes,
      draftProjectsRes,
      activeCategoriesRes,
      totalCategoriesRes,
      recentProjects,
      categoriesBreakdown,
    ] = await Promise.all([
      queryOne<{ count: string }>(`SELECT COUNT(*)::text AS count FROM public.portfolio_projects`),
      queryOne<{ count: string }>(`SELECT COUNT(*)::text AS count FROM public.portfolio_projects WHERE status = 'published'`),
      queryOne<{ count: string }>(`SELECT COUNT(*)::text AS count FROM public.portfolio_projects WHERE status = 'draft'`),
      queryOne<{ count: string }>(`SELECT COUNT(*)::text AS count FROM public.event_categories WHERE is_active = TRUE`),
      queryOne<{ count: string }>(`SELECT COUNT(*)::text AS count FROM public.event_categories`),
      query<any>(
        `SELECT p.id, p.title, p.slug, p.status, p.event_date, p.cover_image_url, p.created_at,
                c.name as "categoryName"
         FROM public.portfolio_projects p
         LEFT JOIN public.event_categories c ON p.category_id = c.id
         ORDER BY p.created_at DESC
         LIMIT 5`
      ),
      query<any>(
        `SELECT c.id, c.name, c.slug, c.is_active,
                COUNT(p.id)::int as "projectCount"
         FROM public.event_categories c
         LEFT JOIN public.portfolio_projects p ON c.id = p.category_id
         GROUP BY c.id
         ORDER BY c.display_order ASC`
      ),
    ]);

    const totalProjects = parseInt(totalProjectsRes?.count || '0', 10);
    const publishedProjects = parseInt(publishedProjectsRes?.count || '0', 10);
    const draftProjects = parseInt(draftProjectsRes?.count || '0', 10);
    const activeCategories = parseInt(activeCategoriesRes?.count || '0', 10);
    const totalCategories = parseInt(totalCategoriesRes?.count || '0', 10);

    return {
      totalProjects,
      publishedProjects,
      draftProjects,
      activeCategories,
      totalCategories,
      // snake_case aliases
      total_projects: totalProjects,
      published_projects: publishedProjects,
      draft_projects: draftProjects,
      active_categories: activeCategories,
      total_categories: totalCategories,
      recentProjects,
      categoriesBreakdown,
    };
  }
}
