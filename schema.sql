-- ==============================================================================
-- SATHURAGIRI DECORATION & EVENT MANAGEMENT PLATFORM
-- SUPABASE POSTGRESQL COMPLETE DATABASE SCHEMA & INITIAL DATA SEED
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard).
-- 2. Navigate to "SQL Editor" on the left navigation bar.
-- 3. Click "New query", paste the entire contents of this file, and click "Run".
-- ==============================================================================

-- Enable cryptographic UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically update "updatedAt" timestamp on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS "BusinessSettings" CASCADE;
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Expense" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "QuotationItem" CASCADE;
DROP TABLE IF EXISTS "Quotation" CASCADE;
DROP TABLE IF EXISTS "BookingAssignment" CASCADE;
DROP TABLE IF EXISTS "BookingService" CASCADE;
DROP TABLE IF EXISTS "Booking" CASCADE;
DROP TABLE IF EXISTS "EnquiryNote" CASCADE;
DROP TABLE IF EXISTS "Enquiry" CASCADE;
DROP TABLE IF EXISTS "Vendor" CASCADE;
DROP TABLE IF EXISTS "StaffProfile" CASCADE;
DROP TABLE IF EXISTS "PortfolioProject" CASCADE;
DROP TABLE IF EXISTS "Package" CASCADE;
DROP TABLE IF EXISTS "Service" CASCADE;
DROP TABLE IF EXISTS "ServiceCategory" CASCADE;
DROP TABLE IF EXISTS "Customer" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- ------------------------------------------------------------------------------
-- 1. USERS & AUTHENTICATION (Admins, Managers, Staff)
-- ------------------------------------------------------------------------------
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STAFF', -- OWNER, MANAGER, STAFF
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "resetToken" TEXT,
    "resetTokenExpires" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_user_email" ON "User"("email");

CREATE TRIGGER set_timestamp_user
BEFORE UPDATE ON "User"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 2. CUSTOMERS (CRM)
-- ------------------------------------------------------------------------------
CREATE TABLE "Customer" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL UNIQUE,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_customer_phone" ON "Customer"("phone");
CREATE INDEX "idx_customer_name" ON "Customer"("name");

CREATE TRIGGER set_timestamp_customer
BEFORE UPDATE ON "Customer"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 3. SERVICE CATEGORIES
-- ------------------------------------------------------------------------------
CREATE TABLE "ServiceCategory" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "image" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_servicecategory_slug" ON "ServiceCategory"("slug");

CREATE TRIGGER set_timestamp_servicecategory
BEFORE UPDATE ON "ServiceCategory"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4. SERVICES CATALOG
-- ------------------------------------------------------------------------------
CREATE TABLE "Service" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "shortDesc" TEXT NOT NULL,
    "detailedDesc" TEXT,
    "coverImage" TEXT NOT NULL,
    "images" TEXT, -- JSON Array of image URLs
    "startingPrice" DOUBLE PRECISION,
    "pricingMethod" TEXT NOT NULL DEFAULT 'Starting price',
    "availableAddons" TEXT, -- JSON Array of addon strings
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_service_category" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "idx_service_categoryId" ON "Service"("categoryId");
CREATE INDEX "idx_service_slug" ON "Service"("slug");
CREATE INDEX "idx_service_isFeatured" ON "Service"("isFeatured");

CREATE TRIGGER set_timestamp_service
BEFORE UPDATE ON "Service"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. EVENT PACKAGES
-- ------------------------------------------------------------------------------
CREATE TABLE "Package" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "includedServices" TEXT NOT NULL, -- JSON Array of included service points
    "packagePrice" DOUBLE PRECISION,
    "pricingType" TEXT NOT NULL DEFAULT 'Starting price',
    "optionalExtras" TEXT, -- JSON Array of extras
    "terms" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_package_slug" ON "Package"("slug");

CREATE TRIGGER set_timestamp_package
BEFORE UPDATE ON "Package"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 6. PORTFOLIO SHOWCASE
-- ------------------------------------------------------------------------------
CREATE TABLE "PortfolioProject" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "clientName" TEXT,
    "location" TEXT,
    "eventDate" TIMESTAMPTZ,
    "coverImage" TEXT NOT NULL,
    "images" TEXT, -- JSON Array of gallery images
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "isPublished" BOOLEAN NOT NULL DEFAULT TRUE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_portfolio_slug" ON "PortfolioProject"("slug");
CREATE INDEX "idx_portfolio_category" ON "PortfolioProject"("category");
CREATE INDEX "idx_portfolio_isFeatured" ON "PortfolioProject"("isFeatured");

CREATE TRIGGER set_timestamp_portfolio
BEFORE UPDATE ON "PortfolioProject"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 7. CUSTOMER ENQUIRIES & LEADS
-- ------------------------------------------------------------------------------
CREATE TABLE "Enquiry" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "reference" TEXT NOT NULL UNIQUE,
    "customerId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventTitle" TEXT,
    "eventDate" TIMESTAMPTZ NOT NULL,
    "endDate" TIMESTAMPTZ,
    "venueName" TEXT,
    "venueAddress" TEXT,
    "venueCity" TEXT,
    "guestCount" INTEGER,
    "isOutdoor" BOOLEAN NOT NULL DEFAULT FALSE,
    "selectedServiceIds" TEXT, -- JSON Array
    "selectedPackageId" TEXT,
    "customRequirements" TEXT,
    "inspirationImages" TEXT, -- JSON Array
    "budgetRange" TEXT,
    "preferredContactMethod" TEXT NOT NULL DEFAULT 'Phone',
    "consultationTime" TEXT,
    "additionalNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW', -- NEW, CONTACTED, CONSULTATION_SCHEDULED, QUOTATION_SENT, NEGOTIATION, CONVERTED, LOST, ARCHIVED
    "assignedToUserId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_enquiry_customer" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "idx_enquiry_reference" ON "Enquiry"("reference");
CREATE INDEX "idx_enquiry_status" ON "Enquiry"("status");
CREATE INDEX "idx_enquiry_eventDate" ON "Enquiry"("eventDate");
CREATE INDEX "idx_enquiry_customerId" ON "Enquiry"("customerId");

CREATE TRIGGER set_timestamp_enquiry
BEFORE UPDATE ON "Enquiry"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 8. ENQUIRY NOTES & FOLLOW-UPS
-- ------------------------------------------------------------------------------
CREATE TABLE "EnquiryNote" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "enquiryId" TEXT NOT NULL,
    "userId" TEXT,
    "note" TEXT NOT NULL,
    "followUpDate" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_note_enquiry" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_note_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "idx_enquirynote_enquiryId" ON "EnquiryNote"("enquiryId");

-- ------------------------------------------------------------------------------
-- 9. EVENT BOOKINGS
-- ------------------------------------------------------------------------------
CREATE TABLE "Booking" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "reference" TEXT NOT NULL UNIQUE,
    "customerId" TEXT NOT NULL,
    "enquiryId" TEXT,
    "eventName" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "startDate" TIMESTAMPTZ NOT NULL,
    "endDate" TIMESTAMPTZ,
    "venueName" TEXT,
    "venueAddress" TEXT,
    "venueCity" TEXT,
    "guestCount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED', -- DRAFT, TENTATIVE, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "internalNotes" TEXT,
    "termsAndConditions" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_booking_customer" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_booking_enquiry" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "idx_booking_reference" ON "Booking"("reference");
CREATE INDEX "idx_booking_status" ON "Booking"("status");
CREATE INDEX "idx_booking_startDate" ON "Booking"("startDate");
CREATE INDEX "idx_booking_customerId" ON "Booking"("customerId");

CREATE TRIGGER set_timestamp_booking
BEFORE UPDATE ON "Booking"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 10. BOOKING SERVICES BREAKDOWN
-- ------------------------------------------------------------------------------
CREATE TABLE "BookingService" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "bookingId" TEXT NOT NULL,
    "serviceId" TEXT,
    "serviceName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    CONSTRAINT "fk_bookingservice_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_bookingservice_service" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "idx_bookingservice_bookingId" ON "BookingService"("bookingId");

-- ------------------------------------------------------------------------------
-- 11. STAFF PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE "StaffProfile" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT UNIQUE,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "roleTitle" TEXT NOT NULL,
    "skills" TEXT,
    "availabilityStatus" TEXT NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, ON_LEAVE, BUSY
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_staff_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "idx_staff_name" ON "StaffProfile"("name");

CREATE TRIGGER set_timestamp_staff
BEFORE UPDATE ON "StaffProfile"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 12. VENDORS & SUPPLIERS
-- ------------------------------------------------------------------------------
CREATE TABLE "Vendor" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "businessName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "category" TEXT NOT NULL,
    "servicesSupplied" TEXT,
    "agreedRates" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_vendor_businessName" ON "Vendor"("businessName");
CREATE INDEX "idx_vendor_category" ON "Vendor"("category");

CREATE TRIGGER set_timestamp_vendor
BEFORE UPDATE ON "Vendor"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 13. BOOKING ASSIGNMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE "BookingAssignment" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "bookingId" TEXT NOT NULL,
    "staffId" TEXT,
    "vendorId" TEXT,
    "role" TEXT NOT NULL,
    "notes" TEXT,
    "assignedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_assignment_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_assignment_staff" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fk_assignment_vendor" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "idx_assignment_bookingId" ON "BookingAssignment"("bookingId");
CREATE INDEX "idx_assignment_staffId" ON "BookingAssignment"("staffId");
CREATE INDEX "idx_assignment_vendorId" ON "BookingAssignment"("vendorId");

-- ------------------------------------------------------------------------------
-- 14. QUOTATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE "Quotation" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "quotationNumber" TEXT NOT NULL UNIQUE,
    "version" INTEGER NOT NULL DEFAULT 1,
    "customerId" TEXT NOT NULL,
    "bookingId" TEXT,
    "enquiryId" TEXT,
    "validUntil" TIMESTAMPTZ NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "terms" TEXT,
    "exclusions" TEXT,
    "paymentSchedule" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_quotation_customer" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_quotation_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fk_quotation_enquiry" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "idx_quotation_number" ON "Quotation"("quotationNumber");
CREATE INDEX "idx_quotation_status" ON "Quotation"("status");
CREATE INDEX "idx_quotation_customerId" ON "Quotation"("customerId");

CREATE TRIGGER set_timestamp_quotation
BEFORE UPDATE ON "Quotation"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 15. QUOTATION ITEMS
-- ------------------------------------------------------------------------------
CREATE TABLE "QuotationItem" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "quotationId" TEXT NOT NULL,
    "serviceId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'Set',
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "fk_quotationitem_quotation" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "idx_quotationitem_quotationId" ON "QuotationItem"("quotationId");

-- ------------------------------------------------------------------------------
-- 16. PAYMENTS & RECEIPTS
-- ------------------------------------------------------------------------------
CREATE TABLE "Payment" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "receiptNumber" TEXT NOT NULL UNIQUE,
    "bookingId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'UPI', -- CASH, BANK_TRANSFER, UPI, CARD, OTHER
    "paymentType" TEXT NOT NULL DEFAULT 'ADVANCE', -- ADVANCE, PARTIAL, FINAL_SETTLEMENT, REFUND
    "reference" TEXT,
    "paymentDate" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PAID', -- PAID, PENDING, REFUNDED
    "recordedByUserId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_payment_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_payment_customer" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_payment_recordedby" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "idx_payment_receiptNumber" ON "Payment"("receiptNumber");
CREATE INDEX "idx_payment_bookingId" ON "Payment"("bookingId");
CREATE INDEX "idx_payment_customerId" ON "Payment"("customerId");

CREATE TRIGGER set_timestamp_payment
BEFORE UPDATE ON "Payment"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 17. EXPENSES
-- ------------------------------------------------------------------------------
CREATE TABLE "Expense" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "expenseDate" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookingId" TEXT,
    "vendorId" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
    "receiptUrl" TEXT,
    "recordedByUserId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_expense_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fk_expense_vendor" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fk_expense_recordedby" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "idx_expense_bookingId" ON "Expense"("bookingId");
CREATE INDEX "idx_expense_category" ON "Expense"("category");
CREATE INDEX "idx_expense_expenseDate" ON "Expense"("expenseDate");

CREATE TRIGGER set_timestamp_expense
BEFORE UPDATE ON "Expense"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 18. NOTIFICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE "Notification" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ENQUIRY',
    "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "link" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_notification_isRead" ON "Notification"("isRead");
CREATE INDEX "idx_notification_createdAt" ON "Notification"("createdAt");

-- ------------------------------------------------------------------------------
-- 19. AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE "AuditLog" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_audit_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "idx_audit_entity" ON "AuditLog"("entity");
CREATE INDEX "idx_audit_userId" ON "AuditLog"("userId");
CREATE INDEX "idx_audit_createdAt" ON "AuditLog"("createdAt");

-- ------------------------------------------------------------------------------
-- 20. BUSINESS SETTINGS (Branding, Contact, GST, Invoicing Terms)
-- ------------------------------------------------------------------------------
CREATE TABLE "BusinessSettings" (
    "id" TEXT PRIMARY KEY DEFAULT 'default-settings',
    "businessName" TEXT NOT NULL DEFAULT 'Sathuragiri Decoration',
    "tagline" TEXT NOT NULL DEFAULT 'Every Celebration, Beautifully Crafted.',
    "logoUrl" TEXT,
    "phone" TEXT NOT NULL DEFAULT '+91 98421 87654',
    "alternatePhone" TEXT DEFAULT '+91 94432 10987',
    "whatsappNumber" TEXT NOT NULL DEFAULT '+919842187654',
    "email" TEXT NOT NULL DEFAULT 'contact@sathuragiridecoration.com',
    "address" TEXT NOT NULL DEFAULT 'Plot No. 45, Temple View Avenue, Near Ring Road',
    "city" TEXT NOT NULL DEFAULT 'Madurai',
    "state" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "pincode" TEXT NOT NULL DEFAULT '625009',
    "mapsEmbedUrl" TEXT DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125747.88722421375!2d78.04169722883301!3d9.92520074218841!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00c582b1189633%3A0xdc955b7264f63933!2sMadurai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    "primaryGold" TEXT NOT NULL DEFAULT '#B8955A',
    "gstNumber" TEXT DEFAULT '33AAHCS1234F1Z9',
    "advancePercentageDefault" INTEGER NOT NULL DEFAULT 30,
    "currencySymbol" TEXT NOT NULL DEFAULT '₹',
    "termsDefault" TEXT DEFAULT '1. 30% advance is required to confirm booking date.\n2. 50% payable 2 days prior to the event setup.\n3. 20% final balance payable on event day after completion.\n4. Customized flower arrangements must be finalized 7 days in advance.',
    "socialInstagram" TEXT DEFAULT 'https://instagram.com/sathuragiridecoration',
    "socialFacebook" TEXT DEFAULT 'https://facebook.com/sathuragiridecoration',
    "socialYoutube" TEXT DEFAULT 'https://youtube.com/@sathuragiridecoration',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_settings
BEFORE UPDATE ON "BusinessSettings"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- INITIAL SEED DATA (Admin, Staff, Services, Packages, Portfolio & Settings)
-- ==============================================================================

-- 1. Business Settings
INSERT INTO "BusinessSettings" (
    "id", "businessName", "tagline", "phone", "alternatePhone", "whatsappNumber",
    "email", "address", "city", "state", "pincode", "mapsEmbedUrl", "primaryGold",
    "gstNumber", "advancePercentageDefault", "currencySymbol", "termsDefault",
    "socialInstagram", "socialFacebook", "socialYoutube"
) VALUES (
    'default-settings',
    'Sathuragiri Decoration',
    'Every Celebration, Beautifully Crafted.',
    '+91 98421 87654',
    '+91 94432 10987',
    '+919842187654',
    'contact@sathuragiridecoration.com',
    'Plot No. 45, Temple View Avenue, Near Ring Road',
    'Madurai',
    'Tamil Nadu',
    '625009',
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125747.88722421375!2d78.04169722883301!3d9.92520074218841!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00c582b1189633%3A0xdc955b7264f63933!2sMadurai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    '#B8955A',
    '33AAHCS1234F1Z9',
    30,
    '₹',
    '1. 30% advance is required to confirm booking date.\n2. 50% payable 2 days prior to the event setup.\n3. 20% final balance payable on event day after completion.\n4. Customized flower arrangements must be finalized 7 days in advance.',
    'https://instagram.com/sathuragiridecoration',
    'https://facebook.com/sathuragiridecoration',
    'https://youtube.com/@sathuragiridecoration'
) ON CONFLICT ("id") DO UPDATE SET "businessName" = EXCLUDED."businessName";

-- 2. Initial Users (Admin / Owner, Manager, Staff)
-- Passwords:
-- Admin: Admin@12345
-- Manager: Manager@12345
-- Staff: Staff@12345
INSERT INTO "User" ("id", "email", "passwordHash", "name", "phone", "role", "isActive") VALUES
('usr-admin-001', 'admin@sathuragiridecoration.com', '$2a$10$naPYhx/JY1SNrmeR8JYGL.XnzIlopMtONAvxDbTnzJnba.vhloA5K', 'Muthukumar (Proprietor)', '+91 98421 87654', 'OWNER', TRUE),
('usr-mgr-002', 'manager@sathuragiridecoration.com', '$2a$10$yP60wmCEqHMDlDI7vszm/eown2g/zWHD.XmBZ4ZQGHLImJi041Xem', 'Saravanan R (Operations Manager)', '+91 94432 10987', 'MANAGER', TRUE),
('usr-stf-003', 'staff@sathuragiridecoration.com', '$2a$10$cm7rn254yVl1nqTZ9/unQOXnOfZQLBw26OoPgETQACtZctK/SRfYi', 'Ramesh Kumar (Lead Decorator)', '+91 97890 54321', 'STAFF', TRUE)
ON CONFLICT ("email") DO NOTHING;

-- 3. Staff Profiles
INSERT INTO "StaffProfile" ("id", "userId", "name", "phone", "email", "roleTitle", "skills", "availabilityStatus", "isActive") VALUES
('stf-001', 'usr-stf-003', 'Ramesh Kumar', '+91 97890 54321', 'staff@sathuragiridecoration.com', 'Senior Mandapam & Stage Decorator', 'Floral Arches, Traditional Temple Carvings, Fabric Draping, Canopy Setups', 'AVAILABLE', TRUE),
('stf-002', NULL, 'Ganesh Pandian', '+91 98765 11223', 'ganesh@sathuragiridecoration.com', 'Senior Lighting & Sound Engineer', 'Moving Heads, Par Cans, Truss Architecture, Ambient Mood Lighting', 'AVAILABLE', TRUE),
('stf-003', NULL, 'Meenakshi Sundaram', '+91 98765 44556', 'sundaram@sathuragiridecoration.com', 'Master Floral Stylist', 'Jasmine Garlands, Exotic Orchids, Marigold Wall Art, Lotus Mandapam', 'AVAILABLE', TRUE)
ON CONFLICT ("id") DO NOTHING;

-- 4. Vendors
INSERT INTO "Vendor" ("id", "businessName", "contactPerson", "phone", "email", "category", "servicesSupplied", "agreedRates", "notes", "isActive") VALUES
('vnd-001', 'Madurai Flower Mart & Fragrance', 'K. Senthil Nathan', '+91 94431 88776', 'senthilflowers@example.com', 'Flowers', 'Fresh Madurai Malli (Jasmine), Bangalore Roses, Orchids, Carnations, Lilies', 'Bulk market wholesale rate + 5% handling', 'Reliable supplier, morning delivery guaranteed by 5:00 AM', TRUE),
('vnd-002', 'Apex Audio-Visual & Trussing Solutions', 'Murugesh V', '+91 98402 33445', 'apexlights@example.com', 'Sound & Light', 'High-power LED Pars, Sharpies, Line Array Speakers, Smoke Machines', '₹25,000 per standard wedding stage setup', 'Includes 2 dedicated on-site technicians', TRUE),
('vnd-003', 'Sri Annapoorani Grand Feasts & Catering', 'Chef Ramanathan', '+91 98422 66778', 'annapooranifeasts@example.com', 'Catering', 'Authentic 24-dish Banana Leaf Feast, Live Chaat, Tandoor & Dessert Counters', '₹350 - ₹650 per leaf/plate depending on menu', 'Traditional cooks specialized in South Indian marriage menus', TRUE)
ON CONFLICT ("id") DO NOTHING;

-- 5. Service Categories
INSERT INTO "ServiceCategory" ("id", "name", "slug", "description", "image", "sortOrder", "isActive") VALUES
('cat-001', 'Marriage & Wedding Decoration', 'wedding-decoration', 'Grand South Indian Muhurtham Mandapams, temple theme setups, floral pillars, and sacred backdrop decor.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', 1, TRUE),
('cat-002', 'Reception Stage Decoration', 'reception-stages', 'Luxury backdrop concepts, floral walls, geometric arches, crystal chandeliers, and dynamic stage setups.', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80', 2, TRUE),
('cat-003', 'Engagement, Haldi & Sangeet', 'engagement-haldi-sangeet', 'Vibrant marigold photobooths, swing decorations, ring ceremony gazebos, and thematic pre-wedding decor.', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80', 3, TRUE),
('cat-004', 'Photography & Cinematic Films', 'photography-videography', 'Candid wedding photography, cinematic 4K highlight films, drone captures, and pre-wedding shoots.', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80', 4, TRUE),
('cat-005', 'Catering & Live Food Stalls', 'catering-food-stalls', 'Traditional South Indian banana leaf feasts, Chettinad specialties, live dosa stations, and chaat counters.', 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80', 5, TRUE),
('cat-006', 'Entrance & Welcome Archways', 'entrance-walkway-decoration', 'Grand royal gateway entrances, red carpet walkways, floral tunnels, and welcome board styling.', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80', 6, TRUE),
('cat-007', 'Corporate Events & Exhibition Stalls', 'corporate-exhibition-stalls', 'Professional expo booth fabrications, corporate summit stages, product launch backdrops, and trussing.', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80', 7, TRUE),
('cat-008', 'Birthday & Milestone Celebrations', 'birthday-anniversary-parties', 'Thematic balloon styling, 3D character cutouts, cake table backdrops, and lighting setups.', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 8, TRUE)
ON CONFLICT ("slug") DO NOTHING;

-- 6. Services
INSERT INTO "Service" (
    "id", "categoryId", "name", "slug", "shortDesc", "detailedDesc", "coverImage",
    "images", "startingPrice", "pricingMethod", "availableAddons", "isFeatured", "isActive", "sortOrder"
) VALUES
(
    'srv-001', 'cat-001',
    'Royal South Indian Muhurtham Mandapam', 'royal-muhurtham-mandapam',
    'Carved temple pillars, fresh Madurai Malli & rose hangings, lotus pond center, and traditional brass lamps.',
    'Our signature Muhurtham Mandapam is designed to bring the divine sanctity of South Indian temples into your wedding hall. Crafted with sculpted golden pillars, fresh fragrant Madurai jasmine, pink Bangalore roses, and golden brass kuthu vilakku lamps, it creates a breathtaking sacred sanctuary for your wedding rituals.',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80"]',
    65000, 'Starting price',
    '["Brass Urli with Floating Flowers & Diyas","Live Shehnai & Nadaswaram Stage Setup","Pooja Thali & Coconut Carving Styling"]',
    TRUE, TRUE, 1
),
(
    'srv-002', 'cat-002',
    'Grand Floral Dream Reception Stage', 'grand-floral-reception-stage',
    'Lush 40ft floral wall backdrop with crystal chandeliers, golden frames, warm ambient backlighting, and royal sofa.',
    'An opulent reception stage with 3D layers of fresh orchids, white hydrangeas, champagne roses, and warm fairy lights. Includes custom velvet/leatherette bride & groom royal throne sofa, carpeted stage riser, and programmable mood lighting.',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80"]',
    55000, 'Starting price',
    '["Dry Ice Smoke Effect for Couple Entry","Cold Fire / Pyro Sparklers Stage Blast","Personalized Acrylic Couple Name Monogram with Neon Glow"]',
    TRUE, TRUE, 2
),
(
    'srv-003', 'cat-003',
    'Vibrant Haldi & Mehndi Festive Setup', 'haldi-mehndi-festive-setup',
    'Bright marigold canopies, traditional painted jhoola (swing), colorful drapes, brass urli setup, and photo booths.',
    'Filled with joyful yellow and orange tones, our Haldi & Mehndi setup features genuine marigold flower strings, decorated wooden swings with bolster cushions, traditional umbrellas, brass water bowls, and vibrant rangoli accents.',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80"]',
    35000, 'Starting price',
    '["Fresh Flower Jewellery for Bride","Floral Rain (Pushpa Vrushti) Setup","Organic Haldi & Phoolon Ki Holi Kit"]',
    TRUE, TRUE, 3
),
(
    'srv-004', 'cat-004',
    'Cinematic Wedding Film & Candid Photography', 'cinematic-wedding-film-photography',
    '2 Candid Photographers + 2 Cinematographers, 4K Sony FX3 cameras, aerial drone footage, teaser trailer & luxury album.',
    'Capture every priceless emotion, stolen glance, and ritual in cinema-grade quality. Our team of senior wedding photographers and cinematographers bring artistic storytelling with color-graded highlights and hardbound handcrafted photobooks.',
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80"]',
    75000, 'Starting price',
    '["Pre-Wedding Outdoor Photoshoot at Scenic Location","Same-Day Edit Video Reel for Reception","Parent Duplicate Premium Albums (Set of 2)"]',
    TRUE, TRUE, 4
),
(
    'srv-005', 'cat-005',
    'Grand South Indian 24-Item Leaf Feast', 'grand-south-indian-leaf-feast',
    'Traditional banana leaf wedding feast with authentic delicacies, live ghee roast counters, payasam varieties, and warm hospitality.',
    'A culinary celebration fit for royalty. Prepared by master wedding chefs using cold-pressed oils, pure cow ghee, and hand-ground spices. Complete with uniformed serving staff, copper service vessels, and welcome drinks.',
    'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80"]',
    400, 'Per person',
    '["Live Tandoor & Chaat Stall","South Indian Filter Coffee & Tea Barista Stall","Ice Cream Sundae & Fresh Fruit Counter"]',
    TRUE, TRUE, 5
),
(
    'srv-006', 'cat-006',
    'Imperial Floral Tunnel & Gateway Entrance', 'imperial-floral-tunnel-entrance',
    'A majestic 60ft walk-through floral tunnel with hanging fairy lights, brass urlis, red carpet, and customized welcome signage.',
    'Make the first impression of your event an unforgettable royal entrance. Lush arches of fresh exotic flowers, gentle ambient lighting, aromatic floral hangings, and elegant couple welcome easel stand.',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80"]',
    38000, 'Starting price',
    '["Rose Petal Shower Machine at Entrance","Traditional Welcome Aarti Girls & Attire","Custom Neon Name Board with Floral Frame"]',
    FALSE, TRUE, 6
),
(
    'srv-007', 'cat-007',
    'Corporate Expo Stall & Summit Stage Setup', 'corporate-expo-stage-setup',
    'Modular exhibition stall fabrication, high-resolution LED backdrop walls, podium branding, and premium sound systems.',
    'Tailored for corporate product launches, annual conventions, and exhibitions. We provide German hangar tenting, octanorm booth setups, acrylic laser cut lettering, stage audio-visuals, and seamless on-site technical coordination.',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"]',
    45000, 'Starting price',
    '["P3 Outdoor / Indoor High-Def LED Wall","Corporate Delegate Gift Hamper Stalls","Photography & Live Webcasting Crew"]',
    FALSE, TRUE, 7
),
(
    'srv-008', 'cat-008',
    'Luxury Theme Birthday & Balloon Extravaganza', 'luxury-theme-birthday-decor',
    'Pastel organic balloon arches, customized 3D character cutouts, LED neon signage, dessert table styling, and mood lighting.',
    'Transform your baby’s first birthday or 50th golden jubilee into a magical wonderland. Complete with tailored themes (Jungle Safari, Royal Princess, Space Odyssey, Boho Chic), ring arches, marquee light numbers, and themed props.',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80"]',
    22000, 'Starting price',
    '["Magic Show & Mascot Entertainer","Cotton Candy & Popcorn Live Stall","Custom Balloon Burst Pinata"]',
    FALSE, TRUE, 8
)
ON CONFLICT ("slug") DO NOTHING;

-- 7. Event Packages
INSERT INTO "Package" (
    "id", "name", "slug", "description", "includedServices", "packagePrice",
    "pricingType", "optionalExtras", "terms", "isActive", "isFeatured", "sortOrder"
) VALUES
(
    'pkg-001', 'Silver Elegance Package', 'silver-elegance-package',
    'Ideal for intimate family engagements, betrothals, and traditional housewarming or birthday ceremonies.',
    '["20ft Floral Stage Backdrop with Fabric Draping","Couple Stage Chairs with Floral Accents","Entrance Archway with Marigold & Rose Styling","Standard Warm Halogen & LED Par Lighting Setup","Welcome Easel Board with Floral Bunch"]',
    65000, 'Starting price',
    '["Candid Photography Add-on","Live Mocktail Counter","Rose Petal Entry Pathway"]',
    'Setup complete 4 hours before event. 30% advance to book.',
    TRUE, FALSE, 1
),
(
    'pkg-002', 'Royal Gold Wedding Package', 'royal-gold-wedding-package',
    'Our most sought-after complete wedding package encompassing traditional Muhurtham Mandapam and Grand Reception Stage.',
    '["Authentic Carved Temple Muhurtham Mandapam with Fresh Jasmine & Rose Garland Hangings","Grand 35ft Reception Stage Floral Wall with Crystal Chandeliers & Warm Halo Glow","Royal Couple Throne Sofa + VIP Seating Linen","40ft Grand Floral Tunnel Entrance with Carpet","Intelligent Stage Lighting, Sharpies & Fog Machines","Brass Lamp (Kuthu Vilakku) & Urli Styling for Rituals"]',
    185000, 'Starting price',
    '["4K Drone & Cinematic Video Upgrade","Cold Fire Pyro Sparklers Entry","Live Filter Coffee & Chaat Corner"]',
    'Requires 30% advance on signing, 50% 2 days before event, balance on completion.',
    TRUE, TRUE, 2
),
(
    'pkg-003', 'Imperial Diamond Grand Wedding Experience', 'imperial-diamond-grand-wedding',
    'The pinnacle of luxury. Complete end-to-end wedding, reception, haldi, photography, and VIP hospitality.',
    '["Palatial Temple Mandapam with 100% Exotic Fresh Flora (Orchids, Carnations, Madurai Jasmine)","Magnificent 50ft Multilevel 3D Reception Stage with Hanging Floral Ceiling & Crystal Chandeliers","Full Venue Walkway, Dining Hall & VIP Lounge Thematic Décor","60ft Royal Archway Entrance with Water Fountains & Flame Torches","Complete 2-Day Photography & Cinematic 4K Drone Coverage (Teaser + 40-page Handcrafted Album)","Dry Ice Low Fog + 6-Unit Pyro Sparkler Blast for Grand Couple Walk-in","Full-Time Dedicated Event Coordinator & Technical Crew"]',
    375000, 'Starting price',
    '["Celebrity Anchor & Live Nadaswaram Troupe","Royal Vintage Car Bridal Entry","Customized LED Wall Backdrop with Visuals"]',
    'Dedicated event manager assigned. Advance booking minimum 3 weeks in advance recommended.',
    TRUE, TRUE, 3
),
(
    'pkg-004', 'Custom Bespoke Event Solution', 'custom-bespoke-event-solution',
    'Completely tailored to your vision, venue dimensions, and event type. You pick the exact elements.',
    '["Personalized 1-on-1 Consultation & 3D Stage Layout Mockup","Custom Mix of Floral, Lighting, Photography & Catering","Tailored Budget Options for Destination Weddings & Corporate Galas"]',
    NULL, 'Request a Quote',
    '["Custom Theme Architecture","Exhibition Booth Fabrication","Gourmet Catering Menu"]',
    'Tailored payment schedule based on agreed quotation.',
    TRUE, FALSE, 4
)
ON CONFLICT ("slug") DO NOTHING;

-- 8. Portfolio Projects
INSERT INTO "PortfolioProject" (
    "id", "title", "slug", "category", "description", "clientName", "location",
    "eventDate", "coverImage", "images", "isFeatured", "isPublished", "sortOrder"
) VALUES
(
    'port-001', 'The Royal Chettinad Palace Wedding - Karthik & Divya', 'chettinad-palace-wedding-karthik-divya',
    'Traditional Wedding',
    'A breathtaking traditional Tamil Brahmin wedding executed at the historic Chettinad heritage palace. Featuring an authentic hand-carved lotus mandapam draped with 120 kgs of pure Madurai jasmine and fragrant marigolds.',
    'Dr. Karthik & Dr. Divya', 'Heritage Palace Hall, Madurai',
    '2025-11-20T00:00:00Z',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80"]',
    TRUE, TRUE, 1
),
(
    'port-002', 'Starlit Crystal Grand Reception - Vignesh & Pooja', 'starlit-crystal-reception-vignesh-pooja',
    'Reception Stage',
    'A modern fairytale reception stage constructed with geometric golden pillars, 5000+ imported white orchids, tiered chandeliers, and dynamic warm amber backlighting for 1,500 guests.',
    'Vigneshwaran & Pooja', 'Grand Convention Center, Coimbatore',
    '2025-12-14T00:00:00Z',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80"]',
    TRUE, TRUE, 2
),
(
    'port-003', 'Golden Sunset Marigold Haldi & Sangeet - Arvind & Soundarya', 'sunset-marigold-haldi-arvind-soundarya',
    'Engagement & Haldi',
    'An energizing outdoor poolside Haldi celebration. Draped in sunshine yellow silk drapes, bespoke swings, brass water vessels with yellow petals, and personalized photo backdrops.',
    'Arvind & Soundarya', 'Riverview Resort, Tirunelveli',
    '2026-01-10T00:00:00Z',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80"]',
    TRUE, TRUE, 3
),
(
    'port-004', 'Zoho Regional Tech Summit & Expo 2026', 'zoho-regional-tech-summit-2026',
    'Corporate Events',
    'Complete AV and stage architecture for 800 delegates. Included 45ft high-definition LED curve wall, custom sponsor booth fabrications, registration zone styling, and professional gala dinner arrangement.',
    'Zoho Corporation Enterprise Partner Meet', 'Trade Centre Expo Hall, Madurai',
    '2026-02-05T00:00:00Z',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"]',
    FALSE, TRUE, 4
)
ON CONFLICT ("slug") DO NOTHING;

-- 9. Sample Customers
INSERT INTO "Customer" ("id", "name", "phone", "email", "address", "notes") VALUES
('cst-001', 'Karthik Rajan', '+91 98401 12233', 'karthik.rajan@example.com', '12, Anna Nagar Main Road, Madurai', 'VIP customer. Wants grand floral Muhurtham mandapam + cinematic video.'),
('cst-002', 'Soundarya Swaminathan', '+91 98765 43211', 'soundarya.s@example.com', '45, West Masi Street, Madurai', 'Interested in Royal Gold Wedding Package for November.'),
('cst-003', 'Annamalai Chettiar', '+91 94433 22110', 'annamalai.c@example.com', '88, Palace Road, Karaikudi', 'Looking for 3-day wedding celebration decor & catering coordination.')
ON CONFLICT ("phone") DO NOTHING;

-- 10. Sample Enquiries
INSERT INTO "Enquiry" (
    "id", "reference", "customerId", "eventType", "eventTitle", "eventDate", "endDate",
    "venueName", "venueAddress", "venueCity", "guestCount", "isOutdoor", "selectedServiceIds",
    "budgetRange", "preferredContactMethod", "consultationTime", "additionalNotes", "status", "assignedToUserId"
) VALUES
(
    'enq-001', 'ENQ-2026-0001', 'cst-001',
    'Wedding & Reception', 'Karthik & Divya Marriage Celebration',
    '2026-11-15T09:00:00Z', '2026-11-16T14:00:00Z',
    'Meenakshi Sundareswarar Thirumana Mahal', 'Kamarajar Salai, Madurai', 'Madurai',
    1200, FALSE, '["srv-001","srv-002","srv-004"]',
    '₹2,50,000 - ₹5,00,000', 'WhatsApp', 'Evening (5 PM - 8 PM)',
    'Need jasmine flower canopy for bride walk-in and stage cold fire entry.',
    'CONVERTED', 'usr-admin-001'
),
(
    'enq-002', 'ENQ-2026-0002', 'cst-002',
    'Engagement & Haldi', 'Soundarya & Arvind Ring Ceremony',
    '2026-12-05T10:00:00Z', NULL,
    'Heritage Madurai Resort Lawn', 'Kochadai, Madurai', 'Madurai',
    350, TRUE, '["srv-003","srv-006"]',
    '₹1,00,000 - ₹2,50,000', 'Phone', 'Morning (10 AM - 1 PM)',
    'Lawn event, need waterproof marquee draping and yellow marigold decor.',
    'CONSULTATION_SCHEDULED', 'usr-mgr-002'
),
(
    'enq-003', 'ENQ-2026-0003', 'cst-003',
    'Traditional Marriage', 'Chettiar Family Grand Marriage',
    '2026-12-28T06:00:00Z', NULL,
    'MJM Grand Convention Hall', 'Bypass Road, Dindigul', 'Dindigul',
    2000, FALSE, '["srv-001","srv-002","srv-005"]',
    '₹5,00,000+', 'Phone', 'Anytime',
    'Requires complete mandapam, 24-dish leaf catering coordination, and photography.',
    'NEW', NULL
)
ON CONFLICT ("reference") DO NOTHING;

-- 11. Sample Bookings
INSERT INTO "Booking" (
    "id", "reference", "customerId", "enquiryId", "eventName", "eventType",
    "startDate", "endDate", "venueName", "venueAddress", "venueCity", "guestCount",
    "status", "totalAmount", "discountAmount", "taxAmount", "finalAmount",
    "internalNotes", "termsAndConditions"
) VALUES
(
    'bkg-001', 'BKG-2026-0001', 'cst-001', 'enq-001',
    'Karthik & Divya Royal Wedding & Reception', 'Wedding & Reception',
    '2026-11-15T06:00:00Z', '2026-11-16T15:00:00Z',
    'Meenakshi Sundareswarar Thirumana Mahal', 'Kamarajar Salai, Madurai', 'Madurai',
    1200, 'CONFIRMED', 210000, 10000, 36000, 236000,
    'VIP event. Setup team to arrive on 14th evening 7 PM. Madurai Malli fresh stock confirmed from vendor.',
    '30% advance received. 50% on Nov 13. Balance on event completion.'
)
ON CONFLICT ("reference") DO NOTHING;

-- 12. Booking Services Breakdown
INSERT INTO "BookingService" ("id", "bookingId", "serviceId", "serviceName", "quantity", "unitPrice", "notes") VALUES
('bsrv-001', 'bkg-001', 'srv-001', 'Royal South Indian Muhurtham Mandapam', 1, 75000, 'Temple pillar carving design with genuine Madurai jasmine strings'),
('bsrv-002', 'bkg-001', 'srv-002', 'Grand Floral Dream Reception Stage', 1, 65000, '40ft Floral wall with dual color ambient wash and royal white sofa'),
('bsrv-003', 'bkg-001', 'srv-004', 'Cinematic Wedding Film & Candid Photography', 1, 70000, 'Full 2-day coverage including drone & 40-page album')
ON CONFLICT ("id") DO NOTHING;

-- 13. Quotation
INSERT INTO "Quotation" (
    "id", "quotationNumber", "version", "customerId", "bookingId", "enquiryId",
    "validUntil", "subtotal", "discount", "taxRate", "taxAmount", "grandTotal",
    "status", "terms", "paymentSchedule"
) VALUES
(
    'qtn-001', 'QTN-2026-0001', 1, 'cst-001', 'bkg-001', 'enq-001',
    '2026-11-01T00:00:00Z', 210000, 10000, 18, 36000, 236000,
    'ACCEPTED',
    '1. Valid until date mentioned.\n2. Flower varieties subject to seasonal availability.\n3. Generator backup to be arranged by venue or charged extra.',
    '30% Advance (₹70,800) | 50% Before Event (₹1,18,000) | 20% Final Settlement (₹47,200)'
)
ON CONFLICT ("quotationNumber") DO NOTHING;

-- 14. Quotation Items
INSERT INTO "QuotationItem" ("id", "quotationId", "serviceId", "name", "description", "quantity", "unit", "unitPrice", "discount", "total") VALUES
('qitem-001', 'qtn-001', 'srv-001', 'Royal South Indian Muhurtham Mandapam', 'Mandapam structure + fresh floral hangings + brass urlis & lamps', 1, 'Set', 75000, 0, 75000),
('qitem-002', 'qtn-001', 'srv-002', 'Grand Floral Dream Reception Stage', '40ft x 14ft floral wall with crystal chandeliers & couple couch', 1, 'Set', 65000, 5000, 60000),
('qitem-003', 'qtn-001', 'srv-004', 'Cinematic Wedding Film & Candid Photography', '2 Photographers + 2 Cinematographers with Drone coverage', 1, 'Package', 70000, 5000, 65000)
ON CONFLICT ("id") DO NOTHING;

-- 15. Sample Payments
INSERT INTO "Payment" (
    "id", "receiptNumber", "bookingId", "customerId", "amount", "paymentMethod",
    "paymentType", "reference", "paymentDate", "notes", "status", "recordedByUserId"
) VALUES
(
    'pay-001', 'RCT-2026-0001', 'bkg-001', 'cst-001', 70800, 'UPI',
    'ADVANCE', 'UPI/20261009/489102948', CURRENT_TIMESTAMP,
    '30% booking advance confirmation received through GooglePay', 'PAID', 'usr-admin-001'
)
ON CONFLICT ("receiptNumber") DO NOTHING;

-- 16. Notifications
INSERT INTO "Notification" ("id", "title", "message", "type", "isRead", "link") VALUES
('notif-001', 'New Wedding Booking Confirmed', 'Karthik & Divya Royal Wedding (BKG-2026-0001) confirmed with ₹70,800 advance.', 'BOOKING', FALSE, '/admin/bookings'),
('notif-002', 'Upcoming Consultation', 'Heritage Madurai Lawn site visit scheduled for Soundarya Swaminathan.', 'FOLLOWUP', FALSE, '/admin/enquiries')
ON CONFLICT ("id") DO NOTHING;

-- ==============================================================================
-- SCHEMA & SEED COMPLETED SUCCESSFULLY!
-- ==============================================================================
