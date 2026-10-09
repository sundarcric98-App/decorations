import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Service, ServiceCategory } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Textarea } from '../../../components/common/Textarea';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../lib/utils';

export const AdminServicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [detailedDesc, setDetailedDesc] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [startingPrice, setStartingPrice] = useState<number | ''>('');
  const [pricingMethod, setPricingMethod] = useState('Starting price');
  const [availableAddons, setAvailableAddons] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Fetch Services & Categories
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin-services-list'],
    queryFn: () => api.get<Service[]>('/services?all=true'),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories-list'],
    queryFn: () => api.get<ServiceCategory[]>('/services/categories?all=true'),
  });

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setSlug('');
    setCategoryId(categories[0]?.id || '');
    setShortDesc('');
    setDetailedDesc('');
    setCoverImage('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80');
    setStartingPrice(45000);
    setPricingMethod('Starting price');
    setAvailableAddons('Live Nadaswaram Setup, Brass Vilakku Decor, Floral Carpet');
    setIsFeatured(false);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setSlug(service.slug);
    setCategoryId(service.categoryId);
    setShortDesc(service.shortDesc);
    setDetailedDesc(service.detailedDesc || '');
    setCoverImage(service.coverImage);
    setStartingPrice(service.startingPrice || '');
    setPricingMethod(service.pricingMethod);
    setAvailableAddons((service.availableAddons || []).join(', '));
    setIsFeatured(service.isFeatured);
    setIsActive(service.isActive);
    setIsModalOpen(true);
  };

  // Create/Update Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        categoryId,
        shortDesc,
        detailedDesc,
        coverImage,
        startingPrice: startingPrice === '' ? null : Number(startingPrice),
        pricingMethod,
        availableAddons: availableAddons
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        isFeatured,
        isActive,
      };

      if (editingService) {
        return api.patch(`/services/${editingService.id}`, payload);
      } else {
        return api.post('/services', payload);
      }
    },
    onSuccess: () => {
      success(editingService ? 'Service updated successfully' : 'New service created successfully');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-services-list'] });
      queryClient.invalidateQueries({ queryKey: ['public-featured-services'] });
    },
    onError: (err: any) => {
      error(err.message || 'Operation failed');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/services/${id}`),
    onSuccess: () => {
      success('Service deleted / deactivated');
      queryClient.invalidateQueries({ queryKey: ['admin-services-list'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete service');
    },
  });

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#24211F]">
            Services Catalogue
          </h1>
          <p className="text-xs text-[#77716B] mt-0.5">
            Manage public website service offerings, photography bundles, catering, and stage setups.
          </p>
        </div>
        <Button variant="gold" size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add New Service
        </Button>
      </div>

      <Card className="p-4 bg-white">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search services by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E8E0D6] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#B8955A]/30 focus:border-[#B8955A]"
          />
        </div>
      </Card>

      <Card className="bg-white overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Loading services catalogue..." />
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No services found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#77716B] font-bold uppercase tracking-wider border-b border-[#E8E0D6]">
                <tr>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Pricing Model</th>
                  <th className="py-3.5 px-4">Starting Rate</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredServices.map((svc) => (
                  <tr key={svc.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={svc.coverImage}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-[#E8E0D6] shrink-0"
                        />
                        <div>
                          <p className="font-bold text-[#24211F]">{svc.name}</p>
                          <p className="text-[11px] text-[#77716B] truncate max-w-xs">{svc.shortDesc}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#77716B] font-medium">{svc.category?.name}</td>
                    <td className="py-3.5 px-4 text-[#56504A]">{svc.pricingMethod}</td>
                    <td className="py-3.5 px-4 font-bold text-[#B8955A]">
                      {svc.startingPrice ? formatCurrency(svc.startingPrice) : 'Custom'}
                    </td>
                    <td className="py-3.5 px-4">
                      {svc.isFeatured ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#B8955A] font-bold text-[10px] border border-[#EBDDBF]">
                          Featured
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {svc.isActive ? (
                        <span className="px-2 py-0.5 rounded-md bg-[#EBF7F0] text-[#24845D] font-bold text-[10px]">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-[#FDF2F2] text-[#C74646] font-bold text-[10px]">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => openEditModal(svc)}
                        className="p-1.5 rounded-lg border border-[#E8E0D6] bg-white text-[#56504A] hover:text-[#B8955A] hover:bg-[#FAF7F2] transition-colors"
                        title="Edit Service"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete service "${svc.name}"?`)) {
                            deleteMutation.mutate(svc.id);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-[#E8E0D6] bg-white text-gray-400 hover:text-[#C74646] hover:bg-[#FDF2F2] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Add New Service'}
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Service Name"
              placeholder="e.g. Royal Lotus Mandapam Decor"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingService) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                }
              }}
              required
            />
            <Select
              label="Category"
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="URL Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
            <Input
              label="Cover Image URL"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              required
            />
          </div>

          <Textarea
            label="Short Description"
            placeholder="Brief 1-2 sentence overview for cards..."
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            rows={2}
            required
          />

          <Textarea
            label="Detailed Overview & Inclusions"
            placeholder="Detailed description for service detail page..."
            value={detailedDesc}
            onChange={(e) => setDetailedDesc(e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Starting Price (INR)"
              type="number"
              placeholder="e.g. 65000"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value ? Number(e.target.value) : '')}
            />
            <Select
              label="Pricing Method"
              options={[
                { label: 'Starting price', value: 'Starting price' },
                { label: 'Fixed price', value: 'Fixed price' },
                { label: 'Per person', value: 'Per person' },
                { label: 'Per day', value: 'Per day' },
                { label: 'Custom quotation', value: 'Custom quotation' },
              ]}
              value={pricingMethod}
              onChange={(e) => setPricingMethod(e.target.value)}
            />
          </div>

          <Input
            label="Available Add-ons (Comma-separated)"
            placeholder="e.g. Dry Ice Fog Machine, Flower Canopy Entry, Live Chaat Counter"
            value={availableAddons}
            onChange={(e) => setAvailableAddons(e.target.value)}
          />

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#24211F] cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-[#B8955A] rounded border-gray-300"
              />
              Feature on Homepage
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#24211F] cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-[#B8955A] rounded border-gray-300"
              />
              Active on Website
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
              disabled={!name || !categoryId || !shortDesc || !coverImage}
              onClick={() => saveMutation.mutate()}
            >
              Save Service
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
