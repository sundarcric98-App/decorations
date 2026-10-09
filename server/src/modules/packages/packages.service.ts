import { prisma } from '../../config/database.js';

export class PackagesService {
  static async getAllPackages(onlyActive = true) {
    const packages = await prisma.package.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return packages.map((p) => ({
      ...p,
      includedServices: p.includedServices ? JSON.parse(p.includedServices) : [],
      optionalExtras: p.optionalExtras ? JSON.parse(p.optionalExtras) : [],
    }));
  }

  static async getPackageBySlug(slug: string) {
    const pkg = await prisma.package.findUnique({
      where: { slug },
    });

    if (!pkg) {
      throw new Error('Package not found');
    }

    return {
      ...pkg,
      includedServices: pkg.includedServices ? JSON.parse(pkg.includedServices) : [],
      optionalExtras: pkg.optionalExtras ? JSON.parse(pkg.optionalExtras) : [],
    };
  }

  static async createPackage(data: any) {
    const { includedServices, optionalExtras, ...rest } = data;
    return prisma.package.create({
      data: {
        ...rest,
        includedServices: JSON.stringify(includedServices || []),
        optionalExtras: optionalExtras ? JSON.stringify(optionalExtras) : null,
      },
    });
  }

  static async updatePackage(id: string, data: any) {
    const { includedServices, optionalExtras, ...rest } = data;
    const updateData: any = { ...rest };
    if (includedServices !== undefined) updateData.includedServices = JSON.stringify(includedServices);
    if (optionalExtras !== undefined) updateData.optionalExtras = JSON.stringify(optionalExtras);

    return prisma.package.update({
      where: { id },
      data: updateData,
    });
  }

  static async deletePackage(id: string) {
    return prisma.package.delete({ where: { id } });
  }
}
