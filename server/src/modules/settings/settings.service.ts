import { prisma } from '../../config/database.js';

export class SettingsService {
  static async getSettings() {
    let settings = await prisma.businessSettings.findFirst();
    if (!settings) {
      settings = await prisma.businessSettings.create({
        data: {
          id: 'default-settings',
          businessName: 'Sathuragiri Decoration',
          tagline: 'Every Celebration, Beautifully Crafted.',
          phone: '+91 98421 87654',
          whatsappNumber: '+919842187654',
          email: 'contact@sathuragiridecoration.com',
          address: 'Plot No. 45, Temple View Avenue, Near Ring Road, Madurai',
          city: 'Madurai',
          state: 'Tamil Nadu',
          pincode: '625009',
        },
      });
    }
    return settings;
  }

  static async updateSettings(data: any) {
    const settings = await this.getSettings();
    return prisma.businessSettings.update({
      where: { id: settings.id },
      data,
    });
  }
}
