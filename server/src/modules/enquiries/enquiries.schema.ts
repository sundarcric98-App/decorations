import { z } from 'zod';

export const createEnquirySchema = z.object({
  // Customer details
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number (at least 10 digits)'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  preferredContactMethod: z.enum(['Phone', 'WhatsApp', 'Email']).default('Phone'),

  // Event details
  eventType: z.string().min(2, 'Event type is required'),
  eventTitle: z.string().optional(),
  eventDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  venueCity: z.string().optional(),
  guestCount: z.number().or(z.string().regex(/^\d+$/).transform(Number)).optional().nullable(),
  isOutdoor: z.boolean().default(false),

  // Services & Budget
  selectedServiceIds: z.array(z.string()).optional(),
  selectedPackageId: z.string().optional().nullable(),
  customRequirements: z.string().optional(),
  inspirationImages: z.array(z.string()).optional(),
  budgetRange: z.string().optional(),
  consultationTime: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export const updateEnquirySchema = z.object({
  eventType: z.string().optional(),
  eventTitle: z.string().optional(),
  eventDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional().nullable(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  venueCity: z.string().optional(),
  guestCount: z.number().optional().nullable(),
  isOutdoor: z.boolean().optional(),
  selectedServiceIds: z.array(z.string()).optional(),
  selectedPackageId: z.string().optional().nullable(),
  customRequirements: z.string().optional(),
  budgetRange: z.string().optional(),
  preferredContactMethod: z.string().optional(),
  consultationTime: z.string().optional(),
  additionalNotes: z.string().optional(),
  status: z.enum([
    'NEW',
    'CONTACTED',
    'CONSULTATION_SCHEDULED',
    'QUOTATION_SENT',
    'NEGOTIATION',
    'CONVERTED',
    'LOST',
    'ARCHIVED',
  ]).optional(),
  assignedToUserId: z.string().optional().nullable(),
});

export const addEnquiryNoteSchema = z.object({
  note: z.string().min(2, 'Note is required'),
  followUpDate: z.string().or(z.date()).optional().nullable(),
});

export const convertToBookingSchema = z.object({
  eventName: z.string().min(2, 'Event name is required'),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  venueCity: z.string().optional(),
  guestCount: z.number().optional().nullable(),
  totalAmount: z.number().default(0),
  discountAmount: z.number().default(0),
  taxAmount: z.number().default(0),
  finalAmount: z.number().default(0),
  internalNotes: z.string().optional(),
  selectedServices: z.array(
    z.object({
      serviceId: z.string().optional(),
      serviceName: z.string(),
      quantity: z.number().default(1),
      unitPrice: z.number().default(0),
      notes: z.string().optional(),
    })
  ).optional(),
});
