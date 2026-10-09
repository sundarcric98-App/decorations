import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  ArrowRight,
  Edit2,
  Trash2
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Customer } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Textarea } from '../../../components/common/Textarea';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { EmptyState } from '../../../components/common/EmptyState';
import { Pagination } from '../../../components/common/Pagination';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../lib/utils';

export const CustomersListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, searchTerm],
    queryFn: async () => {
      const res = await api.get<{
        items: Customer[];
        pagination: { total: number; page: number; totalPages: number };
      }>(`/customers?page=${page}&limit=12&search=${searchTerm}`);
      return res.data;
    },
  });

  const customers = data?.items || [];
  const pagination = data?.pagination;

  // Open add/edit modal
  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
        notes: customer.notes || '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingCustomer) {
        return api.put(`/customers/${editingCustomer.id}`, formData);
      }
      return api.post('/customers', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      showToast(
        editingCustomer ? 'Customer updated successfully' : 'Customer added successfully',
        'success'
      );
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to save customer', 'error');
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-dark flex items-center gap-2">
            <Users className="w-7 h-7 text-brand-gold" />
            Customer Directory
          </h1>
          <p className="text-sm text-brand-muted">
            Manage customer contacts, historical wedding bookings, enquiries, and follow-ups.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-4 border border-brand-border/60">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
          <Input
            placeholder="Search by customer name, phone, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-10 h-10 text-sm"
          />
        </div>
      </Card>

      {/* Customers Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="lg" message="Loading customer profiles..." />
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers found"
          description={
            searchTerm
              ? 'No customer records match your search criteria.'
              : 'Add your first customer to start tracking their event portfolio.'
          }
          actionLabel="Add Customer"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {customers.map((cust) => (
            <Card
              key={cust.id}
              className="p-5 border border-brand-border/60 hover:border-brand-gold/60 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center font-serif font-bold text-lg border border-brand-gold/30">
                      {cust.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-brand-dark text-lg group-hover:text-brand-gold transition-colors">
                        {cust.name}
                      </h3>
                      <p className="text-xs text-brand-muted">
                        Member since {formatDate(cust.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenModal(cust)}
                    className="p-1.5 text-brand-muted hover:text-brand-gold hover:bg-brand-bg rounded-lg transition-colors"
                    title="Edit Customer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-brand-muted pt-2 border-t border-brand-border/50">
                  <div className="flex items-center gap-2 text-brand-dark font-medium">
                    <Phone className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{cust.phone}</span>
                  </div>
                  {cust.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-brand-gold" />
                      <span className="truncate">{cust.email}</span>
                    </div>
                  )}
                  {cust.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                      <span className="truncate">{cust.address}</span>
                    </div>
                  )}
                </div>

                {/* History counts */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-brand-border/40 text-center">
                  <div className="bg-brand-bg/50 p-2 rounded-lg">
                    <span className="block font-serif font-bold text-brand-dark text-sm">
                      {cust._count?.enquiries || 0}
                    </span>
                    <span className="text-[10px] text-brand-muted uppercase font-medium">
                      Enquiries
                    </span>
                  </div>
                  <div className="bg-brand-bg/50 p-2 rounded-lg">
                    <span className="block font-serif font-bold text-brand-gold text-sm">
                      {cust._count?.bookings || 0}
                    </span>
                    <span className="text-[10px] text-brand-muted uppercase font-medium">
                      Bookings
                    </span>
                  </div>
                  <div className="bg-brand-bg/50 p-2 rounded-lg">
                    <span className="block font-serif font-bold text-brand-dark text-sm">
                      {cust._count?.quotations || 0}
                    </span>
                    <span className="text-[10px] text-brand-muted uppercase font-medium">
                      Quotes
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-brand-border/50 flex justify-end">
                <Link to={`/admin/customers/${cust.id}`}>
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 w-full">
                    View Complete Profile
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Details' : 'Add New Customer'}
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
            label="Full Name *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Ramesh K & Meenakshi"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number *"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91 98450 12345"
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. ramesh@example.com"
            />
          </div>

          <Input
            label="Address / Location"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. 142 Gandhi Road, Madurai"
          />

          <Textarea
            label="Internal Notes / Preferences"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Prefers grand traditional floral themes; vegetarian catering only."
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={saveMutation.isPending}>
              {editingCustomer ? 'Save Changes' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
