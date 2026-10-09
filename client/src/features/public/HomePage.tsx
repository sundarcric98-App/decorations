import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Phone,
  MessageSquare,
  ShieldCheck,
  Clock,
  Award,
  ChevronRight,
  Plus,
  Minus,
  Star,
  Camera,
  Utensils,
  Lightbulb,
  Music,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useSettings } from '../../context/SettingsContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Service, ServiceCategory, PortfolioProject, Package } from '../../types';

export const HomePage: React.FC = () => {
  const { settings } = useSettings();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Fetch featured services, categories, packages, and portfolio from backend
  const { data: categories = [] } = useQuery({
    queryKey: ['public-categories'],
    queryFn: () => api.get<ServiceCategory[]>('/services/categories'),
  });

  const { data: featuredServices = [] } = useQuery({
    queryKey: ['public-featured-services'],
    queryFn: () => api.get<Service[]>('/services?featured=true'),
  });

  const { data: featuredProjects = [] } = useQuery({
    queryKey: ['public-featured-portfolio'],
    queryFn: () => api.get<PortfolioProject[]>('/portfolio?featured=true'),
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['public-packages'],
    queryFn: () => api.get<Package[]>('/packages'),
  });

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Submit Enquiry',
      desc: 'Share your event date, venue, guest count, and decor inspiration with us online or via WhatsApp.',
    },
    {
      step: '02',
      title: 'Free Consultation',
      desc: 'Discuss thematic concepts, flower choices, and venue layout with our senior wedding stylist.',
    },
    {
      step: '03',
      title: 'Custom Quotation',
      desc: 'Receive a transparent, itemized quotation tailored to your exact preferences and budget.',
    },
    {
      step: '04',
      title: 'Confirmation & Planning',
      desc: 'Lock in your auspicious date with an advance deposit while our master artisans begin preparations.',
    },
    {
      step: '05',
      title: 'Flawless Execution',
      desc: 'Our dedicated crew sets up 4-6 hours prior to the rituals, ensuring a breathtaking celebration.',
    },
  ];

  const whyChooseUs = [
    {
      icon: <Sparkles className="w-6 h-6 text-[#B8955A]" />,
      title: 'Traditional Temple Craftsmanship',
      desc: 'Sculpted temple pillar mandapams, lotus sanctums, and fragrant fresh flower hangings rooted in South Indian traditions.',
    },
    {
      icon: <Clock className="w-6 h-6 text-[#B8955A]" />,
      title: '100% Punctual Setup Guarantee',
      desc: 'Our logistics and floral crews complete all stage and entrance fabrications well before the auspicious Muhurtham hours.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#B8955A]" />,
      title: 'A-to-Z End-to-End Solutions',
      desc: 'From sacred mandapams to 4K drone cinematography, traditional 24-item leaf feasts, and live stalls, everything under one roof.',
    },
    {
      icon: <Award className="w-6 h-6 text-[#B8955A]" />,
      title: 'Transparent Itemized Pricing',
      desc: 'No hidden surcharges. Receive clear line-item breakdowns, tax details, and structured milestone payments.',
    },
  ];

  const faqs = [
    {
      q: 'How far in advance should we book Sathuragiri Decoration for our wedding?',
      a: 'For auspicious wedding season dates (Muhurtham days), we strongly recommend booking 2 to 6 months in advance to reserve our master artisans and equipment. For birthdays and intimate functions, 2 to 3 weeks notice is usually sufficient.',
    },
    {
      q: 'Do you take event decoration contracts outside Madurai?',
      a: 'Yes! While we are headquartered in Madurai, our teams regularly execute destination weddings and grand receptions across Tamil Nadu including Chennai, Coimbatore, Trichy, Tirunelveli, Dindigul, and Karaikudi.',
    },
    {
      q: 'Can we customize stage dimensions and fresh flower choices?',
      a: 'Absolutely. Every stage, mandapam, and entrance is customized to your venue’s specific height and width. You can choose from fresh Madurai jasmine (Malli), Bangalore roses, Dutch orchids, carnations, or traditional marigolds.',
    },
    {
      q: 'What is the standard payment and advance schedule?',
      a: 'Our standard schedule is 30% advance on booking confirmation to block dates, 50% payable 2 days before the event when materials are prepped, and the final 20% balance settled on the event day after completion.',
    },
    {
      q: 'Do you handle catering and photography as well?',
      a: 'Yes. Sathuragiri Decoration provides complete A-to-Z wedding services including traditional 24-item banana leaf feasts, live chaat/dosa counters, candid photography, 4K cinematic wedding films, drone coverage, and smart lighting setups.',
    },
  ];

  const sampleTestimonials = [
    {
      name: 'Dr. Karthik & Dr. Divya',
      event: 'Traditional Temple Wedding, Madurai',
      quote:
        'Sathuragiri Decoration brought divine beauty to our marriage. The fresh Madurai jasmine mandapam smelled heavenly and looked like a palace temple. Every guest was awestruck!',
      rating: 5,
    },
    {
      name: 'Vigneshwaran & Pooja',
      event: 'Grand Reception, Coimbatore',
      quote:
        'The 40ft floral wall and chandelier stage were beyond expectations. Extremely professional team, completed setup 5 hours before the reception. Truly unforgettable!',
      rating: 5,
    },
    {
      name: 'Annamalai Chettiar',
      event: 'Family Betrothal & Engagement',
      quote:
        'Transparent pricing and no last-minute hassles. They coordinated both the decor and the traditional leaf feast catering flawlessly. Highly recommended!',
      rating: 5,
    },
  ];

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
        {/* Background Image with warm luxury overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85"
            alt="Royal South Indian Wedding Decor"
            className="w-full h-full object-cover object-center scale-105 animate-pulse duration-[10000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1816]/90 via-[#1A1816]/75 to-[#1A1816]/60 backdrop-blur-[1.5px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#1A1816]/40 to-[#1A1816]/95" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B8955A]/20 border border-[#B8955A]/40 text-[#D4B77D] text-xs font-semibold tracking-widest uppercase animate-in fade-in slide-in-from-top-4 duration-700">
            <Sparkles className="w-3.5 h-3.5" />
            {settings?.tagline || 'Every Celebration, Beautifully Crafted'}
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-white">
            We Make Your Special Moments{' '}
            <span className="gold-gradient-text block sm:inline italic">Unforgettable</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[#CECDCC] font-light leading-relaxed">
            South India’s premier full-service wedding planners & decorators. Royal temple mandapams, starlit reception stages, authentic banana leaf feasts, and 4K cinema films crafted with timeless elegance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/services" className="w-full sm:w-auto">
              <Button
                variant="gold"
                size="lg"
                className="w-full sm:w-auto text-base"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Explore Our Services
              </Button>
            </Link>
            <Link to="/book-event" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto text-base bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
              >
                Get a Free Quote
              </Button>
            </Link>
          </div>

          {/* Quick highlight bar */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-white/15 text-left">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
              <div className="text-xl font-bold font-serif text-[#D4B77D]">100%</div>
              <div className="text-[11px] text-gray-300 font-medium uppercase tracking-wider">Fresh Flowers</div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
              <div className="text-xl font-bold font-serif text-[#D4B77D]">A to Z</div>
              <div className="text-[11px] text-gray-300 font-medium uppercase tracking-wider">Event Services</div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
              <div className="text-xl font-bold font-serif text-[#D4B77D]">Custom</div>
              <div className="text-[11px] text-gray-300 font-medium uppercase tracking-wider">3D Stage Layouts</div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
              <div className="text-xl font-bold font-serif text-[#D4B77D]">On-Time</div>
              <div className="text-[11px] text-gray-300 font-medium uppercase tracking-wider">Setup Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED SERVICE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <Badge variant="gold">Our Core Offerings</Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#24211F]">
            Everything for Your Grand Celebration
          </h2>
          <p className="text-sm sm:text-base text-[#77716B]">
            From sacred rituals to opulent evening receptions, we provide turnkey event solutions tailored to traditional and modern sensibilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              to={`/services?category=${cat.slug}`}
              className="group relative h-80 rounded-2xl overflow-hidden shadow-sm border border-[#E8E0D6] hover:shadow-luxury hover:border-[#B8955A]/50 transition-all duration-300"
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816]/90 via-[#1A1816]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#D4B77D] transition-colors flex items-center justify-between">
                  <span>{cat.name}</span>
                  <ChevronRight className="w-4 h-4 text-[#B8955A] group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                  {cat.description || 'Customized decor arrangements crafted for your special day.'}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/services">
            <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All 15+ Service Categories
            </Button>
          </Link>
        </div>
      </section>

      {/* 3. FROM PLANNING TO CELEBRATION (FULL SERVICE SPECTRUM) */}
      <section className="bg-white py-20 border-y border-[#E8E0D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="gold">A-to-Z Event Solutions</Badge>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#24211F] leading-tight">
                From Sacred Rituals to Majestic Revelry
              </h2>
              <p className="text-sm sm:text-base text-[#77716B] leading-relaxed">
                Why juggle ten different contractors when Sathuragiri Decoration manages the entire tapestry of your event? Our seasoned in-house production crew orchestrates every detail with artistic flair and military precision.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  { icon: <Sparkles className="w-4 h-4 text-[#B8955A]" />, text: 'Sacred Muhurtham Mandapams' },
                  { icon: <Sparkles className="w-4 h-4 text-[#B8955A]" />, text: 'Opulent Reception Stages' },
                  { icon: <Sparkles className="w-4 h-4 text-[#B8955A]" />, text: 'Haldi & Sangeet Sets' },
                  { icon: <Camera className="w-4 h-4 text-[#B8955A]" />, text: '4K Drone & Candid Cinema' },
                  { icon: <Utensils className="w-4 h-4 text-[#B8955A]" />, text: 'Authentic Leaf Feasts & Stalls' },
                  { icon: <Lightbulb className="w-4 h-4 text-[#B8955A]" />, text: 'Ambient Lighting & Trussing' },
                  { icon: <Sparkles className="w-4 h-4 text-[#B8955A]" />, text: 'Floral Tunnels & Gateways' },
                  { icon: <Music className="w-4 h-4 text-[#B8955A]" />, text: 'Audio-Visuals & Pyro Sparklers' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6]">
                    {item.icon}
                    <span className="text-xs font-semibold text-[#24211F]">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link to="/book-event">
                  <Button variant="gold" size="md">
                    Request Custom Event Plan
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="ghost" size="md">
                    Learn Our Story →
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual Collage */}
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80"
                alt="Stage Decor"
                className="rounded-2xl shadow-luxury object-cover h-64 w-full"
              />
              <img
                src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
                alt="Haldi Decor"
                className="rounded-2xl shadow-luxury object-cover h-64 w-full mt-6"
              />
              <img
                src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80"
                alt="Catering Feast"
                className="rounded-2xl shadow-luxury object-cover h-64 w-full"
              />
              <img
                src="https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80"
                alt="Candid Photography"
                className="rounded-2xl shadow-luxury object-cover h-64 w-full mt-6"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. PACKAGES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <Badge variant="gold">Curated Collections</Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#24211F]">
            Transparent Wedding & Event Packages
          </h2>
          <p className="text-sm sm:text-base text-[#77716B]">
            Choose from our pre-designed luxury wedding packages or customize every element to match your venue and style.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.slice(0, 3).map((pkg) => (
            <Card
              key={pkg.id}
              variant={pkg.isFeatured ? 'bordered' : 'default'}
              className={`flex flex-col justify-between p-8 relative ${
                pkg.isFeatured ? 'bg-white shadow-luxury-lg' : 'bg-[#FAF7F2]'
              }`}
            >
              {pkg.isFeatured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#B8955A] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#24211F]">{pkg.name}</h3>
                  <p className="text-xs text-[#77716B] mt-1.5 leading-relaxed">{pkg.description}</p>
                </div>

                <div className="py-3 border-y border-[#E8E0D6]">
                  <span className="text-xs text-[#77716B] uppercase font-semibold">Starting From</span>
                  <div className="font-serif text-2xl font-bold text-[#B8955A]">
                    {pkg.packagePrice ? `₹${Number(pkg.packagePrice).toLocaleString('en-IN')}` : 'Custom Quote'}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase text-[#24211F] tracking-wider block">
                    What's Included:
                  </span>
                  <ul className="space-y-2 text-xs text-[#56504A]">
                    {(pkg.includedServices || []).slice(0, 5).map((serviceName, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#24845D] shrink-0 mt-0.5" />
                        <span>{serviceName}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link to={`/book-event?package=${pkg.slug}`} className="w-full block">
                  <Button
                    variant={pkg.isFeatured ? 'gold' : 'secondary'}
                    size="md"
                    className="w-full"
                  >
                    Select This Package
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/packages">
            <Button variant="ghost" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Full Packages & Custom Add-ons
            </Button>
          </Link>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="bg-[#FAF7F2] py-20 border-y border-[#E8E0D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <Badge variant="gold">Seamless Process</Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#24211F]">
              How We Bring Your Vision to Life
            </h2>
            <p className="text-sm text-[#77716B]">
              A stress-free, 5-stage collaborative journey from initial consultation to final event celebration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {howItWorksSteps.map((s, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-[#E8E0D6] space-y-3 relative shadow-xs hover:border-[#B8955A] transition-colors">
                <div className="font-serif text-2xl font-bold text-[#B8955A]">{s.step}</div>
                <h3 className="font-serif text-base font-bold text-[#24211F]">{s.title}</h3>
                <p className="text-xs text-[#77716B] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FEATURED REAL WEDDINGS & PORTFOLIO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <Badge variant="gold">Visual Gallery</Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#24211F]">
              Recent Celebrations Crafted by Sathuragiri
            </h2>
          </div>
          <Link to="/portfolio">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View Full Gallery
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProjects.slice(0, 3).map((proj) => (
            <Link
              key={proj.id}
              to={`/portfolio/${proj.slug}`}
              className="group rounded-2xl overflow-hidden bg-white border border-[#E8E0D6] shadow-sm hover:shadow-luxury transition-all duration-300 flex flex-col"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={proj.coverImage}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#FAF7F2]/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold text-[#96743A] border border-[#EBDDBF]">
                  {proj.category}
                </div>
              </div>
              <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#24211F] group-hover:text-[#B8955A] transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-[#77716B] line-clamp-2 mt-1 leading-relaxed">
                    {proj.description}
                  </p>
                </div>
                {proj.location && (
                  <p className="text-[11px] font-semibold text-[#B8955A] pt-2 border-t border-gray-100">
                    📍 {proj.location}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. WHY CHOOSE US */}
      <section className="bg-white py-20 border-y border-[#E8E0D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <Badge variant="gold">Why Sathuragiri</Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#24211F]">
              The Gold Standard in Event Planning
            </h2>
            <p className="text-sm text-[#77716B]">
              Rooted in rich heritage and elevated by modern aesthetics and flawless execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((w, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D6] space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#EBDDBF] flex items-center justify-center shadow-xs">
                  {w.icon}
                </div>
                <h3 className="font-serif text-base font-bold text-[#24211F]">{w.title}</h3>
                <p className="text-xs text-[#77716B] leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CLIENT TESTIMONIALS (CLEARLY MARKED SAMPLE DEMO REVIEWS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <Badge variant="gold">Client Stories</Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#24211F]">
            Loved by Families Across South India
          </h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
            (Sample demonstration customer experiences)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sampleTestimonials.map((t, idx) => (
            <Card key={idx} className="p-6 flex flex-col justify-between bg-white space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#B8955A]">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#56504A] italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <h4 className="font-serif text-sm font-bold text-[#24211F]">{t.name}</h4>
                <p className="text-[11px] text-[#77716B]">{t.event}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 9. FAQS ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="gold">Got Questions?</Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#24211F]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#E8E0D6] overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-serif text-sm sm:text-base font-bold text-[#24211F] hover:text-[#B8955A] transition-colors"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? (
                  <Minus className="w-4 h-4 text-[#B8955A] shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-5 text-xs sm:text-sm text-[#77716B] leading-relaxed border-t border-gray-100 pt-3 animate-in fade-in duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#24211F] via-[#2E2A27] to-[#1A1816] text-white p-10 sm:p-16 text-center shadow-2xl border border-[#B8955A]/30 space-y-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4B77D] block">
              Let's Begin Planning Your Special Day
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Ready to Craft an Unforgettable Event?
            </h2>
            <p className="text-sm sm:text-base text-[#CECDCC] font-light">
              Connect with Sathuragiri Decoration today for a complimentary venue layout consultation and detailed customized quotation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/book-event">
              <Button variant="gold" size="lg" leftIcon={<Sparkles className="w-4 h-4" />}>
                Book Free Consultation Now
              </Button>
            </Link>
            <a href={`tel:${settings?.phone || '+919842187654'}`}>
              <Button
                variant="secondary"
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                leftIcon={<Phone className="w-4 h-4 text-[#B8955A]" />}
              >
                Call {settings?.phone || '+91 98421 87654'}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
