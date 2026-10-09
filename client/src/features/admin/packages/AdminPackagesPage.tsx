import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Edit, Trash2, CheckCircle2, Star } from 'lucide-react';
import { api } from '../../../lib/api';
import { Package as PackageType } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Textarea } from '../../../components/common/Textarea';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../lib/utils';

export const AdminPackagesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [includedServices, setIncludedServices] = useState('');
  const [packagePrice, setPackagePrice] = useState<number | ''>('');
  const [pricingType, setPricingType] = useState('Starting price');
  const [optionalExtras, setOptionalExtras] = useState('');
  const [terms, setTerms] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['admin-packages-list'],
    queryFn: () => api.get<PackageType[]>('/packages?all=true'),
  });

  const openCreateModal = () => {
    setEditingPackage(null);
    setName('');
    setSlug('');
    setDescription('');
    setIncludedServices('Temple Mandapam Decor, 30ft Stage Floral Wall, Entrance Arch, Lighting');
    setPackagePrice(150000);
    setPricingType('Starting price');
    setOptionalExtras('Drone Photography, Cold Fire Entry, Mocktail Stall');
    setTerms('30% advance on signing. 50% 2 days prior to event.');
    setIsFeatured(false);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: PackageType) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setSlug(pkg.slug);
    setDescription(pkg.description);
    setIncludedServices((pkg.includedServices || []).join('\n'));
    setPackagePrice(pkg.packagePrice || '');
    setPricingType(pkg.pricingType);
    setOptionalExtras((pkg.optionalExtras || []).join(', '));
    setTerms(pkg.terms || '');
    setIsFeatured(pkg.isFeatured);
    setIsActive(pkg.isActive);
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description,
        includedServices: includedServices
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter(Boolean),
        packagePrice: packagePrice === '' ? null : Number(packagePrice),
        pricingType,
        optionalExtras: optionalExtras
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        terms,
        isFeatured,
        isActive,
      };

      if (editingPackage) {
        return api.patch(`/packages/${editingPackage.id}`, payload);
      } else {
        return api.post('/packages', payload);
      }
    },
    onSuccess: () => {
      success(editingPackage ? 'Package updated' : 'Package created');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-packages-list'] });
      queryClient.invalidateQueries({ queryKey: ['public-packages'] });
    },
    onError: (err: any) => {
      error(err.message || 'Operation failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/packages/${id}`),
    onSuccess: () => {
      success('Package deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-packages-list'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete package');
    },
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#24211F]">
            Event Packages Management
          </h1>
          <p className="text-xs text-[#77716B] mt-0.5">
            Configure pre-designed event bundles, inclusions, and featured package tiers.
          </p>
        </div>
        <Button variant="gold" size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add New Package
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading packages..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`p-6 flex flex-col justify-between relative bg-white ${
                pkg.isFeatured ? 'border-2 border-[#B8955A]' : ''
              }`}
            >
              {pkg.isFeatured && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-[#B8955A] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#EBDDBF]">
                  <Star className="w-3 h-3 fill-current" /> Featured
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#24211F]">{pkg.name}</h3>
                  <p className="text-xs text-[#77716B] mt-1 leading-relaxed line-clamp-2">{pkg.description}</p>
                </div>

                <div className="py-2.5 border-y border-[#E8E0D6] flex items-baseline justify-between">
                  <span className="text-xs text-[#77716B]">Rate:</span>
                  <span className="font-serif text-xl font-bold text-[#B8955A]">
                    {pkg.packagePrice ? formatCurrency(pkg.packagePrice) : 'Custom Quote'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-[#24211F]">Inclusions:</span>
                  <ul className="space-y-1.5 text-xs text-[#56504A]">
                    {(pkg.includedServices || []).slice(0, 4).map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#24845D] shrink-0 mt-0.5" />
                        <span className="truncate">{inc}</span>
                      </li>
                    ))}
                    {(pkg.includedServices || []).length > 4 && (
                      <li className="text-[11px] text-gray-400 italic">
                        + {(pkg.includedServices || []).length - 4} more inclusions
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${pkg.isActive ? 'bg-[#EBF7F0] text-[#24845D]' : 'bg-gray-100 text-gray-500'}`}>
                  {pkg.isActive ? 'Active' : 'Draft'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(pkg)}
                    className="p-1.5 rounded-lg border border-[#E8E0D6] text-[#56504A] hover:text-[#B8955A] hover:bg-[#FAF7F2]"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete package "${pkg.name}"?`)) {
                        deleteMutation.mutate(pkg.id);
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
        title={editingPackage ? 'Edit Package' : 'Create Package'}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <Input
            label="Package Title"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editingPackage) {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
              }
            }}
            required
          />

          <Textarea
            label="Short Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            required
          />

          <Textarea
            label="Included Services (One per line or comma-separated)"
            placeholder="e.g. Sacred Muhurtham Mandapam\nGrand Reception Stage\n4K Cinema Coverage"
            value={includedServices}
            onChange={(e) => setIncludedServices(e.target.value)}
            rows={4}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Package Price (INR)"
              type="number"
              placeholder="e.g. 185000"
              value={packagePrice}
              onChange={(e) => setPackagePrice(e.target.value ? Number(e.target.value) : '')}
            />
            <Select
              label="Pricing Type"
              options={[
                { label: 'Starting price', value: 'Starting price' },
                { label: 'Fixed price', value: 'Fixed price' },
                { label: 'Request a Quote', value: 'Request a Quote' },
              ]}
              value={pricingType}
              onChange={(e) => setPricingType(e.target.value)}
            />
          </div>

          <Input
            label="Available Extras (Comma-separated)"
            value={optionalExtras}
            onChange={(e) => setOptionalExtras(e.target.value)}
          />

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#24211F] cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-[#B8955A] rounded border-gray-300"
              />
              Mark as Featured / Most Popular
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
              disabled={!name || !description || !includedServices}
              onClick={() => saveMutation.mutate()}
            >
              Save Package
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
