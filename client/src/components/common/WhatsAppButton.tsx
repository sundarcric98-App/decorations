import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, ChevronDown, PhoneCall } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { buildWhatsAppUrl, WHATSAPP_LINE_1, WHATSAPP_LINE_2 } from '../../lib/whatsapp';

export interface WhatsAppButtonProps {
  message?: string;
  categoryName?: string;
  projectTitle?: string;
  className?: string;
  variant?: 'primary' | 'outline' | 'gold' | 'minimal' | 'hero';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showIcon?: boolean;
  preferLine?: 1 | 2;
  showChoice?: boolean;
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
  preferLine = 1,
  showChoice = false,
}) => {
  const { settings } = useSettings();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const phoneLine1 = settings?.whatsappNumber || settings?.whatsapp_number || WHATSAPP_LINE_1;
  const phoneLine2 =
    settings?.whatsappNumberSecondary ||
    settings?.whatsapp_number_secondary ||
    WHATSAPP_LINE_2;

  const url1 = buildWhatsAppUrl(phoneLine1, finalMessage);
  const url2 = buildWhatsAppUrl(phoneLine2, finalMessage);

  // Preferred URL
  const defaultUrl = preferLine === 2 ? url2 : url1;

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

  if (showChoice) {
    return (
      <div className="relative inline-block" ref={dropdownRef}>
        <div className="inline-flex rounded-xl shadow-sm">
          <a
            href={defaultUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center font-sans font-medium transition-all ${sizeClasses} ${variantClasses} ${className} rounded-r-none`}
            aria-label={`${label} via WhatsApp`}
          >
            {showIcon && <MessageCircle className="w-4 h-4 fill-current shrink-0" />}
            <span>{label}</span>
          </a>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`border-l border-white/25 px-2 flex items-center justify-center rounded-r-xl ${variantClasses}`}
            title="Choose WhatsApp number"
            aria-expanded={dropdownOpen}
          >
            <ChevronDown className="w-4 h-4 text-white" />
          </button>
        </div>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-[#E8E0D6] py-2 z-50 animate-in fade-in zoom-in-95">
            <div className="px-3.5 py-1.5 border-b border-[#F0ECE1]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#B8955A]">
                Select WhatsApp Contact
              </p>
            </div>
            <a
              href={url1}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 text-xs text-[#28231F] hover:bg-[#FAF7F2] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366] shrink-0 font-bold">
                1
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-emerald-800">Line 1 (Primary)</span>
                <span className="text-[#77716B]">+91 89035 75802</span>
              </div>
            </a>
            <a
              href={url2}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 text-xs text-[#28231F] hover:bg-[#FAF7F2] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366] shrink-0 font-bold">
                2
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-emerald-800">Line 2 (Alternate)</span>
                <span className="text-[#77716B]">+91 98423 22624</span>
              </div>
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <a
      href={defaultUrl}
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

export const DualWhatsAppButtons: React.FC<{
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ message, className = '', size = 'sm' }) => {
  const { settings } = useSettings();
  const phone1 = settings?.whatsappNumber || WHATSAPP_LINE_1;
  const phone2 = settings?.whatsappNumberSecondary || WHATSAPP_LINE_2;

  const text =
    message ||
    'Hello Sathuragiri Decoration, I would like to enquire about your event decoration services. Please share more details.';

  const url1 = buildWhatsAppUrl(phone1, text);
  const url2 = buildWhatsAppUrl(phone2, text);

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      <a
        href={url1}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
      >
        <MessageCircle className="w-3.5 h-3.5 fill-current" />
        <span>WhatsApp: +91 89035 75802</span>
      </a>
      <a
        href={url2}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
      >
        <MessageCircle className="w-3.5 h-3.5 fill-current" />
        <span>WhatsApp: +91 98423 22624</span>
      </a>
    </div>
  );
};
