import { db } from '../../config/database.js';

export class PortfolioService {
  static async getAllProjects(params?: {
    category?: string;
    featured?: boolean;
    search?: string;
    onlyPublished?: boolean;
  }) {
    const { category, featured, search, onlyPublished = true } = params || {};

    const whereClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (onlyPublished) {
      whereClauses.push(`"isPublished" = TRUE`);
    }

    if (category && category !== 'All') {
      whereClauses.push(`category = $${idx++}`);
      values.push(category);
    }

    if (featured !== undefined) {
      whereClauses.push(`"isFeatured" = $${idx++}`);
      values.push(featured);
    }

    if (search) {
      whereClauses.push(`(title ILIKE $${idx} OR description ILIKE $${idx} OR location ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const projects = await db.query(
      `SELECT * FROM "PortfolioProject"
       ${whereStr}
       ORDER BY "sortOrder" ASC, "eventDate" DESC NULLS LAST, "createdAt" DESC`,
      values
    );

    return projects.map((p) => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [],
    }));
  }

  static async getProjectBySlug(slug: string) {
    const project = await db.queryOne(
      `SELECT * FROM "PortfolioProject" WHERE slug = $1 LIMIT 1`,
      [slug]
    );

    if (!project) {
      throw new Error('Project not found');
    }

    return {
      ...project,
      images: typeof project.images === 'string' ? JSON.parse(project.images) : project.images || [],
    };
  }

  static async createProject(data: any) {
    const {
      title,
      slug,
      category,
      description,
      clientName,
      location,
      eventDate,
      coverImage,
      images,
      isFeatured = false,
      isPublished = true,
      sortOrder = 0,
    } = data;

    const project = await db.queryOne(
      `INSERT INTO "PortfolioProject" (
        title, slug, category, description, "clientName", location,
        "eventDate", "coverImage", images, "isFeatured", "isPublished", "sortOrder"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        title,
        slug,
        category,
        description,
        clientName || null,
        location || null,
        eventDate ? new Date(eventDate) : null,
        coverImage,
        images ? JSON.stringify(images) : null,
        Boolean(isFeatured),
        Boolean(isPublished),
        Number(sortOrder) || 0,
      ]
    );

    return project;
  }

  static async updateProject(id: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = ['title', 'slug', 'category', 'description', 'clientName', 'location', 'coverImage', 'isFeatured', 'isPublished', 'sortOrder'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`"${key}" = $${idx++}`);
        values.push(data[key]);
      }
    }

    if (data.eventDate !== undefined) {
      fields.push(`"eventDate" = $${idx++}`);
      values.push(data.eventDate ? new Date(data.eventDate) : null);
    }

    if (data.images !== undefined) {
      fields.push(`images = $${idx++}`);
      values.push(data.images ? JSON.stringify(data.images) : null);
    }

    if (fields.length === 0) {
      return db.queryOne(`SELECT * FROM "PortfolioProject" WHERE id = $1`, [id]);
    }

    values.push(id);
    return db.queryOne(
      `UPDATE "PortfolioProject"
       SET ${fields.join(', ')}
       WHERE id = $${idx}
       RETURNING *`,
      values
    );
  }

  static async deleteProject(id: string) {
    return db.queryOne(`DELETE FROM "PortfolioProject" WHERE id = $1 RETURNING *`, [id]);
  }
}
