import { db } from '../../config/database.js';

export interface ProjectInput {
  category_id: string;
  title: string;
  slug?: string;
  description?: string;
  event_date?: string | null;
  location?: string | null;
  cover_image_url?: string;
  status?: 'draft' | 'published';
  display_order?: number;
  images?: Array<{
    image_url: string;
    storage_path?: string;
    alt_text?: string;
    display_order?: number;
  }>;
}

export class PortfolioService {
  static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  static async getPublicProjects(params?: {
    category?: string;
    search?: string;
    limit?: number;
    page?: number;
  }) {
    const { category, search, limit = 50, page = 1 } = params || {};
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [
      `p.status = 'published'`,
      `c.is_active = TRUE`,
    ];
    const values: any[] = [];
    let idx = 1;

    if (category && category !== 'All' && category !== 'all') {
      whereClauses.push(`(c.slug = $${idx} OR c.id::text = $${idx})`);
      values.push(category);
      idx++;
    }

    if (search && search.trim()) {
      whereClauses.push(`(p.title ILIKE $${idx} OR p.description ILIKE $${idx} OR p.location ILIKE $${idx})`);
      values.push(`%${search.trim()}%`);
      idx++;
    }

    const whereStr = `WHERE ${whereClauses.join(' AND ')}`;

    const projects = await db.query(
      `SELECT p.id, p.category_id, p.title, p.slug, p.description, p.event_date, p.location,
              p.cover_image_url, p.status, p.display_order, p.created_at, p.updated_at,
              c.name as "categoryName", c.slug as "categorySlug",
              (
                SELECT COALESCE(
                  json_agg(
                    json_build_object(
                      'id', img.id,
                      'image_url', img.image_url,
                      'storage_path', img.storage_path,
                      'alt_text', img.alt_text,
                      'display_order', img.display_order
                    ) ORDER BY img.display_order ASC
                  ),
                  '[]'::json
                )
                FROM public.portfolio_images img
                WHERE img.project_id = p.id
              ) as images
       FROM public.portfolio_projects p
       JOIN public.event_categories c ON p.category_id = c.id
       ${whereStr}
       ORDER BY p.display_order ASC, p.event_date DESC NULLS LAST, p.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]
    );

    return projects;
  }

  static async getProjectBySlug(slug: string) {
    const project = await db.queryOne(
      `SELECT p.id, p.category_id, p.title, p.slug, p.description, p.event_date, p.location,
              p.cover_image_url, p.status, p.display_order, p.created_at, p.updated_at,
              c.name as "categoryName", c.slug as "categorySlug",
              (
                SELECT COALESCE(
                  json_agg(
                    json_build_object(
                      'id', img.id,
                      'image_url', img.image_url,
                      'storage_path', img.storage_path,
                      'alt_text', img.alt_text,
                      'display_order', img.display_order
                    ) ORDER BY img.display_order ASC
                  ),
                  '[]'::json
                )
                FROM public.portfolio_images img
                WHERE img.project_id = p.id
              ) as images
       FROM public.portfolio_projects p
       JOIN public.event_categories c ON p.category_id = c.id
       WHERE (p.slug = $1 OR p.id::text = $1)
       LIMIT 1`,
      [slug]
    );

    if (!project) {
      const err: any = new Error('Portfolio project not found');
      err.statusCode = 404;
      throw err;
    }

    return project;
  }

  static async getAdminProjects(params?: {
    category?: string;
    status?: string;
    search?: string;
  }) {
    const { category, status, search } = params || {};
    const whereClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (category && category !== 'All' && category !== 'all') {
      whereClauses.push(`(c.slug = $${idx} OR c.id::text = $${idx})`);
      values.push(category);
      idx++;
    }

    if (status && (status === 'draft' || status === 'published')) {
      whereClauses.push(`p.status = $${idx}`);
      values.push(status);
      idx++;
    }

    if (search && search.trim()) {
      whereClauses.push(`(p.title ILIKE $${idx} OR p.description ILIKE $${idx} OR p.location ILIKE $${idx})`);
      values.push(`%${search.trim()}%`);
      idx++;
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const projects = await db.query(
      `SELECT p.id, p.category_id, p.title, p.slug, p.description, p.event_date, p.location,
              p.cover_image_url, p.status, p.display_order, p.created_at, p.updated_at,
              c.name as "categoryName", c.slug as "categorySlug",
              (
                SELECT COUNT(*)::int
                FROM public.portfolio_images img
                WHERE img.project_id = p.id
              ) as "imageCount"
       FROM public.portfolio_projects p
       LEFT JOIN public.event_categories c ON p.category_id = c.id
       ${whereStr}
       ORDER BY p.display_order ASC, p.event_date DESC NULLS LAST, p.created_at DESC`,
      values
    );

    return projects;
  }

  static async getAdminProjectById(id: string) {
    const project = await db.queryOne(
      `SELECT p.id, p.category_id, p.title, p.slug, p.description, p.event_date, p.location,
              p.cover_image_url, p.status, p.display_order, p.created_at, p.updated_at,
              c.name as "categoryName", c.slug as "categorySlug",
              (
                SELECT COALESCE(
                  json_agg(
                    json_build_object(
                      'id', img.id,
                      'image_url', img.image_url,
                      'storage_path', img.storage_path,
                      'alt_text', img.alt_text,
                      'display_order', img.display_order
                    ) ORDER BY img.display_order ASC
                  ),
                  '[]'::json
                )
                FROM public.portfolio_images img
                WHERE img.project_id = p.id
              ) as images
       FROM public.portfolio_projects p
       LEFT JOIN public.event_categories c ON p.category_id = c.id
       WHERE p.id = $1
       LIMIT 1`,
      [id]
    );

    if (!project) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }

    return project;
  }

  static async createProject(data: ProjectInput) {
    const {
      category_id,
      title,
      description = '',
      event_date = null,
      location = null,
      cover_image_url = '',
      status = 'published',
      display_order = 0,
      images = [],
    } = data;

    const baseSlug = (data.slug ? this.slugify(data.slug) : this.slugify(title)) || `project-${Date.now()}`;
    // Check slug collision
    const existing = await db.queryOne(
      `SELECT id FROM public.portfolio_projects WHERE slug = $1 LIMIT 1`,
      [baseSlug]
    );
    const finalSlug = existing ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    // Verify category exists
    const cat = await db.queryOne(
      `SELECT id FROM public.event_categories WHERE id = $1 LIMIT 1`,
      [category_id]
    );
    if (!cat) {
      const err: any = new Error('Selected event category does not exist.');
      err.statusCode = 400;
      throw err;
    }

    const project = await db.queryOne(
      `INSERT INTO public.portfolio_projects (
        category_id, title, slug, description, event_date, location,
        cover_image_url, status, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        category_id,
        title.trim(),
        finalSlug,
        description,
        event_date ? new Date(event_date) : null,
        location,
        cover_image_url || (images.length > 0 ? images[0].image_url : ''),
        status,
        display_order,
      ]
    );

    // Insert images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.image_url) {
          await db.query(
            `INSERT INTO public.portfolio_images (project_id, image_url, storage_path, alt_text, display_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              project.id,
              img.image_url,
              img.storage_path || null,
              img.alt_text || title,
              typeof img.display_order === 'number' ? img.display_order : i + 1,
            ]
          );
        }
      }
    }

    return this.getAdminProjectById(project.id);
  }

  static async updateProject(id: string, data: Partial<ProjectInput>) {
    const existing = await db.queryOne(
      `SELECT * FROM public.portfolio_projects WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (!existing) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }

    const title = data.title !== undefined ? data.title.trim() : existing.title;
    const slug = data.slug !== undefined ? this.slugify(data.slug) : existing.slug;
    const category_id = data.category_id !== undefined ? data.category_id : existing.category_id;
    const description = data.description !== undefined ? data.description : existing.description;
    const event_date = data.event_date !== undefined ? (data.event_date ? new Date(data.event_date) : null) : existing.event_date;
    const location = data.location !== undefined ? data.location : existing.location;
    const cover_image_url = data.cover_image_url !== undefined ? data.cover_image_url : existing.cover_image_url;
    const status = data.status !== undefined ? data.status : existing.status;
    const display_order = data.display_order !== undefined ? Number(data.display_order) : existing.display_order;

    await db.query(
      `UPDATE public.portfolio_projects
       SET title = $1, slug = $2, category_id = $3, description = $4,
           event_date = $5, location = $6, cover_image_url = $7,
           status = $8, display_order = $9
       WHERE id = $10`,
      [title, slug, category_id, description, event_date, location, cover_image_url, status, display_order, id]
    );

    // If images array is explicitly provided, replace/update images
    if (data.images !== undefined && Array.isArray(data.images)) {
      await db.query(`DELETE FROM public.portfolio_images WHERE project_id = $1`, [id]);
      for (let i = 0; i < data.images.length; i++) {
        const img = data.images[i];
        if (img.image_url) {
          await db.query(
            `INSERT INTO public.portfolio_images (project_id, image_url, storage_path, alt_text, display_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              id,
              img.image_url,
              img.storage_path || null,
              img.alt_text || title,
              typeof img.display_order === 'number' ? img.display_order : i + 1,
            ]
          );
        }
      }
    }

    return this.getAdminProjectById(id);
  }

  static async deleteProject(id: string) {
    const deleted = await db.queryOne(
      `DELETE FROM public.portfolio_projects WHERE id = $1 RETURNING id, title`,
      [id]
    );

    if (!deleted) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }

    return deleted;
  }
}
