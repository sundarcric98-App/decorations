import React from 'react';
import { Badge } from '../../components/common/Badge';
import { useSettings } from '../../context/SettingsContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-3">
        <Badge variant="gold">Legal & Privacy</Badge>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#24211F]">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#77716B]">Last updated: October 2026</p>
      </div>

      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8E0D6] shadow-sm prose prose-sm max-w-none text-[#56504A] space-y-6 leading-relaxed">
        <h3 className="font-serif text-lg font-bold text-[#24211F]">1. Information We Collect</h3>
        <p>
          When you submit an enquiry, request a quotation, or book an event through {settings?.businessName || 'Sathuragiri Decoration'}, we collect personal information including your full name, phone number, email address, venue address, and specific celebration details.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#24211F]">2. How We Use Your Information</h3>
        <p>
          We use your information exclusively to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Prepare custom 3D event design mockups and itemized quotations.</li>
          <li>Communicate via phone calls, SMS, or WhatsApp regarding your upcoming celebration.</li>
          <li>Coordinate on-site floral and stage logistics with our event supervisors.</li>
          <li>Generate official payment receipts and invoices.</li>
        </ul>

        <h3 className="font-serif text-lg font-bold text-[#24211F]">3. Data Security</h3>
        <p>
          We employ standard encryption protocols and secure database architectures. We never sell, lease, or rent customer personal details to any third-party marketing entities.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#24211F]">4. Contacting Us</h3>
        <p>
          If you have any questions regarding our privacy practices, please contact us at{' '}
          <a href={`mailto:${settings?.email || 'contact@sathuragiridecoration.com'}`} className="text-[#B8955A] underline">
            {settings?.email || 'contact@sathuragiridecoration.com'}
          </a>
          .
        </p>
      </div>
    </div>
  );
};
