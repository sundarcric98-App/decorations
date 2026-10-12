/**
 * Helper to build validated, URL-encoded WhatsApp enquiry links for Sathuragiri Decoration
 * Format: https://wa.me/COUNTRYCODEPHONENUMBER?text=URL_ENCODED_MESSAGE
 */

export const WHATSAPP_LINE_1 = '918903575802'; // +91 89035 75802
export const WHATSAPP_LINE_2 = '919842322624'; // +91 98423 22624

export const WHATSAPP_CONTACTS = [
  {
    id: 'line1',
    label: 'Primary Line',
    displayPhone: '+91 89035 75802',
    cleanNumber: WHATSAPP_LINE_1,
  },
  {
    id: 'line2',
    label: 'Alternate Line',
    displayPhone: '+91 98423 22624',
    cleanNumber: WHATSAPP_LINE_2,
  },
];

export function cleanWhatsAppNumber(rawNumber?: string | null): string {
  if (!rawNumber) return WHATSAPP_LINE_1;
  const cleaned = rawNumber.replace(/[^0-9]/g, '');
  // Default to India country code 91 if 10 digits provided
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned || WHATSAPP_LINE_1;
}

export function buildWhatsAppUrl(
  phoneNumber: string | undefined | null,
  message: string
): string {
  const cleanPhone = cleanWhatsAppNumber(phoneNumber);
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function getDualWhatsAppUrls(
  message: string,
  primaryNumber?: string | null,
  secondaryNumber?: string | null
) {
  const phone1 = primaryNumber ? cleanWhatsAppNumber(primaryNumber) : WHATSAPP_LINE_1;
  const phone2 = secondaryNumber ? cleanWhatsAppNumber(secondaryNumber) : WHATSAPP_LINE_2;

  return [
    {
      label: 'Chat on Line 1',
      displayPhone: '+91 89035 75802',
      url: buildWhatsAppUrl(phone1, message),
    },
    {
      label: 'Chat on Line 2',
      displayPhone: '+91 98423 22624',
      url: buildWhatsAppUrl(phone2, message),
    },
  ];
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
