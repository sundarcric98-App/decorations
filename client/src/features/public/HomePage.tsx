import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Phone,
  ShieldCheck,
  Clock,
  Award,
  ChevronRight,
  Camera,
  MapPin,
  Calendar,
  Layers,
  HeartHandshake,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { WhatsAppButton } from "../../components/common/WhatsAppButton";
import { useSettings } from "../../context/SettingsContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { EventCategory, PortfolioProject } from "../../types";

export const HomePage: React.FC = () => {
  const { settings } = useSettings();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch active categories from Supabase
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["public-categories"],
    queryFn: () => api.get<EventCategory[]>("/categories"),
  });

  // Fetch published portfolio projects from Supabase
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["public-portfolio-projects"],
    queryFn: () => api.get<PortfolioProject[]>("/portfolio?limit=8"),
  });

  const valueProps = [
    {
      icon: <Sparkles className="w-6 h-6 text-[#B8955A]" />,
      title: "South Indian Master Artistry",
      desc: "Bespoke temple mandapams, carved pillars, authentic fragrant florals, and majestic royal reception backdrops.",
    },
    {
      icon: <Clock className="w-6 h-6 text-[#B8955A]" />,
      title: "Guaranteed Punctual Setup",
      desc: "Our experienced crews complete all stage, entrance, and hall installations well ahead of auspicious rituals.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#B8955A]" />,
      title: "End-to-End Event Management",
      desc: "From sacred wedding stages to pre-wedding photography zones, traditional catering setups, and festive stalls.",
    },
    {
      icon: <Award className="w-6 h-6 text-[#B8955A]" />,
      title: "Transparent WhatsApp Booking",
      desc: "Instant direct consultations via WhatsApp with customized design ideas, transparent pricing, and zero hidden costs.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#28231F] selection:bg-[#B8955A]/20 selection:text-[#B8955A]">
      {/* ---------------------------------------------------------------------- */}
      {/* 1. HERO SECTION                                                        */}
      {/* ---------------------------------------------------------------------- */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20 pb-16">
        {/* Background Image with Elegant Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85"
            alt="Sathuragiri Luxury Wedding Decoration Stage"
            className="w-full h-full object-cover object-center scale-105 animate-in fade-in zoom-in-105 duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816] via-[#1A1816]/75 to-[#1A1816]/50" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#1A1816]/40 to-[#1A1816]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-8 sm:py-12">
          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.15] drop-shadow-md">
            Every Celebration, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ECD7B5] via-[#B8955A] to-[#D4B77D] italic">
              Beautifully Crafted.
            </span>
          </h1>

          {/* Business Introduction */}
          <p className="max-w-3xl mx-auto text-base sm:text-xl text-[#ECE7DF] leading-relaxed mb-10 font-sans font-light drop-shadow">
            South India’s premier luxury wedding & celebration designers. We
            craft majestic South Indian temple mandapams, regal reception
            stages, joyful baby showers, and unforgettable celebrations with
            breathtaking floral artistry.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <WhatsAppButton
              size="lg"
              variant="hero"
              label="Chat on WhatsApp"
              className="w-full sm:w-auto shadow-2xl"
            />

            <Link to="/portfolio" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/60 text-white hover:bg-white/10 backdrop-blur-sm px-7 py-3.5 rounded-full text-base font-medium"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Explore Portfolio
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 pt-8 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#E6D5B8]">
                500+
              </p>
              <p className="text-xs text-[#CFCAC2] uppercase tracking-wider mt-1">
                Weddings Crafted
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#E6D5B8]">
                9+
              </p>
              <p className="text-xs text-[#CFCAC2] uppercase tracking-wider mt-1">
                Event Categories
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#E6D5B8]">
                100%
              </p>
              <p className="text-xs text-[#CFCAC2] uppercase tracking-wider mt-1">
                Punctual Execution
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#E6D5B8]">
                5.0 ★
              </p>
              <p className="text-xs text-[#CFCAC2] uppercase tracking-wider mt-1">
                Customer Reviews
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. FEATURED EVENT CATEGORIES (SUPABASE DRIVEN)                          */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#B8955A] font-semibold text-xs uppercase tracking-widest block mb-2">
              Our Event Specializations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#28231F] mb-4">
              Featured Event Services
            </h2>
            <p className="text-[#77716B] text-base leading-relaxed">
              Explore our wide array of bespoke decoration services, each
              thoughtfully designed to reflect South Indian tradition, regal
              grandeur, and contemporary elegance.
            </p>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 rounded-2xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF7F2] rounded-2xl border border-[#E8E0D6] p-8">
              <Layers className="w-12 h-12 text-[#B8955A] mx-auto mb-3" />
              <p className="font-serif text-xl font-bold text-[#28231F]">
                No Categories Published Yet
              </p>
              <p className="text-sm text-[#77716B] mt-1">
                Active categories will be presented here as soon as they are
                added.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="group relative bg-[#FAF7F2] rounded-2xl overflow-hidden border border-[#E8E0D6] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Category Image Cover */}
                  <div className="relative h-64 overflow-hidden bg-gray-200">
                    <img
                      src={
                        cat.cover_image_url ||
                        cat.coverImage ||
                        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={cat.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-serif text-xl font-bold text-white tracking-wide">
                        {cat.name}
                      </h3>
                      {cat.projectCount !== undefined &&
                        cat.projectCount > 0 && (
                          <span className="text-xs text-[#E6D5B8] font-medium">
                            {cat.projectCount} Completed Projects
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Category Details & Actions */}
                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <p className="text-sm text-[#77716B] leading-relaxed line-clamp-3 mb-6">
                      {cat.description ||
                        "Exquisitely designed stage decorations, floral concepts, and ambient styling for your celebration."}
                    </p>

                    <div className="flex items-center gap-3 pt-4 border-t border-[#E8E0D6]">
                      <Link
                        to={`/portfolio?category=${cat.slug}`}
                        className="flex-1 text-center py-2 px-3 rounded-xl border border-[#B8955A] text-[#B8955A] hover:bg-[#B8955A] hover:text-white text-xs font-semibold tracking-wide transition-all"
                      >
                        View Gallery
                      </Link>

                      <WhatsAppButton
                        size="sm"
                        categoryName={cat.name}
                        label="Enquire"
                        className="flex-1 py-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/services">
              <Button
                variant="outline"
                size="md"
                rightIcon={<ChevronRight className="w-4 h-4" />}
                className="border-[#B8955A] text-[#B8955A] hover:bg-[#B8955A] hover:text-white"
              >
                View All Categories & Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. RECENTLY COMPLETED DECORATION PROJECTS (SUPABASE PORTFOLIO)         */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div className="max-w-2xl">
              <span className="text-[#B8955A] font-semibold text-xs uppercase tracking-widest block mb-2">
                Real Celebrations Showcase
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#28231F] mb-4">
                Recently Completed Projects
              </h2>
              <p className="text-[#77716B] text-base leading-relaxed">
                Take inspiration from our recently decorated weddings, grand
                receptions, traditional ceremonies, and celebratory stages.
              </p>
            </div>

            <div className="mt-6 md:mt-0">
              <Link to="/portfolio">
                <Button
                  variant="gold"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Full Portfolio Gallery
                </Button>
              </Link>
            </div>
          </div>

          {projectsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E0D6] p-8">
              <Camera className="w-12 h-12 text-[#B8955A] mx-auto mb-3" />
              <p className="font-serif text-xl font-bold text-[#28231F]">
                No Projects Available
              </p>
              <p className="text-sm text-[#77716B] mt-1">
                Completed decoration works will appear here as soon as they are
                published.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {projects.slice(0, 8).map((proj) => (
                <div
                  key={proj.id}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-[#E8E0D6] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Project Image */}
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img
                      src={
                        proj.cover_image_url ||
                        proj.coverImage ||
                        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={proj.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                      onClick={() =>
                        setSelectedImage(
                          proj.cover_image_url ||
                            proj.coverImage ||
                            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
                        )
                      }
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white tracking-wide">
                        {proj.categoryName || "Decoration"}
                      </span>
                    </div>
                  </div>

                  {/* Project Body */}
                  <div className="p-5 flex flex-col justify-between flex-grow">
                    <div>
                      <Link to={`/portfolio/${proj.slug}`}>
                        <h3 className="font-serif text-lg font-bold text-[#28231F] hover:text-[#B8955A] transition-colors line-clamp-1 mb-2">
                          {proj.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#77716B] line-clamp-2 mb-4 leading-relaxed">
                        {proj.description ||
                          "Crafted with passion, traditional elegance, and meticulous floral arrangements."}
                      </p>
                      {proj.location && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                          <MapPin className="w-3.5 h-3.5 text-[#B8955A]" />
                          <span>{proj.location}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#E8E0D6] flex items-center justify-between gap-2">
                      <Link
                        to={`/portfolio/${proj.slug}`}
                        className="text-xs text-[#28231F] font-semibold hover:text-[#B8955A] transition-colors"
                      >
                        View Photos →
                      </Link>

                      <WhatsAppButton
                        size="sm"
                        projectTitle={proj.title}
                        categoryName={proj.categoryName}
                        label="Enquire"
                        className="py-1 px-3 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 4. WHY CHOOSE SATHURAGIRI DECORATION                                   */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-20 bg-white border-y border-[#E8E0D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#B8955A] font-semibold text-xs uppercase tracking-widest block mb-2">
              The Sathuragiri Promise
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#28231F] mb-4">
              Why Couples & Families Choose Us
            </h2>
            <p className="text-[#77716B] text-base leading-relaxed">
              We treat every wedding and function as our own family milestone.
              Here is why clients trust us across Tamil Nadu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueProps.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#FAF7F2] p-8 rounded-2xl border border-[#E8E0D6] shadow-xs hover:border-[#B8955A] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-[#E8E0D6] flex items-center justify-center mb-5 shadow-xs">
                  {item.icon}
                </div>
                <h3 className="font-serif text-lg font-bold text-[#28231F] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#77716B] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 5. ABOUT SATHURAGIRI DECORATION HIGHLIGHT                             */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Collage */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80"
                  alt="Royal Wedding Stage Craftsmanship"
                  className="w-full h-[450px] object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="font-serif text-xl font-bold">
                    Divine Mandapams & Royal Stages
                  </p>
                  <p className="text-xs text-[#E6D5B8] mt-1">
                    Madurai • Rajapalayam • Tamil Nadu
                  </p>
                </div>
              </div>

              {/* Decorative Floating Card */}
              <div className="absolute -bottom-6 -right-4 sm:right-6 bg-white p-5 rounded-2xl shadow-xl border border-[#E8E0D6] max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#B8955A]/10 flex items-center justify-center text-[#B8955A]">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#28231F] uppercase tracking-wider">
                      Trusted by Families
                    </p>
                    <p className="text-xs text-[#77716B]">
                      10+ Years of Craftsmanship
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="space-y-6">
              <span className="text-[#B8955A] font-semibold text-xs uppercase tracking-widest">
                About Sathuragiri Decoration
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#28231F] leading-tight">
                Honoring Traditions with Unrivaled Grandeur
              </h2>
              <p className="text-base text-[#77716B] leading-relaxed">
                {settings?.about_text ||
                  "At Sathuragiri Decoration, we transform your most cherished milestones into timeless memories. Rooted in South Indian heritage and elevated by contemporary artistry, our master craftsmen create bespoke wedding mandaps, reception stages, floral masterpieces, and memorable festive ambiances."}
              </p>
              <p className="text-sm text-[#77716B] leading-relaxed">
                From auspicious Muhurtham temple setups in Madurai to opulent
                reception halls in Rajapalayam and surrounding districts, we
                ensure your family and guests are immersed in grandeur and
                warmth.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <WhatsAppButton
                  size="md"
                  label="Talk to our Wedding Stylist"
                  className="w-full sm:w-auto"
                />
                <Link to="/about" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full sm:w-auto"
                  >
                    Learn More About Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 6. WHATSAPP ENQUIRY CALL TO ACTION BANNER                              */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-16 bg-gradient-to-r from-[#28231F] via-[#1E1B19] to-[#28231F] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B8955A]/20 border border-[#B8955A]/40 text-xs font-semibold uppercase tracking-widest text-[#E6D5B8]">
            <Sparkles className="w-3.5 h-3.5 text-[#B8955A]" />
            Direct WhatsApp Enquiry
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Planning Your Dream Celebration?
          </h2>

          <p className="max-w-2xl mx-auto text-[#CECDCC] text-base sm:text-lg leading-relaxed font-light">
            Contact us directly on WhatsApp with your event date and venue
            details. We will share curated design concepts, stage photographs,
            and a customized quotation promptly.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <WhatsAppButton
              size="lg"
              variant="hero"
              label="Start WhatsApp Enquiry Now"
              className="w-full sm:w-auto shadow-2xl"
            />
            <a
              href={`tel:${settings?.phone || "+9189035 75802"}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-white/30 text-white hover:bg-white/10 text-base font-medium transition-all w-full sm:w-auto"
            >
              <Phone className="w-4 h-4 text-[#B8955A]" />
              <span>Call Us: {settings?.phone || "+91 98421 87654"}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* IMAGE LIGHTBOX MODAL                                                   */}
      {/* ---------------------------------------------------------------------- */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img
              src={selectedImage}
              alt="Decoration Preview"
              className="max-h-[85vh] w-auto mx-auto object-contain rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
