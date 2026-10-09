import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { PortfolioProject } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search, MapPin, Calendar as CalendarIcon, ArrowRight, Eye } from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['public-portfolio-projects', selectedCategory, searchTerm],
    queryFn: () => {
      const catParam = selectedCategory !== 'All' ? `category=${encodeURIComponent(selectedCategory)}&` : '';
      const searchParam = searchTerm ? `search=${encodeURIComponent(searchTerm)}&` : '';
      return api.get<PortfolioProject[]>(`/portfolio?${catParam}${searchParam}`);
    },
  });

  const categories = [
    'All',
    'Traditional Wedding',
    'Reception Stage',
    'Engagement & Haldi',
    'Corporate Events',
    'Birthday & Anniversaries',
  ];

  return (
    <div className="pt-28 pb-20 space-y-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <Badge variant="gold">Real Celebrations</Badge>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#24211F]">
          Our Wedding & Event Portfolio
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#77716B]">
          Browse our curated gallery of grand mandapams, elegant reception backdrops, and unforgettable celebration setups across South India.
        </p>

        {/* Filter Pills and Search */}
        <div className="pt-6 max-w-4xl mx-auto space-y-6">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by project title, venue or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#E8E0D6] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8955A]/30 focus:border-[#B8955A] shadow-xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-[#B8955A] text-white shadow-luxury'
                    : 'bg-white text-[#56504A] border border-[#E8E0D6] hover:bg-[#FAF7F2]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <LoadingSpinner message="Loading portfolio gallery..." fullHeight />
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#E8E0D6]">
            <p className="text-sm text-[#77716B]">No projects found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/portfolio/${project.slug}`}
                className="group rounded-2xl overflow-hidden bg-white border border-[#E8E0D6] shadow-sm hover:shadow-luxury hover:border-[#B8955A]/60 transition-all duration-300 flex flex-col"
              >
                {/* Cover Image */}
                <div className="relative h-64 overflow-hidden bg-black/5">
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#FAF7F2]/90 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-[#96743A] border border-[#EBDDBF]">
                    {project.category}
                  </div>
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/90 text-[#24211F] text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-xs">
                      <Eye className="w-4 h-4 text-[#B8955A]" /> View Case Study
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#24211F] group-hover:text-[#B8955A] transition-colors leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-[#77716B] line-clamp-2 mt-1.5 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#77716B]">
                    {project.location ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#B8955A]" /> {project.location}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-[#B8955A] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Details <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
