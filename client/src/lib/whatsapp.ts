/**
 * Helper to build validated, URL-encoded WhatsApp enquiry links for Sathuragiri Decoration
 * Format: https://wa.me/COUNTRYCODEPHONENUMBER?text=URL_ENCODED_MESSAGE
 */

export function cleanWhatsAppNumber(rawNumber?: string | null): string {
  if (!rawNumber) return '919842187654';
  const cleaned = rawNumber.replace(/[^0-9]/g, '');
  // Default to India country code 91 if 10 digits provided
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned || '919842187654';
}

export function buildWhatsAppUrl(
  phoneNumber: string | undefined | null,
  message: string
): string {
  const cleanPhone = cleanWhatsAppNumber(phoneNumber);
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export const WhatsAppMessages = {
  general: (): string => {
    return 'Hello Sathuragiri Decoration, I would like to enquire about your event decoration services. Please share more details.';
  },

  category: (categoryName: string): string => {
    return `Hello Sathuragiri Decoration, I am interested in your ${categoryName} services. Please contact me with more details.`;
  },

  project: (projectTitle: string, categoryName?: string): string => {
    if (categoryName) {
      return `Hello Sathuragiri Decoration, I am interested in your decoration services for "${projectTitle}" (${categoryName}). Please share more details and pricing.`;
    }
    return `Hello Sathuragiri Decoration, I am interested in your decoration services for "${projectTitle}". Please share more details.`;
  },
};
