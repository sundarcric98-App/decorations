export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF';

export interface User {
  id: string;
  email: string;
  name: string;
  display_name?: string;
  phone?: string | null;
  role: UserRole;
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
}

export interface BusinessSettings {
  id?: string;
  businessName: string;
  business_name?: string;
  tagline: string;
  logoUrl?: string | null;
  logo_url?: string | null;
  phone: string;
  alternatePhone?: string | null;
  whatsappNumber: string;
  whatsapp_number?: string;
  email: string;
  address: string;
  aboutText?: string;
  about_text?: string;
  socialInstagram?: string | null;
  instagram_url?: string | null;
  socialFacebook?: string | null;
  facebook_url?: string | null;
  socialYoutube?: string | null;
  youtube_url?: string | null;
  footerText?: string;
  footer_text?: string;
  primaryGold?: string;
  city?: string;
  state?: string;
  pincode?: string;
  mapsEmbedUrl?: string | null;
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  cover_image_url?: string | null;
  coverImage?: string | null;
  display_order: number;
  is_active: boolean;
  isActive?: boolean;
  projectCount?: number;
  created_at?: string;
  updated_at?: string;
}

// Backward-compatibility alias
export type ServiceCategory = EventCategory;

export interface PortfolioImage {
  id?: string;
  project_id?: string;
  image_url: string;
  imageUrl?: string;
  storage_path?: string | null;
  alt_text?: string | null;
  display_order?: number;
  created_at?: string;
}

export interface PortfolioProject {
  id: string;
  category_id: string;
  categoryId?: string;
  category?: string;
  categoryName?: string;
  categorySlug?: string;
  title: string;
  slug: string;
  description?: string | null;
  location?: string | null;
  event_date?: string | null;
  eventDate?: string | null;
  cover_image_url?: string | null;
  coverImage?: string | null;
  status: 'draft' | 'published';
  isPublished?: boolean;
  display_order: number;
  sortOrder?: number;
  images?: PortfolioImage[] | string[];
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
}

export interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  activeCategories: number;
  totalCategories?: number;
  total_projects?: number;
  published_projects?: number;
  draft_projects?: number;
  active_categories?: number;
  recentProjects?: any[];
  categoriesBreakdown?: any[];
}
