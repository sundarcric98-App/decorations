import { z } from 'zod';

export const createPortfolioSchema = z.object({
  title: z.string().min(2, 'Project title is required'),
  slug: z.string().min(2, 'Slug is required'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().min(5, 'Description is required'),
  clientName: z.string().optional(),
  location: z.string().optional(),
  eventDate: z.string().or(z.date()).optional(),
  coverImage: z.string().min(1, 'Cover image URL is required'),
  images: z.array(z.string()).optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export const updatePortfolioSchema = createPortfolioSchema.partial();
