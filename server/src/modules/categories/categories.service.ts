import { db } from '../../config/database.js';

export interface CategoryData {
  name: string;
  slug?: string;
  description?: string;
  cover_image_url?: string;
  display_order?: number;
  is_active?: boolean;
}

export class CategoriesService {
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

  static async getPublicCategories() {
    const categories = await db.query(
      `SELECT c.id, c.name, c.slug, c.description, c.cover_image_url, c.display_order, c.is_active,
              COUNT(p.id) FILTER (WHERE p.status = 'published')::int as "projectCount"
       FROM public.event_categories c
       LEFT JOIN public.portfolio_projects p ON c.id = p.category_id
       WHERE c.is_active = TRUE
       GROUP BY c.id
       ORDER BY c.display_order ASC, c.name ASC`
    );
    return categories;
  }

  static async getAdminCategories() {
    const categories = await db.query(
      `SELECT c.id, c.name, c.slug, c.description, c.cover_image_url, c.display_order, c.is_active, c.created_at, c.updated_at,
              COUNT(p.id)::int as "projectCount"
       FROM public.event_categories c
       LEFT JOIN public.portfolio_projects p ON c.id = p.category_id
       GROUP BY c.id
       ORDER BY c.display_order ASC, c.name ASC`
    );
    return categories;
  }

  static async getCategoryBySlug(slug: string) {
    const category = await db.queryOne(
      `SELECT * FROM public.event_categories
       WHERE (slug = $1 OR id::text = $1)
       LIMIT 1`,
      [slug]
    );

    if (!category) {
      const err: any = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }

    // Fetch published projects in this category
    const projects = await db.query(
      `SELECT p.id, p.category_id, p.title, p.slug, p.description, p.event_date, p.location, p.cover_image_url, p.display_order,
              (
                SELECT COALESCE(json_agg(json_build_object('id', img.id, 'image_url', img.image_url, 'alt_text', img.alt_text, 'display_order', img.display_order) ORDER BY img.display_order ASC), '[]'::json)
                FROM public.portfolio_images img
                WHERE img.project_id = p.id
              ) as images
       FROM public.portfolio_projects p
       WHERE p.category_id = $1 AND p.status = 'published'
       ORDER BY p.display_order ASC, p.event_date DESC NULLS LAST, p.created_at DESC`,
      [category.id]
    );

    return {
      ...category,
      projects,
    };
  }

  static async createCategory(data: CategoryData) {
    const name = data.name.trim();
    const slug = (data.slug ? this.slugify(data.slug) : this.slugify(name)) || `cat-${Date.now()}`;
    const description = data.description || '';
    const cover_image_url = data.cover_image_url || '';
    const display_order = typeof data.display_order === 'number' ? data.display_order : 0;
    const is_active = data.is_active !== undefined ? Boolean(data.is_active) : true;

    // Check slug collision
    const existing = await db.queryOne(
      `SELECT id FROM public.event_categories WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const category = await db.queryOne(
      `INSERT INTO public.event_categories (name, slug, description, cover_image_url, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, finalSlug, description, cover_image_url, display_order, is_active]
    );

    return category;
  }

  static async updateCategory(id: string, data: Partial<CategoryData>) {
    const existing = await db.queryOne(
      `SELECT * FROM public.event_categories WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (!existing) {
      const err: any = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }

    const name = data.name !== undefined ? data.name.trim() : existing.name;
    const slug = data.slug !== undefined ? this.slugify(data.slug) : existing.slug;
    const description = data.description !== undefined ? data.description : existing.description;
    const cover_image_url = data.cover_image_url !== undefined ? data.cover_image_url : existing.cover_image_url;
    const display_order = data.display_order !== undefined ? Number(data.display_order) : existing.display_order;
    const is_active = data.is_active !== undefined ? Boolean(data.is_active) : existing.is_active;

    const updated = await db.queryOne(
      `UPDATE public.event_categories
       SET name = $1, slug = $2, description = $3, cover_image_url = $4, display_order = $5, is_active = $6
       WHERE id = $7
       RETURNING *`,
      [name, slug, description, cover_image_url, display_order, is_active, id]
    );

    return updated;
  }

  static async deleteCategory(id: string) {
    // 1. Safe foreign-key validation check
    const refCount = await db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM public.portfolio_projects WHERE category_id = $1`,
      [id]
    );

    const count = parseInt(refCount?.count || '0', 10);
    if (count > 0) {
      const err: any = new Error(
        `Cannot delete this category because it is currently referenced by ${count} portfolio project(s). Please reassign or remove related projects first.`
      );
      err.statusCode = 400;
      throw err;
    }

    const deleted = await db.queryOne(
      `DELETE FROM public.event_categories WHERE id = $1 RETURNING id, name`,
      [id]
    );

    if (!deleted) {
      const err: any = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }

    return deleted;
  }
}
