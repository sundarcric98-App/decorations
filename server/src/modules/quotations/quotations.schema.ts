import { z } from 'zod';

export const createQuotationSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  bookingId: z.string().optional().nullable(),
  enquiryId: z.string().optional().nullable(),
  validUntil: z.string().or(z.date()),
  taxRate: z.number().min(0).default(18),
  overallDiscount: z.number().min(0).default(0),
  terms: z.string().optional().nullable(),
  exclusions: z.string().optional().nullable(),
  paymentSchedule: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']).default('DRAFT'),
  items: z.array(
    z.object({
      serviceId: z.string().optional().nullable(),
      name: z.string().min(1, 'Item name is required'),
      description: z.string().optional().nullable(),
      quantity: z.number().min(0.1).default(1),
      unit: z.string().default('Set'),
      unitPrice: z.number().min(0).default(0),
      discount: z.number().min(0).default(0),
    })
  ).min(1, 'At least one line item is required in the quotation'),
});

export const updateQuotationSchema = createQuotationSchema.partial();
