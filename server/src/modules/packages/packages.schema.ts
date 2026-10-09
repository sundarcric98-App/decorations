import { z } from 'zod';

export const createPackageSchema = z.object({
  name: z.string().min(2, 'Package name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().min(5, 'Description is required'),
  includedServices: z.array(z.string()).min(1, 'At least one included service is required'),
  packagePrice: z.number().optional().nullable(),
  pricingType: z.string().default('Starting price'),
  optionalExtras: z.array(z.string()).optional(),
  terms: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

export const updatePackageSchema = createPackageSchema.partial();
