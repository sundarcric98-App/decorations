import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Sparkles, Send } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import {
  buildWhatsAppUrl,
  WhatsAppMessages,
  WHATSAPP_LINE_1,
  WHATSAPP_LINE_2,
} from '../../lib/whatsapp';
import decorationLogo from '../../assets/Decoration_Logo.png';

export const WhatsAppFloating: React.FC = () => {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const phone1 = settings?.whatsappNumber || settings?.whatsapp_number || WHATSAPP_LINE_1;
  const phone2 =
    settings?.whatsappNumberSecondary ||
    settings?.whatsapp_number_secondary ||
    WHATSAPP_LINE_2;

  const url1 = buildWhatsAppUrl(phone1, WhatsAppMessages.general());
  const url2 = buildWhatsAppUrl(phone2, WhatsAppMessages.general());

  // Close popup if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" ref={cardRef}>
      {/* Expanded WhatsApp Contact Card */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-3xl shadow-2xl border border-[#E8E0D6] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#128C7E] to-[#25D366] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white p-1 shrink-0 shadow-sm">
                <img
                  src={decorationLogo}
                  alt="Sathuragiri Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm tracking-wide">
                  Sathuragiri Decoration
                </h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse inline-block" />
                  Online for Enquiries
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-black/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Card Body */}
          <div className="p-4 bg-[#FAF7F2] space-y-3">
            <p className="text-xs text-[#56504A] leading-relaxed">
              Hello! Choose a coordinator below to start an instant WhatsApp consultation for your celebration:
            </p>

            {/* Line 1 Option */}
            <a
              href={url1}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E8E0D6] hover:border-[#25D366] hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366] shrink-0 font-bold group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-[#28231F] block">
                    WhatsApp Line 1
                  </span>
                  <span className="text-[11px] text-[#77716B]">
                    +91 89035 75802
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#25D366] group-hover:translate-x-0.5 transition-transform">
                Chat &rarr;
              </span>
            </a>

            {/* Line 2 Option */}
            <a
              href={url2}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E8E0D6] hover:border-[#25D366] hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366] shrink-0 font-bold group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-[#28231F] block">
                    WhatsApp Line 2
                  </span>
                  <span className="text-[11px] text-[#77716B]">
                    +91 98423 22624
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#25D366] group-hover:translate-x-0.5 transition-transform">
                Chat &rarr;
              </span>
            </a>
          </div>

          {/* Footer note */}
          <div className="px-4 py-2 bg-white border-t border-[#F0ECE1] text-[10px] text-center text-[#99948E]">
            Every Celebration, Beautifully Crafted.
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group border-2 border-white/60 active:scale-95"
        aria-label="Enquire with Sathuragiri Decoration on WhatsApp"
        aria-expanded={isOpen}
      >
        <MessageCircle className="w-6 h-6 fill-current text-white animate-pulse" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline-block">
          WhatsApp Enquiry
        </span>
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300"></span>
        </span>
      </button>
    </div>
  );
};
