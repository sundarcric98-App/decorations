import { db } from '../../config/database.js';

export interface SiteSettingsDict {
  business_name?: string;
  tagline?: string;
  logo_url?: string;
  whatsapp_number?: string;
  whatsapp_number_secondary?: string;
  phone?: string;
  email?: string;
  address?: string;
  about_text?: string;
  instagram_url?: string;
  facebook_url?: string;
  youtube_url?: string;
  footer_text?: string;
  // Aliases for frontend convenience
  businessName?: string;
  whatsappNumber?: string;
  whatsappNumberSecondary?: string;
  logoUrl?: string;
  aboutText?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  footerText?: string;
  [key: string]: any;
}

export class SettingsService {
  static async getSettings(): Promise<SiteSettingsDict> {
    const rows = await db.query<{ setting_key: string; setting_value: string }>(
      `SELECT setting_key, setting_value FROM public.site_settings`
    );

    const dict: Record<string, string> = {};
    for (const row of rows) {
      dict[row.setting_key] = row.setting_value;
    }

    // Default fallbacks if empty
    const businessName = dict['business_name'] || 'Sathuragiri Decoration';
    const tagline = dict['tagline'] || 'Every Celebration, Beautifully Crafted.';
    const logoUrl = dict['logo_url'] || '/Decoration_Logo.png';
    const whatsappNumber = dict['whatsapp_number'] || '918903575802';
    const whatsappNumberSecondary = dict['whatsapp_number_secondary'] || '919842322624';
    const phone = dict['phone'] || '+91 89035 75802, +91 98423 22624';
    const email = dict['email'] || 'contact@sathuragiridecoration.com';
    const address =
      dict['address'] ||
      '124, Temple View Road, Near Sathuragiri Hills, Madurai & Rajapalayam, Tamil Nadu - 626117, India';
    const aboutText =
      dict['about_text'] ||
      'At Sathuragiri Decoration, we transform your most cherished milestones into timeless memories. From opulent South Indian wedding mandaps and royal receptions to joyous birthday themes and traditional baby showers, our master artisans bring perfection, elegance, and divinity to every stage.';
    const instagramUrl = dict['instagram_url'] || 'https://instagram.com/sathuragiridecoration';
    const facebookUrl = dict['facebook_url'] || 'https://facebook.com/sathuragiridecoration';
    const youtubeUrl = dict['youtube_url'] || 'https://youtube.com/@sathuragiridecoration';
    const footerText =
      dict['footer_text'] || '© 2026 Sathuragiri Decoration. Every Celebration, Beautifully Crafted. All rights reserved.';

    return {
      ...dict,
      business_name: businessName,
      tagline,
      logo_url: logoUrl,
      whatsapp_number: whatsappNumber,
      whatsapp_number_secondary: whatsappNumberSecondary,
      phone,
      email,
      address,
      about_text: aboutText,
      instagram_url: instagramUrl,
      facebook_url: facebookUrl,
      youtube_url: youtubeUrl,
      footer_text: footerText,
      // CamelCase convenience aliases
      businessName,
      whatsappNumber,
      whatsappNumberSecondary,
      logoUrl,
      aboutText,
      instagramUrl,
      facebookUrl,
      footerText,
    };
  }

  static async updateSettings(data: Record<string, any>): Promise<SiteSettingsDict> {
    const keyMapping: Record<string, string> = {
      businessName: 'business_name',
      whatsappNumber: 'whatsapp_number',
      whatsappNumberSecondary: 'whatsapp_number_secondary',
      logoUrl: 'logo_url',
      aboutText: 'about_text',
      instagramUrl: 'instagram_url',
      facebookUrl: 'facebook_url',
      youtubeUrl: 'youtube_url',
      footerText: 'footer_text',
    };

    for (const [rawKey, rawVal] of Object.entries(data)) {
      if (rawVal === undefined || rawVal === null) continue;
      const key = keyMapping[rawKey] || rawKey;
      const val = String(rawVal);

      await db.query(
        `INSERT INTO public.site_settings (setting_key, setting_value)
         VALUES ($1, $2)
         ON CONFLICT (setting_key) DO UPDATE
         SET setting_value = EXCLUDED.setting_value,
             updated_at = CURRENT_TIMESTAMP`,
        [key, val]
      );
    }

    return this.getSettings();
  }
}
