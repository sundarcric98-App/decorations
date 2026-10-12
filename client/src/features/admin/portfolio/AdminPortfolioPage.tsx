import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
  Upload,
  X,
  Star,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { PortfolioProject, EventCategory, PortfolioImage } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Textarea } from '../../../components/common/Textarea';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { useToast } from '../../../context/ToastContext';

export const AdminPortfolioPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [searchParams] = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [displayOrder, setDisplayOrder] = useState(0);

  // Photographs array: [{ image_url, alt_text, display_order }]
  const [images, setImages] = useState<Array<{ image_url: string; alt_text?: string; storage_path?: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Fetch Categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories-list'],
    queryFn: () => api.get<EventCategory[]>('/admin/categories'),
  });

  // Fetch Projects for admin
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-portfolio-list', filterCategory, filterStatus, searchTerm],
    queryFn: () => {
      const catParam = filterCategory !== 'All' ? `category=${encodeURIComponent(filterCategory)}&` : '';
      const statParam = filterStatus !== 'All' ? `status=${encodeURIComponent(filterStatus)}&` : '';
      const searchParam = searchTerm ? `search=${encodeURIComponent(searchTerm)}&` : '';
      return api.get<PortfolioProject[]>(`/admin/portfolio?${catParam}${statParam}${searchParam}`);
    },
  });

  // Check URL query param for deep link to edit
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && projects.length > 0) {
      const match = projects.find((p) => p.id === editId);
      if (match) {
        openEditModal(match);
      }
    }
  }, [searchParams, projects]);

  const openCreateModal = () => {
    setEditingProject(null);
    setTitle('');
    setSlug('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setDescription('');
    setLocation('Madurai, Tamil Nadu');
    setEventDate(new Date().toISOString().split('T')[0]);
    setCoverImageUrl('');
    setStatus('published');
    setDisplayOrder(projects.length + 1);
    setImages([]);
    setNewImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = async (proj: PortfolioProject) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setSlug(proj.slug);
    setCategoryId(proj.category_id || proj.categoryId || (categories.length > 0 ? categories[0].id : ''));
    setDescription(proj.description || '');
    setLocation(proj.location || '');
    setEventDate(
      proj.event_date || proj.eventDate
        ? new Date(proj.event_date || proj.eventDate!).toISOString().split('T')[0]
        : ''
    );
    setCoverImageUrl(proj.cover_image_url || proj.coverImage || '');
    setStatus(proj.status || 'published');
    setDisplayOrder(proj.display_order ?? proj.sortOrder ?? 0);

    // Fetch full project details with all photographs
    try {
      const full = await api.get<PortfolioProject>(`/admin/portfolio/${proj.id}`);
      if (full && Array.isArray(full.images)) {
        setImages(
          full.images.map((img: any) => ({
            image_url: typeof img === 'string' ? img : img.image_url || img.imageUrl,
            alt_text: img.alt_text || full.title,
            storage_path: img.storage_path,
          }))
        );
      } else {
        setImages([]);
      }
    } catch {
      setImages([]);
    }

    setIsModalOpen(true);
  };

  // Image Upload directly to Supabase storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      if (files.length === 1) {
        const formData = new FormData();
        formData.append('file', files[0]);
        const res = await api.post<any>('/admin/upload', formData);
        const url = res.url || res.image_url;
        if (url) {
          if (!coverImageUrl) setCoverImageUrl(url);
          setImages((prev) => [...prev, { image_url: url, alt_text: title, storage_path: res.storage_path }]);
          success('Photograph uploaded to Supabase Storage');
        }
      } else {
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append('files', file));
        const res = await api.post<any>('/admin/upload/multiple', formData);
        const uploadedFiles = res.files || [];
        const newImgs = uploadedFiles.map((f: any) => ({
          image_url: f.url || f.image_url,
          alt_text: title,
          storage_path: f.storage_path,
        }));
        if (!coverImageUrl && newImgs.length > 0) {
          setCoverImageUrl(newImgs[0].image_url);
        }
        setImages((prev) => [...prev, ...newImgs]);
        success(`${newImgs.length} photographs uploaded to Supabase Storage`);
      }
    } catch (err: any) {
      error(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    if (!coverImageUrl) setCoverImageUrl(newImageUrl.trim());
    setImages((prev) => [...prev, { image_url: newImageUrl.trim(), alt_text: title }]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const removedUrl = images[indexToRemove]?.image_url;
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (coverImageUrl === removedUrl) {
      const remaining = images.filter((_, idx) => idx !== indexToRemove);
      setCoverImageUrl(remaining.length > 0 ? remaining[0].image_url : '');
    }
  };

  const handleSetCover = (url: string) => {
    setCoverImageUrl(url);
    success('Cover photograph updated');
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/portfolio', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-list'] });
      queryClient.invalidateQueries({ queryKey: ['public-portfolio-projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      success('Project created and published');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      error(err.message || 'Failed to create project');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/admin/portfolio/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-list'] });
      queryClient.invalidateQueries({ queryKey: ['public-portfolio-projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      success('Project updated successfully');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update project');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/portfolio/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-list'] });
      queryClient.invalidateQueries({ queryKey: ['public-portfolio-projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      success('Project deleted from portfolio');
      setIsDeleting(null);
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete project');
      setIsDeleting(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Project title is required');
      return;
    }
    if (!categoryId) {
      error('Please select an event category');
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      category_id: categoryId,
      description: description.trim(),
      location: location.trim(),
      event_date: eventDate || null,
      cover_image_url: coverImageUrl || (images.length > 0 ? images[0].image_url : ''),
      status,
      display_order: Number(displayOrder),
      images: images.map((img, i) => ({
        image_url: img.image_url,
        alt_text: img.alt_text || title,
        storage_path: img.storage_path,
        display_order: i + 1,
      })),
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (proj: PortfolioProject) => {
    if (window.confirm(`Are you sure you want to permanently delete "${proj.title}"?`)) {
      setIsDeleting(proj.id);
      deleteMutation.mutate(proj.id);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B8955A]">
            Showcase Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#28231F] mt-1">
            Portfolio Projects
          </h1>
          <p className="text-xs sm:text-sm text-[#77716B] mt-1">
            Upload decoration photographs, assign categories, manage descriptions, and publish projects.
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
        >
          Add New Project
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E0D6] shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by title, venue, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[#E8E0D6] focus:outline-none focus:ring-2 focus:ring-[#B8955A]/30"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E8E0D6] text-xs font-medium text-[#28231F] bg-white focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E8E0D6] text-xs font-medium text-[#28231F] bg-white focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E8E0D6] p-8 shadow-xs">
          <ImageIcon className="w-12 h-12 text-[#B8955A] mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#28231F]">No Portfolio Projects Found</h3>
          <p className="text-sm text-[#77716B] mt-1">
            Click "Add New Project" above to create your first decoration showcase project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const coverImg =
              proj.cover_image_url ||
              proj.coverImage ||
              'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={proj.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E8E0D6] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 bg-gray-100 overflow-hidden">
                    <img
                      src={coverImg}
                      alt={proj.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white tracking-wide">
                        {proj.categoryName || 'Category'}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md ${
                          proj.status === 'published'
                            ? 'bg-emerald-600/90 text-white'
                            : 'bg-amber-600/90 text-white'
                        }`}
                      >
                        {proj.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs">
                        Order #{proj.display_order ?? 0}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-serif text-lg font-bold text-[#28231F] line-clamp-1">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-[#77716B] line-clamp-2 leading-relaxed">
                      {proj.description || 'No description provided.'}
                    </p>

                    <div className="pt-2 text-[11px] text-gray-500 space-y-1">
                      {proj.location && (
                        <p className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#B8955A] shrink-0" />
                          <span>{proj.location}</span>
                        </p>
                      )}
                      {(proj.event_date || proj.eventDate) && (
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#B8955A] shrink-0" />
                          <span>
                            {new Date(proj.event_date || proj.eventDate!).toLocaleDateString('en-IN', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-gray-100 mt-4 flex items-center justify-between">
                  <a
                    href={`/portfolio/${proj.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#77716B] hover:text-[#B8955A] flex items-center gap-1"
                  >
                    <span>Preview</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(proj)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-[#B8955A] hover:bg-[#FAF7F2] transition-colors"
                      title="Edit Project"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj)}
                      disabled={isDeleting === proj.id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Portfolio Project' : 'Create New Portfolio Project'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                Project Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Royal Chettinad Kalyana Mandapam"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                Event Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E0D6] text-sm focus:outline-none focus:ring-2 focus:ring-[#B8955A]/30 bg-white"
                required
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                Slug (URL Identifier)
              </label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Auto-generated from title if blank"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                Location / Venue
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Madurai, Rajapalayam, Mandapam name..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                Event Date (Optional)
              </label>
              <Input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E0D6] text-sm focus:outline-none focus:ring-2 focus:ring-[#B8955A]/30 bg-white"
              >
                <option value="published">Published (Visible Publicly)</option>
                <option value="draft">Draft (Private)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                Display Order
              </label>
              <Input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#28231F] mb-1">
              Project Description & Highlights
            </label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the floral themes, colors, mandap pillars, backdrop lighting, or special elements..."
            />
          </div>

          {/* Multiple Image Management & Supabase Upload */}
          <div className="pt-2 border-t border-[#E8E0D6] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-[#28231F]">
                  Project Photographs ({images.length} images)
                </label>
                <p className="text-[11px] text-[#77716B]">
                  Click "Set as Cover" on any image to choose the featured card photo.
                </p>
              </div>

              {/* Upload to Supabase Storage button */}
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6] text-xs font-semibold text-[#28231F] hover:bg-[#B8955A]/10 hover:border-[#B8955A] transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#B8955A]" />
                <span>{isUploading ? 'Uploading to Supabase...' : 'Upload Photographs'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Manual Image URL Adder */}
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Or paste external image URL (e.g. Unsplash)..."
                className="flex-1 text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddImageUrl}>
                Add URL
              </Button>
            </div>

            {/* Images Thumbnail Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-h-56 overflow-y-auto p-1">
                {images.map((img, idx) => {
                  const isCover = coverImageUrl === img.image_url;
                  return (
                    <div
                      key={idx}
                      className={`relative rounded-xl overflow-hidden border-2 bg-gray-100 group h-28 ${
                        isCover ? 'border-[#B8955A] shadow-md' : 'border-[#E8E0D6]'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 rounded-md bg-red-600/80 hover:bg-red-600 text-white"
                            title="Remove image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSetCover(img.image_url)}
                          className={`text-[10px] font-bold py-1 px-2 rounded-md ${
                            isCover ? 'bg-[#B8955A] text-white' : 'bg-black/60 hover:bg-[#B8955A]'
                          }`}
                        >
                          {isCover ? '★ Cover' : 'Set as Cover'}
                        </button>
                      </div>

                      {isCover && (
                        <div className="absolute top-1 left-1 bg-[#B8955A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          Cover
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E8E0D6] flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default AdminPortfolioPage;
