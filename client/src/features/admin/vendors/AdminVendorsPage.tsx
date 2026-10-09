import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Truck, 
  Tag, 
  FileText, 
  Edit2, 
  Trash2,
  DollarSign,
  Layers
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Vendor } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Textarea } from '../../../components/common/Textarea';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { EmptyState } from '../../../components/common/EmptyState';
import { ConfirmDialog } from '../../../components/admin/ConfirmDialog';
import { useToast } from '../../../context/ToastContext';

export const AdminVendorsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    phone: '',
    email: '',
    category: 'FLORAL_SUPPLIER',
    servicesSupplied: '',
    agreedRates: '',
    notes: '',
    isActive: true,
  });

  const { data: vendorsList = [], isLoading } = useQuery({
    queryKey: ['admin-vendors'],
    queryFn: async () => {
      const res = await api.get<Vendor[]>('/vendors');
      return res.data;
    },
  });

  const filteredVendors = vendorsList.filter((v) => {
    const matchesSearch =
      v.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.servicesSupplied && v.servicesSupplied.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (vendor?: Vendor) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({
        businessName: vendor.businessName,
        contactPerson: vendor.contactPerson,
        phone: vendor.phone,
        email: vendor.email || '',
        category: vendor.category,
        servicesSupplied: vendor.servicesSupplied || '',
        agreedRates: vendor.agreedRates || '',
        notes: vendor.notes || '',
        isActive: vendor.isActive,
      });
    } else {
      setEditingVendor(null);
      setFormData({
        businessName: '',
        contactPerson: '',
        phone: '',
        email: '',
        category: 'FLORAL_SUPPLIER',
        servicesSupplied: '',
        agreedRates: '',
        notes: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingVendor) {
        return api.put(`/vendors/${editingVendor.id}`, formData);
      }
      return api.post('/vendors', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      showToast(
        editingVendor ? 'Vendor partner updated' : 'Vendor partner added successfully',
        'success'
      );
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to save vendor record', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/vendors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      showToast('Vendor partner removed', 'success');
      setDeletingId(null);
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete vendor', 'error');
    },
  });

  const vendorCategories = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Floral & Garland Wholesalers', value: 'FLORAL_SUPPLIER' },
    { label: 'Lighting, Truss & Generator', value: 'LIGHTING_SOUND' },
    { label: 'Catering & Live Food Stalls', value: 'CATERING' },
    { label: 'Photography & Cinematography', value: 'MEDIA_PHOTO' },
    { label: 'Pandal & Stage Fabrication', value: 'FABRICATION' },
    { label: 'Transportation & Logistics', value: 'LOGISTICS' },
    { label: 'Pyro, Fireworks & Cold Spark', value: 'PYRO_SFX' },
    { label: 'Other Event Vendor', value: 'OTHER' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-dark flex items-center gap-2">
            <Building2 className="w-7 h-7 text-brand-gold" />
            Vendor & Supplier Partners
          </h1>
          <p className="text-sm text-brand-muted">
            Manage florists, pandal contractors, caterers, sound providers, and agreed commercial rates.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Vendor Partner
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 border border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
          <Input
            placeholder="Search vendor, contact, supplies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-brand-muted font-medium">Category:</span>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={vendorCategories}
            className="h-9 text-xs"
          />
        </div>
      </Card>

      {/* Vendors Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="lg" message="Loading vendor partners..." />
        </div>
      ) : filteredVendors.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No vendor partners found"
          description={
            searchTerm
              ? 'No vendors matched your search filters.'
              : 'Add flower suppliers, caterers, and lighting vendors to manage event logistics.'
          }
          actionLabel="Add Vendor"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVendors.map((vendor) => (
            <Card
              key={vendor.id}
              className="p-5 border border-brand-border/60 hover:border-brand-gold/60 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-brand-dark text-lg group-hover:text-brand-gold transition-colors">
                      {vendor.businessName}
                    </h3>
                    <p className="text-xs font-medium text-brand-muted">
                      Contact: <span className="text-brand-dark">{vendor.contactPerson}</span>
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                    {vendor.category.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-brand-muted pt-2 border-t border-brand-border/50">
                  <div className="flex items-center gap-2 text-brand-dark font-medium">
                    <Phone className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{vendor.phone}</span>
                  </div>
                  {vendor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-brand-gold" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                </div>

                {vendor.servicesSupplied && (
                  <div className="pt-2 border-t border-brand-border/40">
                    <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider block mb-1">
                      Services / Items Supplied
                    </span>
                    <p className="text-xs text-brand-dark bg-brand-bg/50 p-2 rounded-lg">
                      {vendor.servicesSupplied}
                    </p>
                  </div>
                )}

                {vendor.agreedRates && (
                  <div className="pt-2">
                    <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                      Agreed Commercial Rates
                    </span>
                    <p className="text-xs text-emerald-950 font-medium bg-emerald-50/70 border border-emerald-100 p-2 rounded-lg">
                      {vendor.agreedRates}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-brand-border/50 flex items-center justify-between">
                <span
                  className={`text-xs font-semibold ${
                    vendor.isActive ? 'text-emerald-700' : 'text-brand-muted'
                  }`}
                >
                  {vendor.isActive ? 'Active Vendor' : 'Inactive'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(vendor)}
                    className="p-1.5 text-brand-muted hover:text-brand-gold hover:bg-brand-bg rounded-lg transition-colors"
                    title="Edit Vendor"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(vendor.id)}
                    className="p-1.5 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Vendor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendor ? 'Edit Vendor Partner' : 'Add New Vendor Partner'}
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Business / Agency Name *"
            required
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            placeholder="e.g. Sri Madurai Flower Wholesalers"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Person *"
              required
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="e.g. Senthil Kumar"
            />
            <Select
              label="Vendor Category *"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={vendorCategories.filter((c) => c.value !== 'ALL')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number *"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91 98421 98765"
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. senthil@flowerwholesalers.com"
            />
          </div>

          <Input
            label="Services / Items Supplied"
            value={formData.servicesSupplied}
            onChange={(e) => setFormData({ ...formData, servicesSupplied: e.target.value })}
            placeholder="e.g. Fresh Bangalore roses, Chettinad jasmine, Orchids"
          />

          <Input
            label="Agreed Rates / Commercial Terms"
            value={formData.agreedRates}
            onChange={(e) => setFormData({ ...formData, agreedRates: e.target.value })}
            placeholder="e.g. ₹450/kg for Jasmine, ₹12/stem for Dutch Roses"
          />

          <Textarea
            label="Internal Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Requires 24-hr advance notice for exotic flowers."
            rows={2}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveVendor"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded text-brand-gold focus:ring-brand-gold"
            />
            <label htmlFor="isActiveVendor" className="text-sm text-brand-dark font-medium cursor-pointer">
              Active Vendor Partner
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={saveMutation.isPending}>
              {editingVendor ? 'Save Changes' : 'Add Vendor Partner'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Remove Vendor Partner"
        message="Are you sure you want to delete this vendor? Historical expense records will remain preserved."
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
};
