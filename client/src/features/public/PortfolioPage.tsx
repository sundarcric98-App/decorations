import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { PortfolioProject, EventCategory } from '../../types';
import { WhatsAppButton } from '../../components/common/WhatsAppButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search, MapPin, Calendar as CalendarIcon, Camera, X, Sparkles, Eye } from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchTerm, setSearchTerm] = useState('');
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Sync category state from URL query param
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  // Fetch active categories from Supabase
  const { data: categories = [] } = useQuery({
    queryKey: ['public-categories'],
    queryFn: () => api.get<EventCategory[]>('/categories'),
  });

  // Fetch published portfolio projects filtered by category & search
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['public-portfolio-projects', selectedCategory, searchTerm],
    queryFn: () => {
      const catQuery = selectedCategory !== 'All' ? `category=${encodeURIComponent(selectedCategory)}&` : '';
      const searchQuery = searchTerm ? `search=${encodeURIComponent(searchTerm)}&` : '';
      return api.get<PortfolioProject[]>(`/portfolio?${catQuery}${searchQuery}`);
    },
  });

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    if (slug === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#FAF7F2]">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B8955A]/10 border border-[#B8955A]/30 text-xs font-semibold uppercase tracking-widest text-[#B8955A]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real Decoration Portfolio</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#28231F]">
          Completed Projects Gallery
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#77716B] leading-relaxed">
          Browse photographs from our completed South Indian weddings, mandapams, receptions, traditional functions, and joyous celebrations.
        </p>

        {/* Search & Dynamic Category Filters */}
        <div className="pt-6 max-w-4xl mx-auto space-y-6">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, location or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#E8E0D6] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8955A]/30 focus:border-[#B8955A] shadow-xs"
            />
          </div>

          {/* Category Pill Filters (Supabase-backed) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => handleCategoryChange('All')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === 'All'
                  ? 'bg-[#B8955A] text-white shadow-md'
                  : 'bg-white text-[#28231F] border border-[#E8E0D6] hover:border-[#B8955A]'
              }`}
            >
              All Celebrations
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-[#B8955A] text-white shadow-md'
                    : 'bg-white text-[#28231F] border border-[#E8E0D6] hover:border-[#B8955A]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E8E0D6] max-w-md mx-auto p-8 shadow-xs">
            <Camera className="w-12 h-12 text-[#B8955A] mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-[#28231F]">No Projects Found</h3>
            <p className="text-sm text-[#77716B] mt-1 leading-relaxed">
              {searchTerm || selectedCategory !== 'All'
                ? 'No published projects match your selected filters. Try viewing all categories.'
                : 'Projects will be shown here once published.'}
            </p>
            {(selectedCategory !== 'All' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchTerm('');
                  searchParams.delete('category');
                  setSearchParams(searchParams);
                }}
                className="mt-5 text-xs font-bold text-[#B8955A] hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((proj) => {
              const coverImg =
                proj.cover_image_url ||
                proj.coverImage ||
                'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';

              return (
                <div
                  key={proj.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#E8E0D6] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Project Image Frame */}
                  <div className="relative h-60 overflow-hidden bg-gray-100">
                    <img
                      src={coverImg}
                      alt={proj.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 cursor-pointer"
                      onClick={() => setLightboxImage({ url: coverImg, title: proj.title })}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                      <button
                        onClick={() => setLightboxImage({ url: coverImg, title: proj.title })}
                        className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black text-xs flex items-center gap-1 backdrop-blur-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                      <Link
                        to={`/portfolio/${proj.slug}`}
                        className="text-xs text-white hover:underline font-semibold"
                      >
                        View Project →
                      </Link>
                    </div>

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-[11px] font-semibold text-white tracking-wide">
                        {proj.categoryName || 'Decoration'}
                      </span>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="p-5 flex flex-col justify-between flex-grow">
                    <div>
                      <Link to={`/portfolio/${proj.slug}`}>
                        <h2 className="font-serif text-lg font-bold text-[#28231F] hover:text-[#B8955A] transition-colors line-clamp-1 mb-1.5">
                          {proj.title}
                        </h2>
                      </Link>

                      <p className="text-xs text-[#77716B] line-clamp-2 leading-relaxed mb-4">
                        {proj.description ||
                          'Completed with devotion to craftsmanship, traditional aesthetics, and fresh florals.'}
                      </p>

                      <div className="space-y-1 mb-4 text-[11px] text-gray-500">
                        {proj.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#B8955A] shrink-0" />
                            <span className="truncate">{proj.location}</span>
                          </div>
                        )}
                        {(proj.event_date || proj.eventDate) && (
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5 text-[#B8955A] shrink-0" />
                            <span>
                              {new Date(proj.event_date || proj.eventDate!).toLocaleDateString('en-IN', {
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8E0D6] flex items-center justify-between gap-2">
                      <Link
                        to={`/portfolio/${proj.slug}`}
                        className="text-xs font-semibold text-[#28231F] hover:text-[#B8955A] transition-colors"
                      >
                        Photos ({Array.isArray(proj.images) ? proj.images.length : 1}) →
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
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-h-[85vh] w-auto mx-auto object-contain rounded-xl shadow-2xl"
            />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-full hidden sm:inline">
                {lightboxImage.title}
              </span>
              <button
                onClick={() => setLightboxImage(null)}
                className="bg-black/70 hover:bg-black text-white p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
