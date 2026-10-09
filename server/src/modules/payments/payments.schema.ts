import { z } from 'zod';

export const createPaymentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CARD', 'OTHER']).default('UPI'),
  paymentType: z.enum(['ADVANCE', 'PARTIAL', 'FINAL_SETTLEMENT', 'REFUND']).default('ADVANCE'),
  reference: z.string().optional().nullable(),
  paymentDate: z.string().or(z.date()).optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(['PAID', 'PENDING', 'REFUNDED']).default('PAID'),
});

export const updatePaymentSchema = createPaymentSchema.partial();
