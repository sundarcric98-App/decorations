import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { PortfolioProject } from '../../types';
import { WhatsAppButton } from '../../components/common/WhatsAppButton';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ArrowLeft, MapPin, Calendar, Sparkles, X, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';

export const PortfolioDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['portfolio-detail', slug],
    queryFn: () => api.get<PortfolioProject>(`/portfolio/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading decoration photographs..." fullHeight />;
  }

  if (isError || !project) {
    return (
      <div className="pt-36 pb-24 text-center max-w-lg mx-auto space-y-4 px-4 min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="font-serif text-3xl font-bold text-[#28231F]">Project Not Found</h2>
        <p className="text-sm text-[#77716B]">
          The project you requested might have been moved or unpublished.
        </p>
        <Link to="/portfolio" className="mt-4">
          <Button variant="gold" size="md">
            Return to Portfolio Gallery
          </Button>
        </Link>
      </div>
    );
  }

  // Collect all image URLs
  const coverUrl = project.cover_image_url || project.coverImage;
  const projectImages: string[] = [];
  if (coverUrl) projectImages.push(coverUrl);

  if (Array.isArray(project.images)) {
    project.images.forEach((img: any) => {
      const url = typeof img === 'string' ? img : img?.image_url || img?.imageUrl;
      if (url && !projectImages.includes(url)) {
        projectImages.push(url);
      }
    });
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${project.title} — Sathuragiri Decoration`,
          text: `Check out this wedding decoration: ${project.title}`,
          url: window.location.href,
        });
      } catch {
        // Share cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Project link copied to clipboard!');
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#FAF7F2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation & Share Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#77716B] hover:text-[#B8955A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Gallery
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77716B] hover:text-[#B8955A] transition-colors bg-white px-3 py-1.5 rounded-full border border-[#E8E0D6]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Project</span>
          </button>
        </div>

        {/* Project Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B8955A]/10 border border-[#B8955A]/30 text-xs font-semibold uppercase tracking-widest text-[#B8955A]">
            <Sparkles className="w-3 h-3" />
            {project.categoryName || project.category || 'Event Decoration'}
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#28231F] leading-tight">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#77716B] pt-1">
            {project.location && (
              <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-[#E8E0D6]">
                <MapPin className="w-3.5 h-3.5 text-[#B8955A]" />
                {project.location}
              </span>
            )}
            {(project.event_date || project.eventDate) && (
              <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-[#E8E0D6]">
                <Calendar className="w-3.5 h-3.5 text-[#B8955A]" />
                {new Date(project.event_date || project.eventDate!).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>

        {/* Primary Cover Image Showcase */}
        {coverUrl && (
          <div
            className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white cursor-pointer group bg-black/10"
            onClick={() => setActiveImageIndex(0)}
          >
            <img
              src={coverUrl}
              alt={project.title}
              className="w-full max-h-[600px] object-cover object-center group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-6 text-white">
              <span className="text-sm font-semibold">Click to view in high resolution</span>
              <span className="text-xs bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                1 of {projectImages.length}
              </span>
            </div>
          </div>
        )}

        {/* Description & WhatsApp Enquiry Action Box */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8E0D6] shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#28231F]">About this Decoration</h2>
            <p className="text-[#77716B] leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {project.description ||
                'Every floral pillar, drape, and illumination in this project was curated to create an unforgettable festive atmosphere for the family and guests.'}
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E8E0D6] flex flex-col items-center text-center space-y-4">
            <Sparkles className="w-8 h-8 text-[#B8955A]" />
            <div>
              <p className="font-serif font-bold text-[#28231F] text-lg">Interested in this Decor?</p>
              <p className="text-xs text-[#77716B] mt-1">
                Enquire directly on WhatsApp to check availability and request custom pricing for your date.
              </p>
            </div>
            <WhatsAppButton
              size="md"
              projectTitle={project.title}
              categoryName={project.categoryName || project.category}
              label="Enquire for this Style"
              className="w-full justify-center"
            />
          </div>
        </div>

        {/* Gallery Grid (All Project Photographs) */}
        {projectImages.length > 1 && (
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between border-b border-[#E8E0D6] pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#28231F]">Project Photographs</h3>
                <p className="text-xs text-[#77716B] mt-0.5">
                  High-resolution photo gallery ({projectImages.length} photographs)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {projectImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="group relative h-64 rounded-2xl overflow-hidden bg-gray-100 border border-[#E8E0D6] shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img
                    src={imgUrl}
                    alt={`${project.title} - photo ${idx + 1}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <span className="text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-xs">
                      Enlarge Photo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal with Next / Prev controls */}
      {activeImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setActiveImageIndex(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={projectImages[activeImageIndex]}
              alt={`${project.title} photograph`}
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl shadow-2xl"
            />

            {/* Bottom Info Bar */}
            <div className="mt-4 flex items-center justify-between w-full text-white text-xs px-2">
              <span className="font-medium truncate max-w-md">{project.title}</span>
              <span>
                {activeImageIndex + 1} / {projectImages.length}
              </span>
            </div>

            {/* Navigation Arrows */}
            {projectImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImageIndex(
                      (activeImageIndex - 1 + projectImages.length) % projectImages.length
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIndex((activeImageIndex + 1) % projectImages.length)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              onClick={() => setActiveImageIndex(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
