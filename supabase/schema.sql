-- ==============================================================================
-- SATHURAGIRI DECORATION — SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Tagline: Every Celebration, Beautifully Crafted.
-- ==============================================================================
-- INSTRUCTIONS FOR FRESH SUPABASE SETUP:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard).
-- 2. Navigate to "SQL Editor" on the left navigation menu.
-- 3. Click "New query", paste the entire contents of this file, and click "Run".
-- 4. To enable image uploads, ensure the "decoration-images" storage bucket exists
--    (automatically created in section 7 of this script).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS & UTILITIES
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically update "updated_at" timestamps on row modification
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. TABLE: admins
-- Administrator profiles linked to auth.users (Supabase Auth).
-- Passwords are never stored here; Supabase Auth securely manages credentials.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('ADMIN', 'OWNER')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admins_role ON public.admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON public.admins(is_active);

DROP TRIGGER IF EXISTS trigger_admins_updated_at ON public.admins;
CREATE TRIGGER trigger_admins_updated_at
    BEFORE UPDATE ON public.admins
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 3. TABLE: event_categories
-- Categories of decoration & event services (Wedding, Reception, Birthday, etc.)
-- Only active categories appear on the public website.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    cover_image_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_event_categories_slug ON public.event_categories(slug);
CREATE INDEX IF NOT EXISTS idx_event_categories_active ON public.event_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_event_categories_order ON public.event_categories(display_order);

DROP TRIGGER IF EXISTS trigger_event_categories_updated_at ON public.event_categories;
CREATE TRIGGER trigger_event_categories_updated_at
    BEFORE UPDATE ON public.event_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4. TABLE: portfolio_projects
-- Completed decoration showcase projects.
-- Foreign-key constraint protects against accidental deletion of referenced categories.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.event_categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    event_date DATE,
    location TEXT,
    cover_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portfolio_projects_slug ON public.portfolio_projects(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_category ON public.portfolio_projects(category_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_status ON public.portfolio_projects(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_order ON public.portfolio_projects(display_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_date ON public.portfolio_projects(event_date DESC NULLS LAST);

DROP TRIGGER IF EXISTS trigger_portfolio_projects_updated_at ON public.portfolio_projects;
CREATE TRIGGER trigger_portfolio_projects_updated_at
    BEFORE UPDATE ON public.portfolio_projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. TABLE: portfolio_images
-- Multiple photographs belonging to each decoration project.
-- Cascades on project deletion so orphan rows are never left behind.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT,
    alt_text TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portfolio_images_project ON public.portfolio_images(project_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_order ON public.portfolio_images(display_order);

-- ------------------------------------------------------------------------------
-- 6. TABLE: site_settings
-- Key-value store for business information (WhatsApp, phone, address, socials).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(setting_key);

DROP TRIGGER IF EXISTS trigger_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trigger_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 7. SUPABASE STORAGE BUCKET: decoration-images
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('decoration-images', 'decoration-images', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is an active admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins
        WHERE id = auth.uid()
          AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- Policy: admins ---
DROP POLICY IF EXISTS "Admins can view own profile" ON public.admins;
CREATE POLICY "Admins can view own profile"
    ON public.admins FOR SELECT
    TO authenticated
    USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update own profile" ON public.admins;
CREATE POLICY "Admins can update own profile"
    ON public.admins FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- --- Policy: event_categories ---
-- Public can view active categories only
DROP POLICY IF EXISTS "Public can view active categories" ON public.event_categories;
CREATE POLICY "Public can view active categories"
    ON public.event_categories FOR SELECT
    USING (is_active = TRUE);

-- Admins can view all categories (including inactive)
DROP POLICY IF EXISTS "Admins can view all categories" ON public.event_categories;
CREATE POLICY "Admins can view all categories"
    ON public.event_categories FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Admins can insert, update, delete categories
DROP POLICY IF EXISTS "Admins can insert categories" ON public.event_categories;
CREATE POLICY "Admins can insert categories"
    ON public.event_categories FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON public.event_categories;
CREATE POLICY "Admins can update categories"
    ON public.event_categories FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete categories" ON public.event_categories;
CREATE POLICY "Admins can delete categories"
    ON public.event_categories FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- --- Policy: portfolio_projects ---
-- Public can view published projects that belong to active categories
DROP POLICY IF EXISTS "Public can view published projects" ON public.portfolio_projects;
CREATE POLICY "Public can view published projects"
    ON public.portfolio_projects FOR SELECT
    USING (
        status = 'published' AND
        EXISTS (
            SELECT 1 FROM public.event_categories
            WHERE event_categories.id = portfolio_projects.category_id
              AND event_categories.is_active = TRUE
        )
    );

-- Admins can view all projects
DROP POLICY IF EXISTS "Admins can view all projects" ON public.portfolio_projects;
CREATE POLICY "Admins can view all projects"
    ON public.portfolio_projects FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Admins can insert, update, delete projects
DROP POLICY IF EXISTS "Admins can insert projects" ON public.portfolio_projects;
CREATE POLICY "Admins can insert projects"
    ON public.portfolio_projects FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update projects" ON public.portfolio_projects;
CREATE POLICY "Admins can update projects"
    ON public.portfolio_projects FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete projects" ON public.portfolio_projects;
CREATE POLICY "Admins can delete projects"
    ON public.portfolio_projects FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- --- Policy: portfolio_images ---
-- Public can view images of published projects
DROP POLICY IF EXISTS "Public can view images of published projects" ON public.portfolio_images;
CREATE POLICY "Public can view images of published projects"
    ON public.portfolio_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolio_projects
            WHERE portfolio_projects.id = portfolio_images.project_id
              AND portfolio_projects.status = 'published'
        )
    );

-- Admins can view all images
DROP POLICY IF EXISTS "Admins can view all images" ON public.portfolio_images;
CREATE POLICY "Admins can view all images"
    ON public.portfolio_images FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Admins can insert, update, delete images
DROP POLICY IF EXISTS "Admins can insert images" ON public.portfolio_images;
CREATE POLICY "Admins can insert images"
    ON public.portfolio_images FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update images" ON public.portfolio_images;
CREATE POLICY "Admins can update images"
    ON public.portfolio_images FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete images" ON public.portfolio_images;
CREATE POLICY "Admins can delete images"
    ON public.portfolio_images FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- --- Policy: site_settings ---
-- Public can view non-secret settings
DROP POLICY IF EXISTS "Public can view settings" ON public.site_settings;
CREATE POLICY "Public can view settings"
    ON public.site_settings FOR SELECT
    USING (setting_key NOT LIKE 'secret_%');

-- Admins can view, insert, update settings
DROP POLICY IF EXISTS "Admins can view all settings" ON public.site_settings;
CREATE POLICY "Admins can view all settings"
    ON public.site_settings FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert settings" ON public.site_settings;
CREATE POLICY "Admins can insert settings"
    ON public.site_settings FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update settings" ON public.site_settings;
CREATE POLICY "Admins can update settings"
    ON public.site_settings FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- --- Storage policies on storage.objects ---
DROP POLICY IF EXISTS "Public read storage images" ON storage.objects;
CREATE POLICY "Public read storage images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'decoration-images');

DROP POLICY IF EXISTS "Admins upload storage images" ON storage.objects;
DROP POLICY IF EXISTS "Allow decoration-images uploads" ON storage.objects;
CREATE POLICY "Allow decoration-images uploads"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'decoration-images');

DROP POLICY IF EXISTS "Admins update storage images" ON storage.objects;
DROP POLICY IF EXISTS "Allow decoration-images updates" ON storage.objects;
CREATE POLICY "Allow decoration-images updates"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'decoration-images');

DROP POLICY IF EXISTS "Admins delete storage images" ON storage.objects;
DROP POLICY IF EXISTS "Allow decoration-images deletes" ON storage.objects;
CREATE POLICY "Allow decoration-images deletes"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'decoration-images');

-- ------------------------------------------------------------------------------
-- 9. AUTH TRIGGER: Auto-create admin profile on Supabase auth.users signup/insert
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.admins (id, display_name, role, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        'ADMIN',
        TRUE
    )
    ON CONFLICT (id) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();

-- ------------------------------------------------------------------------------
-- 10. SEED DATA: BUSINESS SETTINGS
-- ------------------------------------------------------------------------------
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES
    ('business_name', 'Sathuragiri Decoration'),
    ('tagline', 'Every Celebration, Beautifully Crafted.'),
    ('logo_url', '/Decoration_Logo.png'),
    ('whatsapp_number', '918903575802'),
    ('whatsapp_number_secondary', '919842322624'),
    ('phone', '+91 89035 75802, +91 98423 22624'),
    ('email', 'contact@sathuragiridecoration.com'),
    ('address', 'Usilai Road, Peraiyur - 625703, Madurai District, Tamil Nadu'),
    ('about_text', 'At Sathuragiri Decoration, we transform your most cherished milestones into timeless memories. Rooted in traditional South Indian heritage and elevated with contemporary luxury design, our master artisans create breathtaking wedding mandaps, opulent reception stages, joyous birthday backdrops, and auspicious family celebrations. Every floral garland, pillar, and illumination is meticulously crafted with devotion to perfection.'),
    ('instagram_url', 'https://instagram.com/sathuragiridecoration'),
    ('facebook_url', 'https://facebook.com/sathuragiridecoration'),
    ('youtube_url', 'https://youtube.com/@sathuragiridecoration'),
    ('footer_text', '© 2026 Sathuragiri Decoration. Every Celebration, Beautifully Crafted. All rights reserved.')
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value,
    updated_at = CURRENT_TIMESTAMP;

-- ------------------------------------------------------------------------------
-- 11. SEED DATA: REQUIRED 9 EVENT CATEGORIES
-- ------------------------------------------------------------------------------
INSERT INTO public.event_categories (id, name, slug, description, cover_image_url, display_order, is_active)
VALUES
    (
        '11111111-1111-1111-1111-111111111101',
        'Wedding Decoration',
        'wedding-decoration',
        'Opulent South Indian wedding mandapams, sacred stage canopies, traditional brass vilakku styling, and cascading fresh floral arches.',
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        1,
        TRUE
    ),
    (
        '11111111-1111-1111-1111-111111111102',
        'Reception Decoration',
        'reception-decoration',
        'Regal reception stage backdrops, contemporary crystal chandeliers, dynamic ambient lighting, and bespoke royal styling.',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
        2,
        TRUE
    ),
    (
        '11111111-1111-1111-1111-111111111103',
        'Engagement',
        'engagement',
        'Romantic pastel ring-ceremony stages, floral halos, customized couple monograms, and intimate banquet decor.',
        'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
        3,
        TRUE
    ),
    (
        '11111111-1111-1111-1111-111111111104',
        'Birthday Celebration',
        'birthday-celebration',
        'Thematic birthday decors, luxury organic balloon garlands, 3D neon backdrops, and joyous milestone arrangements for all ages.',
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
        4,
        TRUE
    ),
    (
        '11111111-1111-1111-1111-111111111105',
        'Baby Shower',
        'baby-shower',
        'Auspicious Seemantham & Valakaappu traditional swing setups, fresh lotus floral walls, cradle decorations, and pastel themes.',
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
        5,
        TRUE
    ),
    (
        '11111111-1111-1111-1111-111111111106',
        'Traditional Functions',
        'traditional-functions',
        'Traditional House Warming (Grihapravesam), Ear Piercing (Kaadhu Kuthu), Puberty Ceremonies, and temple festival celebrations.',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
        6,
        TRUE
    ),
    (
        '11111111-1111-1111-1111-111111111107',
        'Photoshoots',
        'photoshoots',
        'Aesthetic pre-wedding, maternity, and couple photoshoot zones with fairy lights, rustic wooden props, and floral frames.',
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80',
        7,
        TRUE
    ),
    (
        '11111111-1111-1111-1111-111111111108',
        'Catering',
        'catering',
        'Complete traditional banquet dining setups, pristine banana leaf arrangements, royal buffet counters, and hospitality styling.',
        'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
        8,
        TRUE
    ),
    (
        '11111111-1111-1111-1111-111111111109',
        'Event Stalls',
        'event-stalls',
        'Welcome arches, live chaat stalls, popcorn & candy counters, decorative entrance canopies, and interactive selfie photo booths.',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
        9,
        TRUE
    )
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    cover_image_url = EXCLUDED.cover_image_url,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- ------------------------------------------------------------------------------
-- 12. SEED DATA: COMPLETED PORTFOLIO PROJECTS & MULTIPLE PHOTOGRAPHS
-- ------------------------------------------------------------------------------
INSERT INTO public.portfolio_projects (
    id, category_id, title, slug, description, event_date, location, cover_image_url, status, display_order
) VALUES
    (
        '22222222-2222-2222-2222-222222222201',
        '11111111-1111-1111-1111-111111111101',
        'Royal Chettinad Kalyana Mandapam',
        'royal-chettinad-kalyana-mandapam',
        'A magnificent traditional South Indian temple-style mandap adorned with fresh jasmine garlands, brass Urulis with floating marigolds, and handcrafted gold-carved temple pillars.',
        '2026-02-14',
        'Madurai, Tamil Nadu',
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        'published',
        1
    ),
    (
        '22222222-2222-2222-2222-222222222202',
        '11111111-1111-1111-1111-111111111102',
        'Golden Starlight Royal Reception Stage',
        'golden-starlight-royal-reception-stage',
        'An opulent modern reception stage featuring champagne gold geometric arches, cascading imported chandeliers, warm amber spotlights, and royal velvet couch seating.',
        '2026-01-28',
        'Rajapalayam, Tamil Nadu',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
        'published',
        2
    ),
    (
        '22222222-2222-2222-2222-222222222203',
        '11111111-1111-1111-1111-111111111103',
        'Enchanted Pastel Bloom Engagement',
        'enchanted-pastel-bloom-engagement',
        'A romantic ring-ceremony design crafted with blush pink carnations, white hydrangeas, acrylic monograms, and an ethereal fairy light tunnel.',
        '2026-02-05',
        'Srivilliputhur, Tamil Nadu',
        'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
        'published',
        3
    ),
    (
        '22222222-2222-2222-2222-222222222204',
        '11111111-1111-1111-1111-111111111105',
        'Auspicious Lotus Seemantham Traditional Decor',
        'auspicious-lotus-seemantham-traditional-decor',
        'A traditional Tamil baby shower ceremony decor with a wooden swing covered in pink lotus buds, jasmine ropes, banana trunk entrance decor, and brass kuthuvilakku.',
        '2026-01-15',
        'Virudhunagar, Tamil Nadu',
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
        'published',
        4
    ),
    (
        '22222222-2222-2222-2222-222222222205',
        '11111111-1111-1111-1111-111111111104',
        'Fairytale Safari 1st Birthday Extravaganza',
        'fairytale-safari-first-birthday',
        'A vibrant luxury birthday setup with organic pastel green and gold balloon clusters, 3D animal sculptures, LED marquee numbers, and customized cake table display.',
        '2026-03-01',
        'Madurai, Tamil Nadu',
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
        'published',
        5
    ),
    (
        '22222222-2222-2222-2222-222222222206',
        '11111111-1111-1111-1111-111111111106',
        'Heritage Grihapravesam Traditional Home Welcome',
        'heritage-grihapravesam-traditional-home-welcome',
        'Traditional South Indian housewarming entrance arch featuring fresh mango leaves, yellow marigold torans, Rangoli floral floor art, and brass diyas.',
        '2026-02-20',
        'Sathuragiri Foothills, Tamil Nadu',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
        'published',
        6
    ),
    (
        '22222222-2222-2222-2222-222222222207',
        '11111111-1111-1111-1111-111111111107',
        'Sunset Rustic Garden Couple Photoshoot Zone',
        'sunset-rustic-garden-couple-photoshoot',
        'A romantic outdoor photoshoot setting featuring a floral circular moon gate, vintage wooden benches, lanterns, and golden hour lighting setup.',
        '2026-02-10',
        'Courtallam, Tamil Nadu',
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80',
        'published',
        7
    ),
    (
        '22222222-2222-2222-2222-222222222208',
        '11111111-1111-1111-1111-111111111108',
        'Royal Virundhu Banquet Dining Arrangement',
        'royal-virundhu-banquet-dining-arrangement',
        'Pristine South Indian wedding feast setup with silk-bordered banana leaf tables, traditional copper water carafes, flower centerpieces, and neat banquet canopy.',
        '2026-01-22',
        'Madurai, Tamil Nadu',
        'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
        'published',
        8
    )
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    event_date = EXCLUDED.event_date,
    location = EXCLUDED.location,
    cover_image_url = EXCLUDED.cover_image_url,
    status = EXCLUDED.status,
    display_order = EXCLUDED.display_order,
    updated_at = CURRENT_TIMESTAMP;

-- ------------------------------------------------------------------------------
-- 13. SEED DATA: MULTIPLE PROJECT PHOTOGRAPHS
-- ------------------------------------------------------------------------------
INSERT INTO public.portfolio_images (project_id, image_url, alt_text, display_order)
VALUES
    -- Royal Chettinad Mandapam Images
    ('22222222-2222-2222-2222-222222222201', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', 'Full Mandapam Panoramic View', 1),
    ('22222222-2222-2222-2222-222222222201', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80', 'Traditional Brass Kuthuvilakku & Floral Rangoli', 2),
    ('22222222-2222-2222-2222-222222222201', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80', 'Entrance Floral Pathway Arch', 3),

    -- Golden Starlight Reception Images
    ('22222222-2222-2222-2222-222222222202', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80', 'Golden Starlight Stage Overview', 1),
    ('22222222-2222-2222-2222-222222222202', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80', 'Crystal Chandelier and Amber Spotlights Close-up', 2),
    ('22222222-2222-2222-2222-222222222202', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80', 'Couple Royal Velvet Sofa & Backdrop Detail', 3),

    -- Enchanted Engagement Images
    ('22222222-2222-2222-2222-222222222203', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80', 'Blush Pastel Floral Halo', 1),
    ('22222222-2222-2222-2222-222222222203', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', 'Couple Name Monogram with White Hydrangeas', 2),

    -- Seemantham Images
    ('22222222-2222-2222-2222-222222222204', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80', 'Traditional Wooden Swing with Lotus Decor', 1),
    ('22222222-2222-2222-2222-222222222204', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80', 'Jasmine Ropes and Traditional Brass Uruli', 2),

    -- Birthday Images
    ('22222222-2222-2222-2222-222222222205', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'Safari Theme Balloon Arch and Props', 1),
    ('22222222-2222-2222-2222-222222222205', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80', 'Cylinder Cake Stands & Illuminated Numbers', 2),

    -- Photoshoot Images
    ('22222222-2222-2222-2222-222222222207', 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80', 'Circular Floral Arch in Sunset Glow', 1),
    ('22222222-2222-2222-2222-222222222207', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', 'Rustic Fairy Light Lanterns and Wooden Bench', 2)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- END OF SCHEMA — SATHURAGIRI DECORATION
-- ==============================================================================
