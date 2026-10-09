import { prisma } from '../../config/database.js';

export class PortfolioService {
  static async getAllProjects(params?: {
    category?: string;
    featured?: boolean;
    search?: string;
    onlyPublished?: boolean;
  }) {
    const { category, featured, search, onlyPublished = true } = params || {};

    const where: any = {};
    if (onlyPublished) where.isPublished = true;
    if (category && category !== 'All') where.category = category;
    if (featured !== undefined) where.isFeatured = featured;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const projects = await prisma.portfolioProject.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { eventDate: 'desc' }, { createdAt: 'desc' }],
    });

    return projects.map((p) => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
    }));
  }

  static async getProjectBySlug(slug: string) {
    const project = await prisma.portfolioProject.findUnique({
      where: { slug },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return {
      ...project,
      images: project.images ? JSON.parse(project.images) : [],
    };
  }

  static async createProject(data: any) {
    const { images, eventDate, ...rest } = data;
    return prisma.portfolioProject.create({
      data: {
        ...rest,
        eventDate: eventDate ? new Date(eventDate) : null,
        images: images ? JSON.stringify(images) : null,
      },
    });
  }

  static async updateProject(id: string, data: any) {
    const { images, eventDate, ...rest } = data;
    const updateData: any = { ...rest };
    if (images !== undefined) updateData.images = JSON.stringify(images);
    if (eventDate !== undefined) updateData.eventDate = eventDate ? new Date(eventDate) : null;

    return prisma.portfolioProject.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteProject(id: string) {
    return prisma.portfolioProject.delete({ where: { id } });
  }
}
