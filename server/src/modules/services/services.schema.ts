import { z } from 'zod';

export const createServiceSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  shortDesc: z.string().min(5, 'Short description is required'),
  detailedDesc: z.string().optional(),
  coverImage: z.string().min(1, 'Cover image URL is required'),
  images: z.array(z.string()).optional(),
  startingPrice: z.number().optional().nullable(),
  pricingMethod: z.string().default('Starting price'),
  availableAddons: z.array(z.string()).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export const updateServiceSchema = createServiceSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});
