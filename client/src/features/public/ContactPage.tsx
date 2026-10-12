import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, Sparkles, Instagram, Facebook, Youtube, Clock } from 'lucide-react';
import { WhatsAppButton } from '../../components/common/WhatsAppButton';
import { useSettings } from '../../context/SettingsContext';
import { buildWhatsAppUrl } from '../../lib/whatsapp';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();

  const [name, setName] = useState('');
  const [eventType, setEventType] = useState('Wedding Decoration');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [targetLine, setTargetLine] = useState<'line1' | 'line2'>('line1');

  const handleSendWhatsApp = (line: 'line1' | 'line2' = targetLine) => {
    let text = `Hello Sathuragiri Decoration!`;
    if (name.trim()) text += ` I am ${name.trim()}.`;
    text += ` I would like to enquire about your ${eventType} services.`;
    if (eventDate) text += ` Event Date: ${eventDate}.`;
    if (location.trim()) text += ` Venue / City: ${location.trim()}.`;
    if (notes.trim()) text += ` Requirements: ${notes.trim()}.`;
    text += ` Please share availability, design concepts, and pricing details.`;

    const targetNumber = line === 'line2' ? '919842322624' : '918903575802';
    const url = buildWhatsAppUrl(targetNumber, text);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#FAF7F2]">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B8955A]/10 border border-[#B8955A]/30 text-xs font-semibold uppercase tracking-widest text-[#B8955A]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Get in Touch with Our Team</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#28231F]">
          Contact Sathuragiri Decoration
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#77716B] leading-relaxed">
          WhatsApp is our primary consultation channel. Share your celebration requirements below to connect directly with our decoration coordinators.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Direct WhatsApp Form */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8E0D6] shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#B8955A]">
                Instant Enquiry
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#28231F] mt-1">
                Compose WhatsApp Message
              </h2>
              <p className="text-xs sm:text-sm text-[#77716B] mt-1">
                Fill in your celebration details below. Clicking "Open WhatsApp" will launch WhatsApp with your prefilled message ready to send!
              </p>
            </div>

            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#28231F] mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E0D6] text-sm focus:outline-none focus:ring-2 focus:ring-[#B8955A]/30 focus:border-[#B8955A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#28231F] mb-1.5">
                    Service / Event Category
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E0D6] text-sm focus:outline-none focus:ring-2 focus:ring-[#B8955A]/30 focus:border-[#B8955A] bg-white"
                  >
                    <option value="Wedding Decoration">Wedding Decoration</option>
                    <option value="Reception Decoration">Reception Decoration</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Birthday Celebration">Birthday Celebration</option>
                    <option value="Baby Shower">Baby Shower</option>
                    <option value="Traditional Functions">Traditional Functions</option>
                    <option value="Photoshoots">Photoshoots</option>
                    <option value="Catering">Catering</option>
                    <option value="Event Stalls">Event Stalls</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#28231F] mb-1.5">
                    Planned Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E0D6] text-sm focus:outline-none focus:ring-2 focus:ring-[#B8955A]/30 focus:border-[#B8955A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#28231F] mb-1.5">
                  Venue / Location / City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Madurai, Rajapalayam, Mandapam name..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E0D6] text-sm focus:outline-none focus:ring-2 focus:ring-[#B8955A]/30 focus:border-[#B8955A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#28231F] mb-1.5">
                  Decor Requirements / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your theme preferences, estimated guest count, or specific stage requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E0D6] text-sm focus:outline-none focus:ring-2 focus:ring-[#B8955A]/30 focus:border-[#B8955A]"
                />
              </div>

              {/* WhatsApp Line Selector & Dual Send Buttons */}
              <div className="pt-2 space-y-3">
                <label className="block text-xs font-semibold text-[#28231F]">
                  Send Message via WhatsApp
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp('line1')}
                    className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                    <span>Send to +91 89035 75802</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp('line2')}
                    className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                    <span>Send to +91 98423 22624</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Contact Details & Office Address */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8E0D6] shadow-sm space-y-6">
              <h2 className="font-serif text-2xl font-bold text-[#28231F]">
                Business Details
              </h2>

              <div className="space-y-5 text-sm text-[#56504A]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6] flex items-center justify-center shrink-0 text-[#B8955A]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#28231F]">Studio & Workshop Address</p>
                    <p className="text-xs sm:text-sm text-[#77716B] mt-0.5 leading-relaxed">
                      {settings?.address || '124, Temple View Road, Near Sathuragiri Hills, Madurai & Rajapalayam, Tamil Nadu, India'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6] flex items-center justify-center shrink-0 text-[#B8955A]">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#28231F]">Official WhatsApp Contacts</p>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-800">Line 1:</span>
                        <a
                          href="https://wa.me/918903575802"
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs sm:text-sm text-[#25D366] hover:underline font-bold"
                        >
                          +91 89035 75802
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-800">Line 2:</span>
                        <a
                          href="https://wa.me/919842322624"
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs sm:text-sm text-[#25D366] hover:underline font-bold"
                        >
                          +91 98423 22624
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6] flex items-center justify-center shrink-0 text-[#B8955A]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#28231F]">Telephone Enquiries</p>
                    <div className="mt-1 space-y-1">
                      <a
                        href="tel:+918903575802"
                        className="text-xs sm:text-sm text-[#B8955A] hover:underline font-semibold block"
                      >
                        +91 89035 75802
                      </a>
                      <a
                        href="tel:+919842322624"
                        className="text-xs sm:text-sm text-[#B8955A] hover:underline font-semibold block"
                      >
                        +91 98423 22624
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6] flex items-center justify-center shrink-0 text-[#B8955A]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#28231F]">Email Enquiries</p>
                    <a
                      href={`mailto:${settings?.email || 'contact@sathuragiridecoration.com'}`}
                      className="text-xs sm:text-sm text-[#77716B] hover:text-[#B8955A] block mt-0.5"
                    >
                      {settings?.email || 'contact@sathuragiridecoration.com'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6] flex items-center justify-center shrink-0 text-[#B8955A]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#28231F]">Working Hours</p>
                    <p className="text-xs sm:text-sm text-[#77716B] mt-0.5">
                      Monday to Sunday: 8:00 AM – 9:00 PM (WhatsApp available 24/7)
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="pt-4 border-t border-[#E8E0D6]">
                <p className="text-xs font-semibold text-[#28231F] mb-3">Connect on Social Media</p>
                <div className="flex items-center gap-3">
                  <a
                    href={settings?.instagram_url || 'https://instagram.com/sathuragiridecoration'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6] flex items-center justify-center text-[#B8955A] hover:bg-[#B8955A] hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href={settings?.facebook_url || 'https://facebook.com/sathuragiridecoration'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6] flex items-center justify-center text-[#B8955A] hover:bg-[#B8955A] hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href={settings?.youtube_url || 'https://youtube.com/@sathuragiridecoration'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6] flex items-center justify-center text-[#B8955A] hover:bg-[#B8955A] hover:text-white transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Direct Button */}
            <div className="bg-gradient-to-br from-[#28231F] to-[#1E1B19] rounded-3xl p-8 text-white text-center space-y-4">
              <h3 className="font-serif text-xl font-bold">Prefer a Direct Chat?</h3>
              <p className="text-xs text-[#CECDCC] max-w-sm mx-auto leading-relaxed">
                Click below to start an instant conversation with our team right now on WhatsApp.
              </p>
              <WhatsAppButton
                size="md"
                label="Chat on WhatsApp"
                className="w-full justify-center"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
