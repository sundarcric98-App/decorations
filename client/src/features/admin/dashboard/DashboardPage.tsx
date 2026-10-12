import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Image,
  CheckCircle2,
  FileEdit,
  Layers,
  Plus,
  ArrowRight,
  Sparkles,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { DashboardStats } from '../../../types';

export const DashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => api.get<DashboardStats>('/admin/stats'),
  });

  if (isLoading || !stats) {
    return <LoadingSpinner message="Fetching Supabase portfolio metrics..." fullHeight />;
  }

  const kpis = [
    {
      title: 'Total Portfolio Projects',
      value: stats.totalProjects ?? stats.total_projects ?? 0,
      icon: <Image className="w-6 h-6 text-[#B8955A]" />,
      desc: 'All projects in database',
      color: 'bg-[#B8955A]/10 text-[#B8955A] border-[#B8955A]/30',
    },
    {
      title: 'Published Projects',
      value: stats.publishedProjects ?? stats.published_projects ?? 0,
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      desc: 'Publicly visible to prospective clients',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Draft Projects',
      value: stats.draftProjects ?? stats.draft_projects ?? 0,
      icon: <FileEdit className="w-6 h-6 text-amber-600" />,
      desc: 'Work in progress / unlisted',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'Active Event Categories',
      value: stats.activeCategories ?? stats.active_categories ?? 0,
      icon: <Layers className="w-6 h-6 text-indigo-600" />,
      desc: 'Live categories on public website',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Title & Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B8955A]">
            Sathuragiri Decoration Overview
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#28231F] mt-1">
            Portfolio Administration Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#77716B] mt-1">
            Real-time counts and statistics fetched directly from Supabase PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/admin/portfolio">
            <Button
              variant="gold"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Project
            </Button>
          </Link>
          <Link to="/admin/categories">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Layers className="w-4 h-4" />}
            >
              Manage Categories
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Required KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 border border-[#E8E0D6] shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-[#77716B] uppercase tracking-wider">
                  {kpi.title}
                </p>
                <p className="text-3xl sm:text-4xl font-serif font-bold text-[#28231F] mt-2">
                  {kpi.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl border ${kpi.color}`}>
                {kpi.icon}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">
              {kpi.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Categories Breakdown & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories Overview (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E8E0D6] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D6]">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#28231F]">
                Event Categories Status
              </h2>
              <p className="text-xs text-[#77716B]">
                Active categories appear on your public website and navigation.
              </p>
            </div>
            <Link
              to="/admin/categories"
              className="text-xs font-semibold text-[#B8955A] hover:underline flex items-center gap-1"
            >
              <span>Manage Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.categoriesBreakdown && stats.categoriesBreakdown.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {stats.categoriesBreakdown.map((cat: any) => (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6] flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-semibold text-[#28231F] truncate">{cat.name}</p>
                    <p className="text-xs text-[#77716B]">
                      {cat.projectCount || 0} project{cat.projectCount === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      cat.is_active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-6 text-center">No categories configured yet.</p>
          )}
        </div>

        {/* Quick Operations Sidebar */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8E0D6] shadow-xs space-y-5">
          <h2 className="font-serif text-lg font-bold text-[#28231F]">
            Quick Administration
          </h2>

          <div className="space-y-3">
            <Link
              to="/admin/portfolio"
              className="block p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6] hover:border-[#B8955A] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-[#E8E0D6] text-[#B8955A]">
                  <Image className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#28231F]">Portfolio Gallery</p>
                  <p className="text-[11px] text-[#77716B]">Add, edit, or publish decoration photos</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/categories"
              className="block p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6] hover:border-[#B8955A] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-[#E8E0D6] text-[#B8955A]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#28231F]">Event Categories</p>
                  <p className="text-[11px] text-[#77716B]">Create, reorder, or toggle categories</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/settings"
              className="block p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6] hover:border-[#B8955A] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-[#E8E0D6] text-[#B8955A]">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#28231F]">Business Settings</p>
                  <p className="text-[11px] text-[#77716B]">Change WhatsApp number & company info</p>
                </div>
              </div>
            </Link>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3.5 rounded-xl bg-gradient-to-r from-[#B8955A]/10 to-[#B8955A]/5 border border-[#B8955A]/30 hover:border-[#B8955A] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white border border-[#B8955A]/40 text-[#B8955A]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#28231F]">Preview Public Website</p>
                    <p className="text-[11px] text-[#77716B]">Open client view in new tab</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#B8955A]" />
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Recently Added Projects Preview */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E0D6] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D6]">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#28231F]">
              Recent Portfolio Projects
            </h2>
            <p className="text-xs text-[#77716B]">
              Latest projects added to Sathuragiri Decoration showcase.
            </p>
          </div>
          <Link
            to="/admin/portfolio"
            className="text-xs font-semibold text-[#B8955A] hover:underline flex items-center gap-1"
          >
            <span>All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentProjects && stats.recentProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold text-[#77716B] border-b border-gray-100">
                  <th className="pb-3">Project Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentProjects.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="py-3 font-semibold text-[#28231F] flex items-center gap-3">
                      {p.cover_image_url && (
                        <img
                          src={p.cover_image_url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-[#E8E0D6]"
                        />
                      )}
                      <span>{p.title}</span>
                    </td>
                    <td className="py-3 text-xs text-[#77716B]">{p.categoryName || 'General'}</td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-[#77716B]">
                      {p.event_date
                        ? new Date(p.event_date).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/portfolio?edit=${p.id}`}
                        className="text-xs font-semibold text-[#B8955A] hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-6 text-center">No projects in database yet.</p>
        )}
      </div>
    </div>
  );
};
