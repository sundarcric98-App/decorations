import { prisma } from '../../config/database.js';

export class ServicesService {
  static async getAllCategories(onlyActive = true) {
    return prisma.serviceCategory.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { services: true } },
      },
    });
  }

  static async getAllServices(params?: {
    categoryId?: string;
    categorySlug?: string;
    featured?: boolean;
    search?: string;
    onlyActive?: boolean;
  }) {
    const { categoryId, categorySlug, featured, search, onlyActive = true } = params || {};

    const where: any = {};
    if (onlyActive) where.isActive = true;
    if (categoryId) where.categoryId = categoryId;
    if (categorySlug) where.category = { slug: categorySlug };
    if (featured !== undefined) where.isFeatured = featured;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDesc: { contains: search } },
      ];
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return services.map((s) => ({
      ...s,
      images: s.images ? JSON.parse(s.images) : [],
      availableAddons: s.availableAddons ? JSON.parse(s.availableAddons) : [],
    }));
  }

  static async getServiceBySlug(slug: string) {
    const service = await prisma.service.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    return {
      ...service,
      images: service.images ? JSON.parse(service.images) : [],
      availableAddons: service.availableAddons ? JSON.parse(service.availableAddons) : [],
    };
  }

  static async createService(data: any) {
    const { images, availableAddons, ...rest } = data;
    return prisma.service.create({
      data: {
        ...rest,
        images: images ? JSON.stringify(images) : null,
        availableAddons: availableAddons ? JSON.stringify(availableAddons) : null,
      },
    });
  }

  static async updateService(id: string, data: any) {
    const { images, availableAddons, ...rest } = data;
    const updateData: any = { ...rest };
    if (images !== undefined) updateData.images = JSON.stringify(images);
    if (availableAddons !== undefined) updateData.availableAddons = JSON.stringify(availableAddons);

    return prisma.service.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteService(id: string) {
    // Check if referenced in historical bookings
    const bookingUsage = await prisma.bookingService.count({ where: { serviceId: id } });
    if (bookingUsage > 0) {
      // Soft-delete / deactivate instead
      return prisma.service.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return prisma.service.delete({ where: { id } });
  }

  static async createCategory(data: any) {
    return prisma.serviceCategory.create({ data });
  }

  static async updateCategory(id: string, data: any) {
    return prisma.serviceCategory.update({
      where: { id },
      data,
    });
  }

  static async deleteCategory(id: string) {
    return prisma.serviceCategory.delete({ where: { id } });
  }
}
