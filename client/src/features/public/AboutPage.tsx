import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, ShieldCheck, Clock, Award, Users, ArrowRight } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useSettings } from '../../context/SettingsContext';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();

  const values = [
    {
      title: 'Traditional Sanctity',
      desc: 'We honor sacred South Indian customs, temple architecture, and rituals with authentic materials, auspicious flowers, and reverence.',
    },
    {
      title: 'Artistic Excellence',
      desc: 'Our master craftsmen and floral designers elevate every space into a symphony of color, geometry, and enchanting lighting.',
    },
    {
      title: 'Uncompromised Punctuality',
      desc: 'We guarantee full stage and venue readiness 4 to 6 hours prior to auspicious Muhurtham hours, so families can celebrate worry-free.',
    },
    {
      title: 'Transparent Collaboration',
      desc: 'No hidden surcharges. Clear itemized estimates, milestone payments, and continuous updates from your dedicated event coordinator.',
    },
  ];

  return (
    <div className="pt-28 pb-20 space-y-20">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <Badge variant="gold">Our Heritage & Craft</Badge>
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-[#24211F] leading-tight">
          Crafting Divine Celebrations <br className="hidden sm:inline" />
          <span className="gold-gradient-text italic">Since Inception</span>
        </h1>
        <p className="max-w-3xl mx-auto text-sm sm:text-base text-[#77716B] leading-relaxed">
          {settings?.businessName || 'Sathuragiri Decoration'} was founded with a singular vision: to bring the breathtaking architectural splendor and divine sanctity of Tamil Nadu’s heritage temples into modern weddings and milestone family celebrations.
        </p>
      </div>

      {/* Story & Image Split */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold text-[#24211F]">
              Where Tradition Meets Modern Sophistication
            </h2>
            <div className="space-y-4 text-sm text-[#56504A] leading-relaxed">
              <p>
                From humble beginnings in Madurai to becoming a trusted name across South India, our journey has been defined by a deep devotion to quality and craftsmanship.
              </p>
              <p>
                Whether it is hand-threading 150 kilograms of fresh Madurai Malli (jasmine) for a temple mandapam, engineering a 50-foot crystal reception floral wall, or orchestrating a traditional 24-dish banana leaf feast, we treat every celebration as if it were our own family’s.
              </p>
              <p>
                Today, Sathuragiri Decoration operates full-scale event fabrication studios, sound & lighting inventories, and in-house floral styling teams to deliver end-to-end peace of mind to brides, grooms, and host families.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8E0D6]">
                <div className="font-serif text-3xl font-bold text-[#B8955A]">100%</div>
                <div className="text-xs text-[#77716B] font-semibold uppercase mt-1">Fresh Flowers</div>
              </div>
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8E0D6]">
                <div className="font-serif text-3xl font-bold text-[#B8955A]">A-to-Z</div>
                <div className="text-xs text-[#77716B] font-semibold uppercase mt-1">Full Service Management</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
              alt="Sathuragiri Traditional Wedding Mandapam"
              className="rounded-3xl shadow-luxury object-cover aspect-4/3 w-full"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-luxury-lg border border-[#E8E0D6] hidden sm:block max-w-xs">
              <Sparkles className="w-6 h-6 text-[#B8955A] mb-2" />
              <p className="font-serif text-sm font-bold text-[#24211F]">
                "Every celebration deserves to be an unforgettable masterpiece."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-white py-20 border-y border-[#E8E0D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="gold">Our Pillars</Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#24211F]">
              The Values That Guide Our Craft
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val, idx) => (
              <Card key={idx} className="p-6 bg-[#FAF7F2] border border-[#E8E0D6] space-y-3">
                <h3 className="font-serif text-lg font-bold text-[#24211F]">{val.title}</h3>
                <p className="text-xs text-[#77716B] leading-relaxed">{val.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#24211F]">
          Let Us Create Magic for Your Special Occasion
        </h2>
        <p className="max-w-xl mx-auto text-sm text-[#77716B]">
          Schedule a consultation with our senior planners to explore thematic decor concepts tailored to your venue.
        </p>
        <Link to="/book-event">
          <Button variant="gold" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
            Book Your Free Consultation
          </Button>
        </Link>
      </div>
    </div>
  );
};
