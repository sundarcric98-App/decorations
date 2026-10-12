import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { buildWhatsAppUrl } from '../../lib/whatsapp';

export interface WhatsAppButtonProps {
  message?: string;
  categoryName?: string;
  projectTitle?: string;
  className?: string;
  variant?: 'primary' | 'outline' | 'gold' | 'minimal' | 'hero';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showIcon?: boolean;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  message,
  categoryName,
  projectTitle,
  className = '',
  variant = 'primary',
  size = 'md',
  label = 'Enquire on WhatsApp',
  showIcon = true,
}) => {
  const { settings } = useSettings();

  // Determine message content
  let finalMessage = message;
  if (!finalMessage) {
    if (projectTitle && categoryName) {
      finalMessage = `Hello Sathuragiri Decoration, I am interested in your decoration services for "${projectTitle}" (${categoryName}). Please share more details.`;
    } else if (projectTitle) {
      finalMessage = `Hello Sathuragiri Decoration, I am interested in your decoration services for "${projectTitle}". Please share more details.`;
    } else if (categoryName) {
      finalMessage = `Hello Sathuragiri Decoration, I am interested in your ${categoryName} services. Please contact me with more details.`;
    } else {
      finalMessage =
        'Hello Sathuragiri Decoration, I would like to enquire about your event decoration services. Please share more details.';
    }
  }

  const whatsappUrl = buildWhatsAppUrl(settings?.whatsappNumber, finalMessage);

  // Size styling
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5 font-semibold',
  }[size];

  // Variant styling
  const variantClasses = {
    primary:
      'bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95',
    outline:
      'border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300',
    gold:
      'bg-gradient-to-r from-[#B8955A] to-[#96743A] hover:from-[#A8854A] hover:to-[#86642A] text-white shadow-md hover:shadow-gold transition-all duration-300',
    minimal:
      'text-[#25D366] hover:underline hover:text-[#20BD5A] p-0 font-medium',
    hero:
      'bg-[#25D366] hover:bg-[#20BD5A] text-white px-7 py-3.5 rounded-full text-base font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300',
  }[variant];

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center font-sans rounded-xl font-medium transition-all ${sizeClasses} ${variantClasses} ${className}`}
      aria-label={`${label} via WhatsApp`}
    >
      {showIcon && <MessageCircle className="w-4 h-4 fill-current shrink-0" />}
      <span>{label}</span>
    </a>
  );
};
