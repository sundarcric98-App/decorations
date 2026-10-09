import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image, Plus, Edit, Trash2, MapPin, Calendar, Star, Eye } from 'lucide-react';
import { api } from '../../../lib/api';
import { PortfolioProject } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Textarea } from '../../../components/common/Textarea';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../lib/utils';

export const AdminPortfolioPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Traditional Wedding');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('Madurai');
  const [eventDate, setEventDate] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [additionalImages, setAdditionalImages] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-portfolio-list'],
    queryFn: () => api.get<PortfolioProject[]>('/portfolio?all=true'),
  });

  const openCreateModal = () => {
    setEditingProject(null);
    setTitle('');
    setSlug('');
    setCategory('Traditional Wedding');
    setDescription('');
    setClientName('');
    setLocation('Madurai');
    setEventDate(new Date().toISOString().split('T')[0]);
    setCoverImage('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80');
    setAdditionalImages('');
    setIsFeatured(false);
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (proj: PortfolioProject) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setSlug(proj.slug);
    setCategory(proj.category);
    setDescription(proj.description);
    setClientName(proj.clientName || '');
    setLocation(proj.location || '');
    setEventDate(proj.eventDate ? new Date(proj.eventDate).toISOString().split('T')[0] : '');
    setCoverImage(proj.coverImage);
    setAdditionalImages((proj.images || []).join('\n'));
    setIsFeatured(proj.isFeatured);
    setIsPublished(proj.isPublished);
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        category,
        description,
        clientName: clientName || null,
        location: location || null,
        eventDate: eventDate ? new Date(eventDate).toISOString() : null,
        coverImage,
        images: additionalImages
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter(Boolean),
        isFeatured,
        isPublished,
      };

      if (editingProject) {
        return api.patch(`/portfolio/${editingProject.id}`, payload);
      } else {
        return api.post('/portfolio', payload);
      }
    },
    onSuccess: () => {
      success(editingProject ? 'Project updated' : 'Project added to portfolio');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-list'] });
      queryClient.invalidateQueries({ queryKey: ['public-featured-portfolio'] });
    },
    onError: (err: any) => {
      error(err.message || 'Operation failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/portfolio/${id}`),
    onSuccess: () => {
      success('Project removed from portfolio');
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-list'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete project');
    },
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#24211F]">
            Portfolio Gallery Management
          </h1>
          <p className="text-xs text-[#77716B] mt-0.5">
            Publish real weddings, stage setups, and high-resolution event photographs.
          </p>
        </div>
        <Button variant="gold" size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Portfolio Project
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading portfolio gallery..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <Card key={proj.id} className="overflow-hidden bg-white flex flex-col justify-between">
              <div>
                <div className="relative h-48 bg-black/5">
                  <img src={proj.coverImage} alt={proj.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-[#FAF7F2] text-[#96743A] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#EBDDBF]">
                    {proj.category}
                  </div>
                  {proj.isFeatured && (
                    <div className="absolute top-3 right-3 bg-[#B8955A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-serif text-base font-bold text-[#24211F]">{proj.title}</h3>
                  <p className="text-xs text-[#77716B] line-clamp-2">{proj.description}</p>
                  {proj.location && (
                    <p className="text-[11px] text-[#B8955A] font-semibold flex items-center gap-1 pt-1">
                      <MapPin className="w-3 h-3" /> {proj.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-gray-100 flex items-center justify-between mt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${proj.isPublished ? 'bg-[#EBF7F0] text-[#24845D]' : 'bg-gray-100 text-gray-500'}`}>
                  {proj.isPublished ? 'Published' : 'Hidden'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(proj)}
                    className="p-1.5 rounded-lg border border-[#E8E0D6] text-[#56504A] hover:text-[#B8955A] hover:bg-[#FAF7F2]"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete project "${proj.title}"?`)) {
                        deleteMutation.mutate(proj.id);
                      }
                    }}
                    className="p-1.5 rounded-lg border border-[#E8E0D6] text-gray-400 hover:text-[#C74646] hover:bg-[#FDF2F2]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Portfolio Story' : 'Add New Portfolio Project'}
        maxWidth="xl"
      >
        <div className="space-y-4">
          <Input
            label="Project Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!editingProject) {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
              }
            }}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Event Category"
              options={[
                { label: 'Traditional Wedding', value: 'Traditional Wedding' },
                { label: 'Reception Stage', value: 'Reception Stage' },
                { label: 'Engagement & Haldi', value: 'Engagement & Haldi' },
                { label: 'Corporate Events', value: 'Corporate Events' },
                { label: 'Birthday & Anniversaries', value: 'Birthday & Anniversaries' },
              ]}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Input
              label="URL Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Client Name (Optional)"
              placeholder="e.g. Karthik & Divya"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <Input
              label="Location / Venue"
              placeholder="e.g. Heritage Palace, Madurai"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              label="Event Date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          <Input
            label="Cover Image URL"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            required
          />

          <Textarea
            label="Additional Image URLs (One per line)"
            placeholder="https://images.unsplash.com/...\nhttps://images.unsplash.com/..."
            value={additionalImages}
            onChange={(e) => setAdditionalImages(e.target.value)}
            rows={3}
          />

          <Textarea
            label="Project Overview & Story"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#24211F] cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-[#B8955A] rounded border-gray-300"
              />
              Featured on Homepage
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#24211F] cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-[#B8955A] rounded border-gray-300"
              />
              Published on Website
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={saveMutation.isPending}
              disabled={!title || !coverImage || !description}
              onClick={() => saveMutation.mutate()}
            >
              Save Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
