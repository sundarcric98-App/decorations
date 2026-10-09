import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkles, Search, ArrowRight, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Service, ServiceCategory } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'ALL';
  const [searchTerm, setSearchTerm] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['services-categories'],
    queryFn: () => api.get<ServiceCategory[]>('/services/categories'),
  });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services-list', selectedCategory, searchTerm],
    queryFn: () => {
      const categoryParam = selectedCategory !== 'ALL' ? `categorySlug=${selectedCategory}&` : '';
      const searchParam = searchTerm ? `search=${encodeURIComponent(searchTerm)}&` : '';
      return api.get<Service[]>(`/services?${categoryParam}${searchParam}`);
    },
  });

  const handleCategorySelect = (slug: string) => {
    if (slug === 'ALL') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="pt-28 pb-20 space-y-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <Badge variant="gold">Comprehensive Catalogue</Badge>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#24211F]">
          Our Wedding & Event Services
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#77716B]">
          Explore our complete range of specialized decor and event execution services across Tamil Nadu.
        </p>

        {/* Search & Category Filter Pills */}
        <div className="pt-6 max-w-4xl mx-auto space-y-6">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services (e.g. mandapam, photography, catering)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#E8E0D6] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8955A]/30 focus:border-[#B8955A] shadow-xs"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleCategorySelect('ALL')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                selectedCategory === 'ALL'
                  ? 'bg-[#B8955A] text-white shadow-luxury'
                  : 'bg-white text-[#56504A] border border-[#E8E0D6] hover:bg-[#FAF7F2]'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  selectedCategory === cat.slug
                    ? 'bg-[#B8955A] text-white shadow-luxury'
                    : 'bg-white text-[#56504A] border border-[#E8E0D6] hover:bg-[#FAF7F2]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <LoadingSpinner message="Loading services catalogue..." fullHeight />
        ) : services.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#E8E0D6]">
            <p className="text-sm text-[#77716B]">No services found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E8E0D6] shadow-sm hover:shadow-luxury hover:border-[#B8955A]/60 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-60 overflow-hidden bg-gray-100">
                    <img
                      src={service.coverImage}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#FAF7F2]/90 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-[#96743A] border border-[#EBDDBF]">
                      {service.category?.name || 'Decor Service'}
                    </div>
                    {service.isFeatured && (
                      <div className="absolute top-3 right-3 bg-[#B8955A] text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-lg font-bold text-[#24211F] group-hover:text-[#B8955A] transition-colors leading-snug">
                        {service.name}
                      </h3>
                    </div>

                    <p className="text-xs text-[#77716B] line-clamp-3 leading-relaxed">
                      {service.shortDesc}
                    </p>

                    {/* Price and pricing method */}
                    <div className="pt-2 border-t border-gray-100 flex items-baseline justify-between">
                      <span className="text-[11px] font-medium text-gray-400">Pricing</span>
                      <span className="text-sm font-bold text-[#B8955A]">
                        {service.startingPrice
                          ? `₹${Number(service.startingPrice).toLocaleString('en-IN')} (${service.pricingMethod})`
                          : service.pricingMethod || 'Custom Quotation'}
                      </span>
                    </div>

                    {/* Add-ons chips */}
                    {service.availableAddons && service.availableAddons.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {service.availableAddons.slice(0, 2).map((addon, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-[#FAF7F2] text-[#56504A] px-2 py-0.5 rounded-md border border-[#E8E0D6] flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-[#24845D]" /> {addon}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-6 pt-0 flex items-center gap-3">
                  <Link to={`/services/${service.slug}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Link to={`/book-event?service=${service.id}`} className="flex-1">
                    <Button variant="gold" size="sm" className="w-full">
                      Enquire Now
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
