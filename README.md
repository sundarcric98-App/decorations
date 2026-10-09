# 🌸 Sathuragiri Decoration — Event Management & Wedding Planning Platform

> *"Every Celebration, Beautifully Crafted."*

A modern, full-stack, enterprise-grade **Event Decoration, Wedding Planning & Event Services Management Web Application** designed specifically for **Sathuragiri Decoration**.

---

## 🌟 Key Features

### 🏛️ 1. Luxury Public Website
- **Brand Aesthetic**: Warm Ivory (`#FAF7F2`), Champagne Gold (`#B8955A`), Deep Charcoal (`#24211F`), elegant serif typography paired with Plus Jakarta Sans.
- **Interactive Service Catalogue**: Mandapams, reception stages, pre-wedding photography, South Indian leaf feast catering, lighting truss, pandal setups, and live food stalls.
- **Dynamic Pricing Packages**: Silver, Royal Gold, Imperial Diamond, and Custom packages with live inclusions and add-on selectors.
- **Visual Portfolio Showcase**: Lightbox gallery, category filter, and venue highlights.
- **4-Step Booking Wizard**: Customer info, event details, service/package picker, budget & instant reference generation with celebration effects.
- **Direct Floating WhatsApp Contact**: Instant chat redirect using configured business phone.

### 🛡️ 2. Secure Admin Management ERP
- **Dashboard & Executive Analytics**: Real-time KPI tiles, Recharts monthly revenue vs expense trajectories, booking status distribution, and recent feeds.
- **Enquiries Pipeline**: Filter by date, source, budget, status. Add internal notes, set follow-up reminders, and convert leads into bookings atomically.
- **Bookings & Event Operations**: Availability conflict warnings, financial status ribbons, multiple service line items, and crew & vendor dispatching.
- **Quotation Builder & PDF Engine**: Server-calculated item totals, discount percentages, 18% GST calculation, quotation versioning, and instant **downloadable PDF quotations**.
- **Payment Tracking & Receipts**: Record advance, partial, and settlement payments, calculate live outstanding balances, and generate **downloadable PDF receipts**.
- **Interactive Auspicious Event Calendar**: Monthly grid matrix, date overlap alerts, and day-by-day operational schedule panels.
- **Customer CRM**: 360-degree customer profile with complete booking, quotation, payment, and inquiry records.
- **Artisan Crew & Vendor Logistics**: Roster management with skills tags, availability statuses, and confidential vendor rates.
- **Expense Journal & Margin Calculation**: Categorized material and wage logging with automatic event profit estimation.
- **Formula-Injection-Safe CSV Export**: Export audit-ready CSV reports for Bookings, Payments, and Expenses with spreadsheet formula sanitization.
- **Business & Branding Settings**: Real-time management of company name, tagline, WhatsApp number, GSTIN, default advance percentage, and legal terms.

---

## 🚀 Quick Start & Local Execution

### 1. Prerequisites
- **Node.js** v18+ or v20+
- **npm** v9+

### 2. Installation
Run the root install command to install dependencies for root, client, and server:
```bash
npm run install:all
```

### 3. Database Setup (Zero-Config SQLite Ready)
Push the Prisma schema and seed the database with authentic South Indian wedding themes, services, packages, and credentials:
```bash
npm run db:setup
```

### 4. Start Both Services Concurrently
```bash
npm run dev
```
- **Public Website & Admin Portal**: `http://localhost:5173`
- **Backend Express REST API**: `http://localhost:5000` (Versioned at `/api/v1`)
- **API Health Check**: `http://localhost:5000/health`

---

## 🔑 Default Seed Accounts

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Owner / Admin** | `admin@sathuragiridecoration.com` | `Admin@12345` | Full business management, settings, deletions |
| **Manager** | `manager@sathuragiridecoration.com` | `Manager@12345` | Daily bookings, quotations, assignments, customer CRM |
| **Staff** | `staff@sathuragiridecoration.com` | `Staff@12345` | Event schedules, task views, service catalogues |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, React Router 6, Tailwind CSS, Lucide React, TanStack Query, Recharts, React Confetti.
- **Backend**: Node.js, Express.js, JWT Authentication (HttpOnly cookies + Bearer token), bcryptjs, Zod validation, Helmet security, Express Rate Limit, jsPDF & AutoTable.
- **Database**: Prisma ORM (SQLite for zero-config local dev / PostgreSQL for production).
- **Testing**: Vitest & Supertest.

---

## 🧪 Running Automated Tests

```bash
cd server
npm test
```
All 11 critical integration and unit test suites will execute and verify API security, lead generation, and CSV injection protection.

---

## 📂 Project Structure

```
decoration/
├── client/                      # React + Vite Frontend
│   ├── src/
│   │   ├── components/          # Common & Admin shared components
│   │   ├── context/             # AuthContext, SettingsContext, ToastContext
│   │   ├── features/
│   │   │   ├── public/          # Home, Services, Packages, Portfolio, Booking Wizard
│   │   │   ├── auth/            # Login, Forgot Password, Reset Password
│   │   │   └── admin/           # Dashboard, Enquiries, Bookings, Quotes, Payments, Calendar, etc.
│   │   ├── lib/                 # Axios API client, formatting utilities
│   │   └── types/               # TypeScript domain interfaces
├── server/                      # Node.js + Express Backend
│   ├── prisma/                  # schema.prisma, seed.ts, migrations
│   └── src/
│       ├── middleware/          # JWT auth, RBAC, error handler, rate limiters
│       ├── modules/             # 18 Modular feature controllers, services, schemas
│       ├── utils/               # PDF generators, CSV sanitizers, response formatters
│       └── __tests__/           # Vitest test suite
├── docs/                        # Architecture, API Reference, Deployment Guide
├── package.json                 # Unified development scripts
└── README.md
```

---

© 2026 **Sathuragiri Decoration**. All rights reserved.
