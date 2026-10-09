import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const WhatsAppFloating: React.FC = () => {
  const { settings } = useSettings();

  const rawNumber = settings?.whatsappNumber || '+919842187654';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
  const message = encodeURIComponent(
    `Hello Sathuragiri Decoration! I would like to enquire about your wedding & event decoration services.`
  );
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group border-2 border-white/50"
      aria-label="Chat with Sathuragiri Decoration on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-current text-white animate-bounce" />
      <span className="text-xs font-bold tracking-wide hidden md:inline-block">
        Chat with Us
      </span>
      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300"></span>
      </span>
    </a>
  );
};
