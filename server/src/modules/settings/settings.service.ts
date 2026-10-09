import { db } from '../../config/database.js';

export class SettingsService {
  static async getSettings() {
    let settings = await db.queryOne(`SELECT * FROM "BusinessSettings" LIMIT 1`);
    if (!settings) {
      settings = await db.queryOne(
        `INSERT INTO "BusinessSettings" (
          id, "businessName", tagline, phone, "whatsappNumber", email, address, city, state, pincode
        ) VALUES (
          'default-settings', 'Sathuragiri Decoration', 'Every Celebration, Beautifully Crafted.',
          '+91 98421 87654', '+919842187654', 'contact@sathuragiridecoration.com',
          'Plot No. 45, Temple View Avenue, Near Ring Road, Madurai', 'Madurai', 'Tamil Nadu', '625009'
        )
        ON CONFLICT (id) DO NOTHING
        RETURNING *`
      );
      if (!settings) {
        settings = await db.queryOne(`SELECT * FROM "BusinessSettings" LIMIT 1`);
      }
    }
    return settings;
  }

  static async updateSettings(data: any) {
    const settings = await this.getSettings();
    const allowedKeys = [
      'businessName', 'tagline', 'logoUrl', 'phone', 'alternatePhone', 'whatsappNumber',
      'email', 'address', 'city', 'state', 'pincode', 'mapsEmbedUrl', 'primaryGold',
      'gstNumber', 'advancePercentageDefault', 'currencySymbol', 'termsDefault',
      'socialInstagram', 'socialFacebook', 'socialYoutube'
    ];

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const key of allowedKeys) {
      if (data[key] !== undefined) {
        fields.push(`"${key}" = $${idx}`);
        values.push(data[key]);
        idx++;
      }
    }

    if (fields.length === 0) {
      return settings;
    }

    values.push(settings.id);
    const updated = await db.queryOne(
      `UPDATE "BusinessSettings"
       SET ${fields.join(', ')}
       WHERE id = $${idx}
       RETURNING *`,
      values
    );

    return updated;
  }
}
