-- ==========================================================
-- Sathuragiri Decoration & Event Management Database Schema
-- Generated from Prisma Schema
-- Compatible with PostgreSQL, MySQL 8+, SQLite, and Cloud SQL
-- ==========================================================

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS "BusinessSettings";
DROP TABLE IF EXISTS "AuditLog";
DROP TABLE IF EXISTS "Notification";
DROP TABLE IF EXISTS "Expense";
DROP TABLE IF EXISTS "Payment";
DROP TABLE IF EXISTS "QuotationItem";
DROP TABLE IF EXISTS "Quotation";
DROP TABLE IF EXISTS "BookingAssignment";
DROP TABLE IF EXISTS "BookingService";
DROP TABLE IF EXISTS "Booking";
DROP TABLE IF EXISTS "EnquiryNote";
DROP TABLE IF EXISTS "Enquiry";
DROP TABLE IF EXISTS "Vendor";
DROP TABLE IF EXISTS "StaffProfile";
DROP TABLE IF EXISTS "PortfolioProject";
DROP TABLE IF EXISTS "Package";
DROP TABLE IF EXISTS "Service";
DROP TABLE IF EXISTS "ServiceCategory";
DROP TABLE IF EXISTS "Customer";
DROP TABLE IF EXISTS "User";

-- ----------------------------------------------------------
-- 1. USERS & AUTHENTICATION
-- ----------------------------------------------------------
CREATE TABLE "User" (
    "id" VARCHAR(36) PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "passwordHash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "role" VARCHAR(20) NOT NULL DEFAULT 'STAFF', -- OWNER, MANAGER, STAFF
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "resetToken" VARCHAR(255),
    "resetTokenExpires" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_user_email" ON "User"("email");

-- ----------------------------------------------------------
-- 2. CUSTOMERS (CRM)
-- ----------------------------------------------------------
CREATE TABLE "Customer" (
    "id" VARCHAR(36) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL UNIQUE,
    "email" VARCHAR(255),
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_customer_phone" ON "Customer"("phone");
CREATE INDEX "idx_customer_name" ON "Customer"("name");

-- ----------------------------------------------------------
-- 3. SERVICE CATEGORIES
-- ----------------------------------------------------------
CREATE TABLE "ServiceCategory" (
    "id" VARCHAR(36) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT,
    "image" VARCHAR(500),
    "sortOrder" INT NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_servicecategory_slug" ON "ServiceCategory"("slug");

-- ----------------------------------------------------------
-- 4. SERVICES CATALOG
-- ----------------------------------------------------------
CREATE TABLE "Service" (
    "id" VARCHAR(36) PRIMARY KEY,
    "categoryId" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "shortDesc" TEXT NOT NULL,
    "detailedDesc" TEXT,
    "coverImage" VARCHAR(500) NOT NULL,
    "images" TEXT, -- JSON Array of image URLs
    "startingPrice" DECIMAL(12,2),
    "pricingMethod" VARCHAR(50) NOT NULL DEFAULT 'Starting price',
    "availableAddons" TEXT, -- JSON Array of strings
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "sortOrder" INT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_service_category" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_service_categoryId" ON "Service"("categoryId");
CREATE INDEX "idx_service_slug" ON "Service"("slug");
CREATE INDEX "idx_service_isFeatured" ON "Service"("isFeatured");

-- ----------------------------------------------------------
-- 5. EVENT PACKAGES
-- ----------------------------------------------------------
CREATE TABLE "Package" (
    "id" VARCHAR(36) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "includedServices" TEXT NOT NULL, -- JSON Array of inclusions
    "packagePrice" DECIMAL(12,2),
    "pricingType" VARCHAR(50) NOT NULL DEFAULT 'Starting price',
    "optionalExtras" TEXT, -- JSON Array of extras
    "terms" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "sortOrder" INT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_package_slug" ON "Package"("slug");

-- ----------------------------------------------------------
-- 6. PORTFOLIO & GALLERY SHOWCASE
-- ----------------------------------------------------------
CREATE TABLE "PortfolioProject" (
    "id" VARCHAR(36) PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "category" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "clientName" VARCHAR(255),
    "location" VARCHAR(255),
    "eventDate" TIMESTAMP,
    "coverImage" VARCHAR(500) NOT NULL,
    "images" TEXT, -- JSON Array of gallery images
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "isPublished" BOOLEAN NOT NULL DEFAULT TRUE,
    "sortOrder" INT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_portfolio_slug" ON "PortfolioProject"("slug");
CREATE INDEX "idx_portfolio_category" ON "PortfolioProject"("category");
CREATE INDEX "idx_portfolio_isFeatured" ON "PortfolioProject"("isFeatured");

-- ----------------------------------------------------------
-- 7. CUSTOMER ENQUIRIES & LEADS
-- ----------------------------------------------------------
CREATE TABLE "Enquiry" (
    "id" VARCHAR(36) PRIMARY KEY,
    "reference" VARCHAR(50) NOT NULL UNIQUE,
    "customerId" VARCHAR(36) NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "eventTitle" VARCHAR(255),
    "eventDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP,
    "venueName" VARCHAR(255),
    "venueAddress" TEXT,
    "venueCity" VARCHAR(100),
    "guestCount" INT,
    "isOutdoor" BOOLEAN NOT NULL DEFAULT FALSE,
    "selectedServiceIds" TEXT, -- JSON Array
    "selectedPackageId" VARCHAR(36),
    "customRequirements" TEXT,
    "inspirationImages" TEXT, -- JSON Array
    "budgetRange" VARCHAR(100),
    "preferredContactMethod" VARCHAR(50) NOT NULL DEFAULT 'Phone',
    "consultationTime" VARCHAR(50),
    "additionalNotes" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'NEW', -- NEW, CONTACTED, CONSULTATION_SCHEDULED, QUOTATION_SENT, NEGOTIATION, CONVERTED, LOST, ARCHIVED
    "assignedToUserId" VARCHAR(36),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_enquiry_customer" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_enquiry_reference" ON "Enquiry"("reference");
CREATE INDEX "idx_enquiry_status" ON "Enquiry"("status");
CREATE INDEX "idx_enquiry_eventDate" ON "Enquiry"("eventDate");
CREATE INDEX "idx_enquiry_customerId" ON "Enquiry"("customerId");

-- ----------------------------------------------------------
-- 8. ENQUIRY NOTES & FOLLOW-UPS
-- ----------------------------------------------------------
CREATE TABLE "EnquiryNote" (
    "id" VARCHAR(36) PRIMARY KEY,
    "enquiryId" VARCHAR(36) NOT NULL,
    "userId" VARCHAR(36),
    "note" TEXT NOT NULL,
    "followUpDate" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_note_enquiry" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_note_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_enquirynote_enquiryId" ON "EnquiryNote"("enquiryId");

-- ----------------------------------------------------------
-- 9. EVENT BOOKINGS
-- ----------------------------------------------------------
CREATE TABLE "Booking" (
    "id" VARCHAR(36) PRIMARY KEY,
    "reference" VARCHAR(50) NOT NULL UNIQUE,
    "customerId" VARCHAR(36) NOT NULL,
    "enquiryId" VARCHAR(36),
    "eventName" VARCHAR(255) NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP,
    "venueName" VARCHAR(255),
    "venueAddress" TEXT,
    "venueCity" VARCHAR(100),
    "guestCount" INT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED', -- DRAFT, TENTATIVE, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "finalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "internalNotes" TEXT,
    "termsAndConditions" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_booking_customer" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_booking_enquiry" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_booking_reference" ON "Booking"("reference");
CREATE INDEX "idx_booking_status" ON "Booking"("status");
CREATE INDEX "idx_booking_startDate" ON "Booking"("startDate");
CREATE INDEX "idx_booking_customerId" ON "Booking"("customerId");

-- ----------------------------------------------------------
-- 10. BOOKING SERVICES BREAKDOWN
-- ----------------------------------------------------------
CREATE TABLE "BookingService" (
    "id" VARCHAR(36) PRIMARY KEY,
    "bookingId" VARCHAR(36) NOT NULL,
    "serviceId" VARCHAR(36),
    "serviceName" VARCHAR(255) NOT NULL,
    "quantity" INT NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "notes" TEXT,
    CONSTRAINT "fk_bookingservice_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_bookingservice_service" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_bookingservice_bookingId" ON "BookingService"("bookingId");

-- ----------------------------------------------------------
-- 11. STAFF PROFILES
-- ----------------------------------------------------------
CREATE TABLE "StaffProfile" (
    "id" VARCHAR(36) PRIMARY KEY,
    "userId" VARCHAR(36) UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "roleTitle" VARCHAR(100) NOT NULL,
    "skills" TEXT,
    "availabilityStatus" VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, ON_LEAVE, BUSY
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_staff_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_staff_name" ON "StaffProfile"("name");

-- ----------------------------------------------------------
-- 12. VENDORS & SUPPLIERS
-- ----------------------------------------------------------
CREATE TABLE "Vendor" (
    "id" VARCHAR(36) PRIMARY KEY,
    "businessName" VARCHAR(255) NOT NULL,
    "contactPerson" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "category" VARCHAR(100) NOT NULL,
    "servicesSupplied" TEXT,
    "agreedRates" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_vendor_businessName" ON "Vendor"("businessName");
CREATE INDEX "idx_vendor_category" ON "Vendor"("category");

-- ----------------------------------------------------------
-- 13. BOOKING ASSIGNMENTS (STAFF & VENDORS)
-- ----------------------------------------------------------
CREATE TABLE "BookingAssignment" (
    "id" VARCHAR(36) PRIMARY KEY,
    "bookingId" VARCHAR(36) NOT NULL,
    "staffId" VARCHAR(36),
    "vendorId" VARCHAR(36),
    "role" VARCHAR(100) NOT NULL,
    "notes" TEXT,
    "assignedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_assignment_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_assignment_staff" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE SET NULL,
    CONSTRAINT "fk_assignment_vendor" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_assignment_bookingId" ON "BookingAssignment"("bookingId");
CREATE INDEX "idx_assignment_staffId" ON "BookingAssignment"("staffId");
CREATE INDEX "idx_assignment_vendorId" ON "BookingAssignment"("vendorId");

-- ----------------------------------------------------------
-- 14. QUOTATIONS
-- ----------------------------------------------------------
CREATE TABLE "Quotation" (
    "id" VARCHAR(36) PRIMARY KEY,
    "quotationNumber" VARCHAR(50) NOT NULL UNIQUE,
    "version" INT NOT NULL DEFAULT 1,
    "customerId" VARCHAR(36) NOT NULL,
    "bookingId" VARCHAR(36),
    "enquiryId" VARCHAR(36),
    "validUntil" TIMESTAMP NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "grandTotal" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "terms" TEXT,
    "exclusions" TEXT,
    "paymentSchedule" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_quotation_customer" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_quotation_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL,
    CONSTRAINT "fk_quotation_enquiry" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_quotation_number" ON "Quotation"("quotationNumber");
CREATE INDEX "idx_quotation_status" ON "Quotation"("status");
CREATE INDEX "idx_quotation_customerId" ON "Quotation"("customerId");

-- ----------------------------------------------------------
-- 15. QUOTATION LINE ITEMS
-- ----------------------------------------------------------
CREATE TABLE "QuotationItem" (
    "id" VARCHAR(36) PRIMARY KEY,
    "quotationId" VARCHAR(36) NOT NULL,
    "serviceId" VARCHAR(36),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    "unit" VARCHAR(50) NOT NULL DEFAULT 'Set',
    "unitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT "fk_quotationitem_quotation" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_quotationitem_quotationId" ON "QuotationItem"("quotationId");

-- ----------------------------------------------------------
-- 16. PAYMENTS & RECEIPTS
-- ----------------------------------------------------------
CREATE TABLE "Payment" (
    "id" VARCHAR(36) PRIMARY KEY,
    "receiptNumber" VARCHAR(50) NOT NULL UNIQUE,
    "bookingId" VARCHAR(36) NOT NULL,
    "customerId" VARCHAR(36) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentMethod" VARCHAR(50) NOT NULL DEFAULT 'UPI', -- CASH, BANK_TRANSFER, UPI, CARD, OTHER
    "paymentType" VARCHAR(50) NOT NULL DEFAULT 'ADVANCE', -- ADVANCE, PARTIAL, FINAL_SETTLEMENT, REFUND
    "reference" VARCHAR(100),
    "paymentDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PAID', -- PAID, PENDING, REFUNDED
    "recordedByUserId" VARCHAR(36),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_payment_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_payment_customer" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_payment_recordedby" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_payment_receiptNumber" ON "Payment"("receiptNumber");
CREATE INDEX "idx_payment_bookingId" ON "Payment"("bookingId");
CREATE INDEX "idx_payment_customerId" ON "Payment"("customerId");

-- ----------------------------------------------------------
-- 17. EXPENSES TRACKING
-- ----------------------------------------------------------
CREATE TABLE "Expense" (
    "id" VARCHAR(36) PRIMARY KEY,
    "category" VARCHAR(100) NOT NULL, -- DECORATION_MATERIALS, FLOWERS, LIGHTING_SOUND, LABOUR, PHOTOGRAPHY, CATERING, TRANSPORTATION, STALL_SETUP, EQUIPMENT_RENTAL, OTHER
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "expenseDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookingId" VARCHAR(36),
    "vendorId" VARCHAR(36),
    "paymentMethod" VARCHAR(50) NOT NULL DEFAULT 'CASH',
    "receiptUrl" VARCHAR(500),
    "recordedByUserId" VARCHAR(36),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_expense_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL,
    CONSTRAINT "fk_expense_vendor" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL,
    CONSTRAINT "fk_expense_recordedby" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_expense_bookingId" ON "Expense"("bookingId");
CREATE INDEX "idx_expense_category" ON "Expense"("category");
CREATE INDEX "idx_expense_expenseDate" ON "Expense"("expenseDate");

-- ----------------------------------------------------------
-- 18. NOTIFICATIONS
-- ----------------------------------------------------------
CREATE TABLE "Notification" (
    "id" VARCHAR(36) PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'ENQUIRY',
    "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "link" VARCHAR(500),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_notification_isRead" ON "Notification"("isRead");
CREATE INDEX "idx_notification_createdAt" ON "Notification"("createdAt");

-- ----------------------------------------------------------
-- 19. AUDIT LOGS
-- ----------------------------------------------------------
CREATE TABLE "AuditLog" (
    "id" VARCHAR(36) PRIMARY KEY,
    "userId" VARCHAR(36),
    "action" VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, CONVERT, LOGIN, LOGOUT
    "entity" VARCHAR(50) NOT NULL, -- ENQUIRY, BOOKING, QUOTATION, PAYMENT, EXPENSE, USER
    "entityId" VARCHAR(36),
    "details" TEXT, -- JSON String
    "ipAddress" VARCHAR(50),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_audit_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_audit_entity" ON "AuditLog"("entity");
CREATE INDEX "idx_audit_userId" ON "AuditLog"("userId");
CREATE INDEX "idx_audit_createdAt" ON "AuditLog"("createdAt");

-- ----------------------------------------------------------
-- 20. BUSINESS SETTINGS
-- ----------------------------------------------------------
CREATE TABLE "BusinessSettings" (
    "id" VARCHAR(50) PRIMARY KEY DEFAULT 'default-settings',
    "businessName" VARCHAR(255) NOT NULL DEFAULT 'Sathuragiri Decoration',
    "tagline" VARCHAR(255) NOT NULL DEFAULT 'Every Celebration, Beautifully Crafted.',
    "logoUrl" VARCHAR(500),
    "phone" VARCHAR(50) NOT NULL DEFAULT '+91 98765 43210',
    "alternatePhone" VARCHAR(50) DEFAULT '+91 98765 01234',
    "whatsappNumber" VARCHAR(50) NOT NULL DEFAULT '+919876543210',
    "email" VARCHAR(255) NOT NULL DEFAULT 'contact@sathuragiridecoration.com',
    "address" TEXT NOT NULL DEFAULT '142, Temple View Road, Madurai',
    "city" VARCHAR(100) NOT NULL DEFAULT 'Madurai',
    "state" VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
    "pincode" VARCHAR(20) NOT NULL DEFAULT '625001',
    "mapsEmbedUrl" TEXT DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125747.88722421375!2d78.04169722883301!3d9.92520074218841!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00c582b1189633%3A0xdc955b7264f63933!2sMadurai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    "primaryGold" VARCHAR(20) NOT NULL DEFAULT '#B8955A',
    "gstNumber" VARCHAR(50) DEFAULT '33AAAAA0000A1Z5',
    "advancePercentageDefault" INT NOT NULL DEFAULT 30,
    "currencySymbol" VARCHAR(10) NOT NULL DEFAULT '₹',
    "termsDefault" TEXT DEFAULT '1. 30% advance required to confirm booking.\n2. 50% payable 2 days prior to the event.\n3. 20% balance payable on event completion.\n4. Decoration changes must be requested at least 7 days before event.',
    "socialInstagram" VARCHAR(255) DEFAULT 'https://instagram.com/sathuragiridecoration',
    "socialFacebook" VARCHAR(255) DEFAULT 'https://facebook.com/sathuragiridecoration',
    "socialYoutube" VARCHAR(255) DEFAULT 'https://youtube.com/@sathuragiridecoration',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
