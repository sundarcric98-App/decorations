import { db } from '../../config/database.js';

export class PackagesService {
  static async getAllPackages(onlyActive = true) {
    const whereClause = onlyActive ? 'WHERE "isActive" = TRUE' : '';
    const packages = await db.query(
      `SELECT * FROM "Package"
       ${whereClause}
       ORDER BY "sortOrder" ASC, "createdAt" DESC`
    );

    return packages.map((p) => ({
      ...p,
      includedServices: typeof p.includedServices === 'string' ? JSON.parse(p.includedServices) : p.includedServices || [],
      optionalExtras: typeof p.optionalExtras === 'string' ? JSON.parse(p.optionalExtras) : p.optionalExtras || [],
    }));
  }

  static async getPackageBySlug(slug: string) {
    const pkg = await db.queryOne(
      `SELECT * FROM "Package" WHERE slug = $1 LIMIT 1`,
      [slug]
    );

    if (!pkg) {
      throw new Error('Package not found');
    }

    return {
      ...pkg,
      includedServices: typeof pkg.includedServices === 'string' ? JSON.parse(pkg.includedServices) : pkg.includedServices || [],
      optionalExtras: typeof pkg.optionalExtras === 'string' ? JSON.parse(pkg.optionalExtras) : pkg.optionalExtras || [],
    };
  }

  static async createPackage(data: any) {
    const {
      name,
      slug,
      description,
      includedServices,
      packagePrice,
      pricingType = 'Starting price',
      optionalExtras,
      terms,
      isActive = true,
      isFeatured = false,
      sortOrder = 0,
    } = data;

    const pkg = await db.queryOne(
      `INSERT INTO "Package" (
        name, slug, description, "includedServices", "packagePrice",
        "pricingType", "optionalExtras", terms, "isActive", "isFeatured", "sortOrder"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        name,
        slug,
        description,
        JSON.stringify(includedServices || []),
        packagePrice ? Number(packagePrice) : null,
        pricingType,
        optionalExtras ? JSON.stringify(optionalExtras) : null,
        terms || null,
        Boolean(isActive),
        Boolean(isFeatured),
        Number(sortOrder) || 0,
      ]
    );

    return pkg;
  }

  static async updatePackage(id: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = ['name', 'slug', 'description', 'packagePrice', 'pricingType', 'terms', 'isActive', 'isFeatured', 'sortOrder'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`"${key}" = $${idx++}`);
        values.push(data[key]);
      }
    }

    if (data.includedServices !== undefined) {
      fields.push(`"includedServices" = $${idx++}`);
      values.push(JSON.stringify(data.includedServices || []));
    }

    if (data.optionalExtras !== undefined) {
      fields.push(`"optionalExtras" = $${idx++}`);
      values.push(data.optionalExtras ? JSON.stringify(data.optionalExtras) : null);
    }

    if (fields.length === 0) {
      return db.queryOne(`SELECT * FROM "Package" WHERE id = $1`, [id]);
    }

    values.push(id);
    return db.queryOne(
      `UPDATE "Package"
       SET ${fields.join(', ')}
       WHERE id = $${idx}
       RETURNING *`,
      values
    );
  }

  static async deletePackage(id: string) {
    return db.queryOne(`DELETE FROM "Package" WHERE id = $1 RETURNING *`, [id]);
  }
}
