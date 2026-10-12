import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Search, Layers } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { EventCategory } from '../../types';
import { WhatsAppButton } from '../../components/common/WhatsAppButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ServicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['public-categories'],
    queryFn: () => api.get<EventCategory[]>('/categories'),
  });

  const filteredCategories = categories.filter((cat) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      cat.name.toLowerCase().includes(term) ||
      (cat.description && cat.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#FAF7F2]">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B8955A]/10 border border-[#B8955A]/30 text-xs font-semibold uppercase tracking-widest text-[#B8955A]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sathuragiri Specializations</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#28231F]">
          Event Decoration Services
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#77716B] leading-relaxed">
          From grand South Indian wedding mandapams and royal reception stages to intimate birthday celebrations and traditional ceremonies, explore our bespoke decoration portfolios.
        </p>

        {/* Search Bar */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category or service (e.g. Wedding, Birthday, Mandapam)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#E8E0D6] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8955A]/30 focus:border-[#B8955A] shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E0D6] max-w-lg mx-auto p-8 shadow-xs">
            <Layers className="w-12 h-12 text-[#B8955A] mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-[#28231F]">No Event Categories Found</h3>
            <p className="text-sm text-[#77716B] mt-1">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Categories will be displayed once published.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E8E0D6] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Category Cover Image */}
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={
                      cat.cover_image_url ||
                      cat.coverImage ||
                      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={cat.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="font-serif text-xl font-bold text-white tracking-wide">
                      {cat.name}
                    </h2>
                    {cat.projectCount !== undefined && cat.projectCount > 0 && (
                      <span className="text-xs text-[#E6D5B8] font-medium">
                        {cat.projectCount} Showcase Project{cat.projectCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <p className="text-sm text-[#77716B] leading-relaxed line-clamp-3 mb-6">
                    {cat.description ||
                      'Expertly customized theme decoration, floral arrangements, and stage backdrop styling for your event.'}
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-[#E8E0D6]">
                    <Link
                      to={`/portfolio?category=${cat.slug}`}
                      className="flex-1 text-center py-2.5 px-3 rounded-xl border border-[#B8955A] text-[#B8955A] hover:bg-[#B8955A] hover:text-white text-xs font-semibold tracking-wide transition-all shadow-2xs"
                    >
                      View Gallery
                    </Link>

                    <WhatsAppButton
                      size="sm"
                      categoryName={cat.name}
                      label="Enquire on WhatsApp"
                      className="flex-1 py-2.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
