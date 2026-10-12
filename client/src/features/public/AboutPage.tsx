import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  Clock,
  Award,
  Phone,
} from "lucide-react";
import { WhatsAppButton } from "../../components/common/WhatsAppButton";
import { Button } from "../../components/common/Button";
import { useSettings } from "../../context/SettingsContext";

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();

  const values = [
    {
      icon: <Sparkles className="w-6 h-6 text-[#B8955A]" />,
      title: "Sacred Traditional Sanctity",
      desc: "We honor South Indian traditions, temple architecture, and sacred rituals with auspicious fresh flowers, brass artifacts, and divine reverence.",
    },
    {
      icon: <Award className="w-6 h-6 text-[#B8955A]" />,
      title: "Artistic Excellence",
      desc: "Our master craftsmen transform venues with meticulous floral arches, crystal chandeliers, ambient lighting, and bespoke stage backdrops.",
    },
    {
      icon: <Clock className="w-6 h-6 text-[#B8955A]" />,
      title: "100% Punctual Guarantee",
      desc: "Every stage and entrance fabrication is completed well before the auspicious Muhurtham hours, ensuring total peace of mind.",
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-[#B8955A]" />,
      title: "Personalized Family Service",
      desc: "Direct consultation on WhatsApp, transparent cost breakdowns, zero hidden fees, and dedicated support for every celebration.",
    },
  ];

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#FAF7F2]">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B8955A]/10 border border-[#B8955A]/30 text-xs font-semibold uppercase tracking-widest text-[#B8955A]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Heritage & Craftsmanship</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#28231F] leading-tight">
          About{" "}
          {settings?.business_name ||
            settings?.businessName ||
            "Sathuragiri Decoration"}
        </h1>
        <p className="max-w-3xl mx-auto text-sm sm:text-base text-[#77716B] leading-relaxed">
          {settings?.tagline || "Every Celebration, Beautifully Crafted."}
        </p>
      </div>

      {/* Main Narrative Split */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual Showcase */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-black/10">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
                alt="Sathuragiri Master Mandapam Craft"
                className="w-full h-[450px] object-cover object-center"
              />
            </div>
            <div className="absolute -bottom-6 -right-2 sm:right-6 bg-white p-5 rounded-2xl shadow-xl border border-[#E8E0D6] max-w-xs">
              <p className="font-serif font-bold text-[#28231F] text-base">
                South Indian Artistry
              </p>
              <p className="text-xs text-[#77716B] mt-1">
                Weddings • Receptions • Engagements • Family Functions
              </p>
            </div>
          </div>

          {/* Narrative Text */}
          <div className="space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#28231F] leading-tight">
              Where South Indian Heritage Meets Contemporary Elegance
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#56504A] leading-relaxed">
              <p>
                {settings?.about_text ||
                  "At Sathuragiri Decoration, we transform your most cherished milestones into timeless memories. Rooted in traditional South Indian heritage and elevated with contemporary luxury design, our master artisans create breathtaking wedding mandaps, opulent reception stages, joyous birthday backdrops, and auspicious family celebrations."}
              </p>
              <p>
                From hand-strung Madurai jasmine garlands and brass Kuthuvilakku
                styling to royal velvet reception thrones and ambient starry
                lighting, our experienced team works with deep devotion to bring
                your dream decor to life.
              </p>
              <p>
                Whether you are hosting an intimate traditional family function
                or a grand 2,000-guest wedding reception, we ensure every detail
                is tailored with perfection and delivered punctually.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <WhatsAppButton
                size="md"
                label="Enquire on WhatsApp"
                className="w-full sm:w-auto"
              />
              <Link to="/portfolio" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full sm:w-auto"
                >
                  View Our Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[#B8955A] font-semibold text-xs uppercase tracking-widest block mb-2">
            Our Guiding Pillars
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#28231F]">
            The Principles That Define Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <div
              key={i}
              className="bg-white p-7 rounded-2xl border border-[#E8E0D6] shadow-xs hover:border-[#B8955A] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6] flex items-center justify-center mb-4">
                {v.icon}
              </div>
              <h3 className="font-serif font-bold text-lg text-[#28231F] mb-2">
                {v.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#77716B] leading-relaxed">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Prompt */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-white rounded-3xl p-10 border border-[#E8E0D6] shadow-sm">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#28231F] mb-3">
          Have an Upcoming Celebration?
        </h2>
        <p className="text-sm text-[#77716B] mb-6 max-w-lg mx-auto">
          Contact our team directly on WhatsApp to explore creative themes,
          check calendar availability, and receive a customized quote.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <WhatsAppButton size="md" label="Enquire on WhatsApp" />
          <a
            href={`tel:${settings?.phone || "+9189035 75802"}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E8E0D6] text-sm font-semibold text-[#28231F] hover:bg-[#FAF7F2] transition-colors"
          >
            <Phone className="w-4 h-4 text-[#B8955A]" />
            <span>Call {settings?.phone || "+91 89035 75802"}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
