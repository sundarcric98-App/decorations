import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { PortfolioProject } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ArrowLeft, MapPin, Calendar, User, Sparkles, Share2 } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const PortfolioDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<string | null>(null);

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['portfolio-detail', slug],
    queryFn: () => api.get<PortfolioProject>(`/portfolio/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading project story..." fullHeight />;
  }

  if (isError || !project) {
    return (
      <div className="pt-32 pb-20 text-center max-w-lg mx-auto space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#24211F]">Project Not Found</h2>
        <p className="text-sm text-[#77716B]">The project you are looking for is unavailable.</p>
        <Link to="/portfolio">
          <Button variant="gold" size="md">
            Back to Portfolio
          </Button>
        </Link>
      </div>
    );
  }

  const allImages = [project.coverImage, ...(project.images || [])].filter(Boolean);

  return (
    <div className="pt-28 pb-20 space-y-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#77716B] hover:text-[#B8955A] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Gallery
      </button>

      {/* Hero Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <Badge variant="gold">{project.category}</Badge>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#24211F] leading-tight">
          {project.title}
        </h1>

        {/* Metadata pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#77716B] pt-2">
          {project.location && (
            <span className="flex items-center gap-1.5 bg-[#FAF7F2] px-3 py-1.5 rounded-full border border-[#E8E0D6]">
              <MapPin className="w-3.5 h-3.5 text-[#B8955A]" /> {project.location}
            </span>
          )}
          {project.eventDate && (
            <span className="flex items-center gap-1.5 bg-[#FAF7F2] px-3 py-1.5 rounded-full border border-[#E8E0D6]">
              <Calendar className="w-3.5 h-3.5 text-[#B8955A]" /> {formatDate(project.eventDate, 'short')}
            </span>
          )}
          {project.clientName && (
            <span className="flex items-center gap-1.5 bg-[#FAF7F2] px-3 py-1.5 rounded-full border border-[#E8E0D6]">
              <User className="w-3.5 h-3.5 text-[#B8955A]" /> Client: {project.clientName}
            </span>
          )}
        </div>
      </div>

      {/* Main Cover Image */}
      <div className="rounded-3xl overflow-hidden shadow-luxury border border-[#E8E0D6] aspect-16/9 bg-black/5">
        <img
          src={project.coverImage}
          alt={project.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Description & Story */}
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-[#E8E0D6] shadow-sm space-y-6">
        <h3 className="font-serif text-2xl font-bold text-[#24211F]">Event Overview & Execution</h3>
        <p className="text-sm sm:text-base text-[#56504A] leading-relaxed whitespace-pre-line">
          {project.description}
        </p>

        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[#77716B]">Inspired by this setup for your own special day?</span>
          <Link to="/book-event">
            <Button variant="gold" size="md" leftIcon={<Sparkles className="w-4 h-4" />}>
              Get a Quote for Similar Decor
            </Button>
          </Link>
        </div>
      </div>

      {/* Additional Photos Gallery Grid */}
      {allImages.length > 1 && (
        <div className="space-y-6 pt-6">
          <h3 className="font-serif text-2xl font-bold text-[#24211F] text-center">
            Photo Highlights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {allImages.map((imgUrl, i) => (
              <div
                key={i}
                onClick={() => setSelectedLightboxImage(imgUrl)}
                className="rounded-2xl overflow-hidden shadow-sm border border-[#E8E0D6] aspect-4/3 cursor-pointer group relative"
              >
                <img
                  src={imgUrl}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                  Click to Expand
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedLightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedLightboxImage(null)}
        >
          <img
            src={selectedLightboxImage}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
