import { z } from 'zod';

export const createExpenseSchema = z.object({
  category: z.enum([
    'DECORATION_MATERIALS',
    'FLOWERS',
    'LIGHTING_SOUND',
    'LABOUR',
    'PHOTOGRAPHY',
    'CATERING',
    'TRANSPORTATION',
    'STALL_SETUP',
    'EQUIPMENT_RENTAL',
    'OTHER',
  ]),
  description: z.string().min(2, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  expenseDate: z.string().or(z.date()).optional(),
  bookingId: z.string().optional().nullable(),
  vendorId: z.string().optional().nullable(),
  paymentMethod: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'OTHER']).default('CASH'),
  receiptUrl: z.string().optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();
