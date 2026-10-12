# 🌸 Sathuragiri Decoration — Portfolio & WhatsApp Enquiry Web Application

> *"Every Celebration, Beautifully Crafted."*

A modern, full-stack, production-ready portfolio and enquiry website designed specifically for **Sathuragiri Decoration**. 
Powered by **React**, **Express.js**, **Supabase PostgreSQL**, **Supabase Storage**, and **Vercel Serverless Functions**.

---

## 🌟 Key Features

### 🏛️ 1. Luxury Public Website
- **Brand Aesthetic**: Warm Ivory (`#FAF7F2`), Champagne Gold (`#B8955A`), Deep Charcoal (`#28231F`), and clean modern typography.
- **Dynamic Event Categories**: Wedding, Reception, Engagement, Birthday, Baby Shower, Traditional Functions, Photoshoots, Catering, and Event Stalls — loaded directly from Supabase.
- **Visual Portfolio & Multi-Image Gallery**:
  - Filterable by active categories with URL slug support.
  - Multi-photo project showcase with cover image selection.
  - Interactive modal lightbox for full-resolution photograph viewing.
  - Fast responsive image grids with empty state handling.
- **WhatsApp Enquiry System (Primary Contact Channel)**:
  - Global floating WhatsApp enquiry button with configurable business phone number.
  - Dynamic enquiry messages auto-composed based on current page:
    - *General Homepage:* `"Hello Sathuragiri Decoration, I would like to enquire about your event decoration services. Please share more details."`
    - *Category:* `"Hello Sathuragiri Decoration, I am interested in your [Category Name] services. Please share packages and details."`
    - *Specific Project:* `"Hello Sathuragiri Decoration, I saw your project '[Project Title]' ([Category Name]). I would like to enquire about similar decoration services for my upcoming event. Please share details and availability."`
    - *Custom Contact Planner:* Form dynamically formats event date, venue/city, category, and specific requirements into a clean WhatsApp message.
  - Direct links formatted as `https://wa.me/COUNTRYCODEPHONENUMBER?text=URL_ENCODED_MESSAGE`.
- **Dynamic About Us & Contact Pages**: Business details, address, Google Maps link, social media links, and about statement loaded dynamically from Supabase `site_settings`.

### 🛡️ 2. Secure Administrator Dashboard (`/admin`)
- **Admin Authentication**:
  - Secure login backed by Supabase Auth (`auth.users`) and verified against `public.admins`.
  - Protected API endpoints validate session tokens via middleware.
  - No service-role keys or privileged credentials exposed to the frontend.
- **Executive Dashboard Stats**: Live metrics queried in real time from Supabase (`Total Projects`, `Published Projects`, `Draft Projects`, `Active Event Categories`).
- **Category Management**:
  - Add, edit, reorder, activate, and deactivate categories.
  - Upload category cover images to Supabase Storage.
  - Safe deletion: prevents deleting categories currently referenced by projects.
- **Portfolio Management**:
  - Create and edit decoration projects with title, slug, description, event date, and location.
  - Upload multiple photographs directly to Supabase Storage (`decoration-images` bucket).
  - Select cover photograph, assign image order, and remove individual photos.
  - Toggle between `draft` and `published` status.
- **Business Settings Management**:
  - Update business name, tagline, WhatsApp enquiry number, phone number, email, address, About statement, Instagram, Facebook, and footer text in real-time.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, React Router 6, Tailwind CSS, Lucide React.
- **Backend API**: Node.js, Express.js, Supabase JS Client (`@supabase/supabase-js`), Multer (in-memory streaming to Supabase Storage).
- **Database & Storage**: Supabase PostgreSQL with Row Level Security (RLS) and Supabase Storage (`decoration-images` bucket).
- **Deployment**: Vercel (Frontend SPA + Serverless Express Function bundle in `api/index.js`).
- **Testing**: Vitest & Supertest with automated API test suites.

---

## 🗄️ Database Architecture (`schema.sql`)

The database is built on PostgreSQL inside Supabase and is defined in [`schema.sql`](file:///c:/React%20Project/decoration/schema.sql) and [`supabase/schema.sql`](file:///c:/React%20Project/decoration/supabase/schema.sql).

### Tables Overview:
1. **`admins`**: Linked to `auth.users(id)` via UUID. Stores `display_name`, `role`, and `is_active`.
2. **`event_categories`**: `id`, `name`, `slug`, `description`, `cover_image_url`, `display_order`, `is_active`, `created_at`, `updated_at`.
3. **`portfolio_projects`**: `id`, `category_id` (FK), `title`, `slug`, `description`, `event_date`, `location`, `cover_image_url`, `status` (`'draft'` or `'published'`), `display_order`, `created_at`, `updated_at`.
4. **`portfolio_images`**: `id`, `project_id` (FK on delete cascade), `image_url`, `storage_path`, `alt_text`, `display_order`, `created_at`.
5. **`site_settings`**: `id`, `setting_key` (unique), `setting_value`, `updated_at`.

### Security & Policies:
- **Row Level Security (RLS)** is enabled on all tables.
- **Public Website Access**: Unauthenticated visitors have read-only access strictly to `is_active = true` categories and `status = 'published'` projects.
- **Admin Access**: Mutations (INSERT, UPDATE, DELETE) are strictly permitted for authenticated users registered in `public.admins` with `is_active = true`.
- **Storage Bucket**: The `decoration-images` bucket is configured for public reads and authenticated admin writes.

---

## 🚀 Supabase Setup Instructions

1. **Create or Open Supabase Project**:
   - Go to [database.new](https://database.new) or sign in to [supabase.com](https://supabase.com).
   - Create a new project (e.g., `sathuragiri-decoration`).
2. **Execute Database Schema**:
   - In your Supabase dashboard, open the **SQL Editor** from the left navigation.
   - Click **New Query**, copy the contents of [`schema.sql`](file:///c:/React%20Project/decoration/schema.sql), paste into the editor, and click **Run**.
   - This creates all 5 tables, triggers, indexes, RLS policies, storage bucket policies, and seeds all initial categories, projects, and site settings.
3. **Configure Storage Bucket**:
   - Verify under **Storage** > **Buckets** that `decoration-images` exists and is marked **Public**.
4. **Create the Initial Administrator**:
   - Run the provided administrator seed script:
     ```bash
     node scripts/seed-admin.cjs
     ```
   - Default Administrator Credentials:
     - **Email:** `admin@sathuragiridecoration.com`
     - **Password:** `Admin@12345`

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root (or configure `server/.env` and `client/.env`):
```bash
cp .env.example .env
```
Ensure your `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are populated.

### 3. Run Frontend & Backend Concurrently
```bash
npm run dev
```
- **Public Website & Admin Portal:** `http://localhost:5173`
- **Express Backend API:** `http://localhost:5000` (Endpoints mounted on `/api` and `/api/v1`)
- **API Health Check:** `http://localhost:5000/health`

### 4. Run Automated Test Suite
```bash
npm test --prefix server
```

---

## ☁️ Vercel Deployment Instructions

The project is structured to deploy smoothly on **Vercel** as a single combined deployment or separate frontend/backend deployments.

### Monorepo Vercel Configuration:
- **Build Command:** `npm run build` (Builds server TypeScript, builds client Vite assets, and bundles the Express API into `api/index.js` using esbuild).
- **Output Directory:** `client/dist`
- **Routing Configuration (`vercel.json`):**
  - `/api/(.*)` rewrites to the serverless function `/api/index.js`.
  - Non-API routes rewrite to `/index.html` for React Router SPA deep linking.

### Vercel Environment Variables:
Set the following environment variables in your Vercel Project Settings:

| Variable Name | Scope | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend & Function | Your Supabase project URL (`https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Frontend & Function | Your Supabase anonymous public key |
| `SUPABASE_URL` | Serverless Function | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Serverless Function | Your Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Serverless Function | Your Supabase service role key (Never expose to frontend!) |
| `NODE_ENV` | Serverless Function | Set to `production` |
| `CLIENT_URL` | Serverless Function | Your production Vercel domain (`https://sathuragiri-decoration.vercel.app`) |

---

## 📋 Removed / Simplified Legacy Features

In accordance with the project requirements, the following complex event management and ERP features were removed to keep the application lightweight, secure, and focused on decoration portfolio showcase and WhatsApp customer acquisition:

- ❌ Customer accounts, registration, and customer dashboards
- ❌ Online checkout, shopping cart, and payment gateway integration
- ❌ Quotation generator, PDF invoicing, and financial payment receipts
- ❌ Staff roster, attendance, and vendor expense tracking
- ❌ Event calendar scheduling and conflict management
- ❌ Customer CRM tables, notes, and lead conversion pipelines
- ❌ Complex multi-step online booking workflows

---

## 📞 Business Information & WhatsApp Enquiry

- **Business Name:** Sathuragiri Decoration
- **Tagline:** Every Celebration, Beautifully Crafted.
- **Services:** Wedding, Reception, Engagement, Birthday, Baby Shower, Stage & Mandapams, Photoshoots, Catering, and Event Stalls.
- **WhatsApp Format:** `https://wa.me/919876543210?text=...`

---

© 2026 **Sathuragiri Decoration**. All rights reserved.
