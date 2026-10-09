import React from 'react';
import { Badge } from '../../components/common/Badge';
import { useSettings } from '../../context/SettingsContext';

export const TermsPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-3">
        <Badge variant="gold">Business Terms</Badge>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#24211F]">
          Terms & Conditions
        </h1>
        <p className="text-xs text-[#77716B]">Applicable to all event decoration, stage, and catering contracts</p>
      </div>

      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8E0D6] shadow-sm prose prose-sm max-w-none text-[#56504A] space-y-6 leading-relaxed">
        <h3 className="font-serif text-lg font-bold text-[#24211F]">1. Booking Confirmation & Payment Milestones</h3>
        <p>
          A non-refundable advance of {settings?.advancePercentageDefault || 30}% is required to confirm and lock in your event date in our calendar. The interim milestone of 50% must be remitted 2 days prior to the event setup to facilitate fresh flower procurement and fabrication. The final 20% balance is settled on the event day after handover.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#24211F]">2. Venue Access & Setup Time</h3>
        <p>
          The client or wedding hall management must grant access to the stage and venue premises at least 6 hours prior to the event start time for mandapam fabrication, trussing, and fresh floral work.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#24211F]">3. Changes & Customizations</h3>
        <p>
          Customized floral patterns, backdrop colors, or structural modifications must be communicated and finalized at least 7 days before the event date.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#24211F]">4. Electricity & Generator Facilities</h3>
        <p>
          Standard 3-phase electrical power points and backup diesel generator facilities at the venue must be provided by the client or hall proprietor unless generator hire is explicitly included in the quotation.
        </p>
      </div>
    </div>
  );
};
