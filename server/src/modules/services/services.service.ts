import { db } from '../../config/database.js';

export class ServicesService {
  static async getAllCategories(onlyActive = true) {
    const whereClause = onlyActive ? 'WHERE sc."isActive" = TRUE' : '';
    const categories = await db.query(
      `SELECT sc.*, 
        (SELECT COUNT(*)::int FROM "Service" s WHERE s."categoryId" = sc.id) AS "servicesCount",
        json_build_object('services', (SELECT COUNT(*)::int FROM "Service" s WHERE s."categoryId" = sc.id)) AS "_count"
       FROM "ServiceCategory" sc
       ${whereClause}
       ORDER BY sc."sortOrder" ASC, sc."createdAt" DESC`
    );
    return categories;
  }

  static async getAllServices(params?: {
    categoryId?: string;
    categorySlug?: string;
    featured?: boolean;
    search?: string;
    onlyActive?: boolean;
  }) {
    const { categoryId, categorySlug, featured, search, onlyActive = true } = params || {};

    const whereClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (onlyActive) {
      whereClauses.push(`s."isActive" = TRUE`);
    }

    if (categoryId) {
      whereClauses.push(`s."categoryId" = $${idx++}`);
      values.push(categoryId);
    }

    if (categorySlug) {
      whereClauses.push(`sc.slug = $${idx++}`);
      values.push(categorySlug);
    }

    if (featured !== undefined) {
      whereClauses.push(`s."isFeatured" = $${idx++}`);
      values.push(featured);
    }

    if (search) {
      whereClauses.push(`(s.name ILIKE $${idx} OR s."shortDesc" ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const services = await db.query(
      `SELECT s.*,
        json_build_object('id', sc.id, 'name', sc.name, 'slug', sc.slug) AS category
       FROM "Service" s
       LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
       ${whereStr}
       ORDER BY s."sortOrder" ASC, s."createdAt" DESC`,
      values
    );

    return services.map((s: any) => ({
      ...s,
      images: typeof s.images === 'string' ? JSON.parse(s.images) : s.images || [],
      availableAddons: typeof s.availableAddons === 'string' ? JSON.parse(s.availableAddons) : s.availableAddons || [],
    }));
  }

  static async getServiceBySlug(slug: string) {
    const service = await db.queryOne(
      `SELECT s.*,
        json_build_object('id', sc.id, 'name', sc.name, 'slug', sc.slug, 'description', sc.description) AS category
       FROM "Service" s
       LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
       WHERE s.slug = $1
       LIMIT 1`,
      [slug]
    );

    if (!service) {
      throw new Error('Service not found');
    }

    return {
      ...service,
      images: typeof service.images === 'string' ? JSON.parse(service.images) : service.images || [],
      availableAddons: typeof service.availableAddons === 'string' ? JSON.parse(service.availableAddons) : service.availableAddons || [],
    };
  }

  static async createService(data: any) {
    const {
      categoryId,
      name,
      slug,
      shortDesc,
      detailedDesc,
      coverImage,
      images,
      startingPrice,
      pricingMethod = 'Starting price',
      availableAddons,
      isFeatured = false,
      isActive = true,
      sortOrder = 0,
    } = data;

    const service = await db.queryOne(
      `INSERT INTO "Service" (
        "categoryId", name, slug, "shortDesc", "detailedDesc", "coverImage",
        images, "startingPrice", "pricingMethod", "availableAddons", "isFeatured", "isActive", "sortOrder"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        categoryId,
        name,
        slug,
        shortDesc,
        detailedDesc || null,
        coverImage,
        images ? JSON.stringify(images) : null,
        startingPrice ? Number(startingPrice) : null,
        pricingMethod,
        availableAddons ? JSON.stringify(availableAddons) : null,
        Boolean(isFeatured),
        Boolean(isActive),
        Number(sortOrder) || 0,
      ]
    );

    return service;
  }

  static async updateService(id: string, data: any) {
    const existing = await db.queryOne(`SELECT * FROM "Service" WHERE id = $1`, [id]);
    if (!existing) throw new Error('Service not found');

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = [
      'categoryId', 'name', 'slug', 'shortDesc', 'detailedDesc', 'coverImage',
      'startingPrice', 'pricingMethod', 'isFeatured', 'isActive', 'sortOrder'
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`"${key}" = $${idx++}`);
        values.push(data[key]);
      }
    }

    if (data.images !== undefined) {
      fields.push(`images = $${idx++}`);
      values.push(data.images ? JSON.stringify(data.images) : null);
    }

    if (data.availableAddons !== undefined) {
      fields.push(`"availableAddons" = $${idx++}`);
      values.push(data.availableAddons ? JSON.stringify(data.availableAddons) : null);
    }

    if (fields.length === 0) return existing;

    values.push(id);
    const updated = await db.queryOne(
      `UPDATE "Service"
       SET ${fields.join(', ')}
       WHERE id = $${idx}
       RETURNING *`,
      values
    );

    return updated;
  }

  static async deleteService(id: string) {
    const bookingUsage = await db.queryOne(
      `SELECT COUNT(*)::int as count FROM "BookingService" WHERE "serviceId" = $1`,
      [id]
    );

    if (bookingUsage && bookingUsage.count > 0) {
      return db.queryOne(`UPDATE "Service" SET "isActive" = FALSE WHERE id = $1 RETURNING *`, [id]);
    }

    return db.queryOne(`DELETE FROM "Service" WHERE id = $1 RETURNING *`, [id]);
  }

  static async createCategory(data: any) {
    const { name, slug, description, image, sortOrder = 0, isActive = true } = data;
    return db.queryOne(
      `INSERT INTO "ServiceCategory" (name, slug, description, image, "sortOrder", "isActive")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, slug, description || null, image || null, Number(sortOrder) || 0, Boolean(isActive)]
    );
  }

  static async updateCategory(id: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const key of ['name', 'slug', 'description', 'image', 'sortOrder', 'isActive']) {
      if (data[key] !== undefined) {
        fields.push(`"${key}" = $${idx++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return db.queryOne(`SELECT * FROM "ServiceCategory" WHERE id = $1`, [id]);
    }

    values.push(id);
    return db.queryOne(
      `UPDATE "ServiceCategory"
       SET ${fields.join(', ')}
       WHERE id = $${idx}
       RETURNING *`,
      values
    );
  }

  static async deleteCategory(id: string) {
    return db.queryOne(`DELETE FROM "ServiceCategory" WHERE id = $1 RETURNING *`, [id]);
  }
}
