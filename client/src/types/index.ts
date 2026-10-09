export type UserRole = 'OWNER' | 'MANAGER' | 'STAFF';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
}

export interface BusinessSettings {
  id: string;
  businessName: string;
  tagline: string;
  logoUrl?: string | null;
  phone: string;
  alternatePhone?: string | null;
  whatsappNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  mapsEmbedUrl?: string | null;
  primaryGold: string;
  gstNumber?: string | null;
  advancePercentageDefault: number;
  currencySymbol: string;
  termsDefault?: string | null;
  socialInstagram?: string | null;
  socialFacebook?: string | null;
  socialYoutube?: string | null;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    services?: number;
  };
}

export interface Service {
  id: string;
  categoryId: string;
  category?: ServiceCategory;
  name: string;
  slug: string;
  shortDesc: string;
  detailedDesc?: string | null;
  coverImage: string;
  images?: string[];
  startingPrice?: number | null;
  pricingMethod: string;
  availableAddons?: string[];
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  description: string;
  includedServices: string[];
  packagePrice?: number | null;
  pricingType: string;
  optionalExtras?: string[];
  terms?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  clientName?: string | null;
  location?: string | null;
  eventDate?: string | null;
  coverImage: string;
  images?: string[];
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt?: string;
}

export type EnquiryStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'CONSULTATION_SCHEDULED'
  | 'QUOTATION_SENT'
  | 'NEGOTIATION'
  | 'CONVERTED'
  | 'LOST'
  | 'ARCHIVED';

export interface EnquiryNote {
  id: string;
  enquiryId: string;
  userId?: string | null;
  user?: { id: string; name: string; role?: string } | null;
  note: string;
  followUpDate?: string | null;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  _count?: {
    enquiries?: number;
    bookings?: number;
    quotations?: number;
    payments?: number;
  };
}

export interface Enquiry {
  id: string;
  reference: string;
  customerId: string;
  customer: Customer;
  eventType: string;
  eventTitle?: string | null;
  eventDate: string;
  endDate?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  venueCity?: string | null;
  guestCount?: number | null;
  isOutdoor: boolean;
  selectedServiceIds?: string[];
  selectedPackageId?: string | null;
  customRequirements?: string | null;
  inspirationImages?: string[];
  budgetRange?: string | null;
  preferredContactMethod: string;
  consultationTime?: string | null;
  additionalNotes?: string | null;
  status: EnquiryStatus;
  assignedToUserId?: string | null;
  createdAt: string;
  updatedAt: string;
  notes?: EnquiryNote[];
  bookings?: Booking[];
  quotations?: Quotation[];
}

export type BookingStatus =
  | 'DRAFT'
  | 'TENTATIVE'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface BookingService {
  id: string;
  bookingId: string;
  serviceId?: string | null;
  service?: Service | null;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  notes?: string | null;
}

export interface StaffProfile {
  id: string;
  userId?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  roleTitle: string;
  skills?: string | null;
  availabilityStatus: string;
  isActive: boolean;
}

export interface Vendor {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email?: string | null;
  category: string;
  servicesSupplied?: string | null;
  agreedRates?: string | null;
  notes?: string | null;
  isActive: boolean;
}

export interface BookingAssignment {
  id: string;
  bookingId: string;
  staffId?: string | null;
  staff?: StaffProfile | null;
  vendorId?: string | null;
  vendor?: Vendor | null;
  role: string;
  notes?: string | null;
  assignedAt: string;
}

export interface Booking {
  id: string;
  reference: string;
  customerId: string;
  customer: Customer;
  enquiryId?: string | null;
  enquiry?: Enquiry | null;
  eventName: string;
  eventType: string;
  startDate: string;
  endDate?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  venueCity?: string | null;
  guestCount?: number | null;
  status: BookingStatus;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  internalNotes?: string | null;
  termsAndConditions?: string | null;
  createdAt: string;
  updatedAt: string;
  services?: BookingService[];
  assignments?: BookingAssignment[];
  quotations?: Quotation[];
  payments?: Payment[];
  expenses?: Expense[];
  totalPaid?: number;
  balance?: number;
  totalExpenses?: number;
  estimatedProfit?: number;
}

export interface QuotationItem {
  id?: string;
  quotationId?: string;
  serviceId?: string | null;
  name: string;
  description?: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  version: number;
  customerId: string;
  customer: Customer;
  bookingId?: string | null;
  booking?: Booking | null;
  enquiryId?: string | null;
  enquiry?: Enquiry | null;
  validUntil: string;
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  terms?: string | null;
  exclusions?: string | null;
  paymentSchedule?: string | null;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: QuotationItem[];
}

export interface Payment {
  id: string;
  receiptNumber: string;
  bookingId: string;
  booking?: Booking;
  customerId: string;
  customer: Customer;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CARD' | 'OTHER';
  paymentType: 'ADVANCE' | 'PARTIAL' | 'FINAL_SETTLEMENT' | 'REFUND';
  reference?: string | null;
  paymentDate: string;
  notes?: string | null;
  status: 'PAID' | 'PENDING' | 'REFUNDED';
  recordedByUserId?: string | null;
  recordedBy?: { id: string; name: string } | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  category:
    | 'DECORATION_MATERIALS'
    | 'FLOWERS'
    | 'LIGHTING_SOUND'
    | 'LABOUR'
    | 'PHOTOGRAPHY'
    | 'CATERING'
    | 'TRANSPORTATION'
    | 'STALL_SETUP'
    | 'EQUIPMENT_RENTAL'
    | 'OTHER';
  description: string;
  amount: number;
  expenseDate: string;
  bookingId?: string | null;
  booking?: { id: string; reference: string; eventName: string } | null;
  vendorId?: string | null;
  vendor?: { id: string; businessName: string; contactPerson: string } | null;
  paymentMethod: string;
  receiptUrl?: string | null;
  recordedByUserId?: string | null;
  recordedBy?: { id: string; name: string } | null;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'ENQUIRY' | 'BOOKING' | 'PAYMENT' | 'FOLLOWUP' | 'SYSTEM';
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}
