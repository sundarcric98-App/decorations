import { z } from 'zod';

export const createBookingSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  enquiryId: z.string().optional().nullable(),
  eventName: z.string().min(2, 'Event name is required'),
  eventType: z.string().min(2, 'Event type is required'),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  venueCity: z.string().optional(),
  guestCount: z.number().optional().nullable(),
  status: z.enum(['DRAFT', 'TENTATIVE', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('CONFIRMED'),
  totalAmount: z.number().default(0),
  discountAmount: z.number().default(0),
  taxAmount: z.number().default(0),
  finalAmount: z.number().default(0),
  internalNotes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  services: z.array(
    z.object({
      serviceId: z.string().optional().nullable(),
      serviceName: z.string(),
      quantity: z.number().default(1),
      unitPrice: z.number().default(0),
      notes: z.string().optional().nullable(),
    })
  ).optional(),
});

export const updateBookingSchema = createBookingSchema.partial();

export const assignBookingStaffSchema = z.object({
  staffId: z.string().optional().nullable(),
  vendorId: z.string().optional().nullable(),
  role: z.string().min(2, 'Role is required'),
  notes: z.string().optional().nullable(),
});
