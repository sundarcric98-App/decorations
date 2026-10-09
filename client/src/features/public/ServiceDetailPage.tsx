import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Service } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Sparkles, CheckCircle2, ArrowLeft, Phone, Calendar, ShieldCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: service, isLoading, isError } = useQuery({
    queryKey: ['service-detail', slug],
    queryFn: () => api.get<Service>(`/services/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading service details..." fullHeight />;
  }

  if (isError || !service) {
    return (
      <div className="pt-32 pb-20 text-center max-w-lg mx-auto space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#24211F]">Service Not Found</h2>
        <p className="text-sm text-[#77716B]">The service you are looking for might have been archived or moved.</p>
        <Link to="/services">
          <Button variant="gold" size="md">
            Back to Services
          </Button>
        </Link>
      </div>
    );
  }

  const galleryImages = [service.coverImage, ...(service.images || [])].filter(Boolean);

  return (
    <div className="pt-28 pb-20 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#77716B] hover:text-[#B8955A] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Services
      </button>

      {/* Main Grid: Gallery on left, Service info on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl overflow-hidden shadow-luxury border border-[#E8E0D6] bg-black/5 aspect-4/3 relative">
            <img
              src={galleryImages[activeImageIndex] || service.coverImage}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          </div>

          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx
                      ? 'border-[#B8955A] shadow-md scale-105'
                      : 'border-[#E8E0D6] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info & Booking Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <Badge variant="gold">{service.category?.name || 'Event Decoration'}</Badge>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#24211F] leading-tight">
              {service.name}
            </h1>
            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-xs uppercase font-bold text-[#77716B]">Estimated Price:</span>
              <span className="font-serif text-2xl font-bold text-[#B8955A]">
                {service.startingPrice
                  ? `₹${Number(service.startingPrice).toLocaleString('en-IN')}`
                  : 'Custom Quote'}
              </span>
              <span className="text-xs text-[#77716B] font-medium">({service.pricingMethod})</span>
            </div>
          </div>

          <div className="prose prose-sm text-[#56504A] leading-relaxed border-t border-b border-[#E8E0D6] py-4">
            <p>{service.detailedDesc || service.shortDesc}</p>
          </div>

          {/* Add-ons & Inclusions */}
          {service.availableAddons && service.availableAddons.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#24211F]">
                Popular Upgrades & Optional Add-ons:
              </h4>
              <ul className="space-y-2">
                {service.availableAddons.map((addon, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-[#56504A]">
                    <CheckCircle2 className="w-4 h-4 text-[#24845D] shrink-0 mt-0.5" />
                    <span>{addon}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Guarantee Badges */}
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBDDBF] space-y-2 text-xs text-[#56504A]">
            <div className="flex items-center gap-2 font-semibold text-[#24211F]">
              <ShieldCheck className="w-4 h-4 text-[#B8955A]" />
              <span>Sathuragiri Service Guarantee</span>
            </div>
            <p className="text-[11px] text-[#77716B] leading-normal">
              Includes on-site supervisor, dedicated floral & lighting technicians, and completion 4 hours prior to rituals.
            </p>
          </div>

          {/* CTA Box */}
          <div className="pt-2 space-y-3">
            <Link to={`/book-event?service=${service.id}`} className="block w-full">
              <Button variant="gold" size="lg" className="w-full" leftIcon={<Sparkles className="w-4 h-4" />}>
                Request a Quote for This Service
              </Button>
            </Link>
            <a
              href={`tel:${settings?.phone || '+919842187654'}`}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-[#E8E0D6] text-xs font-semibold text-[#24211F] hover:bg-[#FAF7F2] transition-colors"
            >
              <Phone className="w-4 h-4 text-[#B8955A]" />
              Speak with Event Decorator: {settings?.phone || '+91 98421 87654'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
