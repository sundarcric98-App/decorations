import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UserCheck, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Briefcase, 
  Wrench, 
  CheckCircle, 
  Clock, 
  XCircle,
  Edit2,
  Trash2,
  Calendar
} from 'lucide-react';
import { api } from '../../../lib/api';
import { StaffProfile } from '../../../types';
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

export const AdminStaffPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffProfile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    roleTitle: 'Stage Decorator',
    skills: '',
    availabilityStatus: 'AVAILABLE',
    isActive: true,
  });

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: async () => {
      const res = await api.get<StaffProfile[]>('/staff');
      return res.data;
    },
  });

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.skills && s.skills.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || s.availabilityStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (staff?: StaffProfile) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name,
        phone: staff.phone,
        email: staff.email || '',
        roleTitle: staff.roleTitle,
        skills: staff.skills || '',
        availabilityStatus: staff.availabilityStatus || 'AVAILABLE',
        isActive: staff.isActive,
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        roleTitle: 'Stage Decorator',
        skills: '',
        availabilityStatus: 'AVAILABLE',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingStaff) {
        return api.put(`/staff/${editingStaff.id}`, formData);
      }
      return api.post('/staff', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      showToast(
        editingStaff ? 'Staff profile updated' : 'Staff member added successfully',
        'success'
      );
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to save staff record', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/staff/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      showToast('Staff profile removed', 'success');
      setDeletingId(null);
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete staff member', 'error');
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-dark flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-brand-gold" />
            Decoration & Operations Crew
          </h1>
          <p className="text-sm text-brand-muted">
            Manage decorators, floral artisans, sound & lighting technicians, and field supervisors.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Crew Member
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 border border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
          <Input
            placeholder="Search by name, role, skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-brand-muted font-medium">Availability:</span>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Available', value: 'AVAILABLE' },
              { label: 'Assigned', value: 'ASSIGNED' },
              { label: 'On Leave', value: 'ON_LEAVE' },
            ]}
            className="h-9 text-xs"
          />
        </div>
      </Card>

      {/* Staff Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="lg" message="Loading crew rosters..." />
        </div>
      ) : filteredStaff.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No crew members found"
          description={
            searchTerm
              ? 'No staff matched your filters.'
              : 'Add your decoration artisans and technicians to assign them to events.'
          }
          actionLabel="Add Crew Member"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStaff.map((staff) => (
            <Card
              key={staff.id}
              className="p-5 border border-brand-border/60 hover:border-brand-gold/60 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center font-serif font-bold text-lg border border-brand-gold/30">
                      {staff.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-brand-dark text-base">
                        {staff.name}
                      </h3>
                      <p className="text-xs font-medium text-brand-gold flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {staff.roleTitle}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      staff.availabilityStatus === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : staff.availabilityStatus === 'ASSIGNED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {staff.availabilityStatus === 'AVAILABLE' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : staff.availabilityStatus === 'ASSIGNED' ? (
                      <Calendar className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {staff.availabilityStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-brand-muted pt-2 border-t border-brand-border/50">
                  <div className="flex items-center gap-2 text-brand-dark font-medium">
                    <Phone className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{staff.phone}</span>
                  </div>
                  {staff.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-brand-gold" />
                      <span className="truncate">{staff.email}</span>
                    </div>
                  )}
                </div>

                {staff.skills && (
                  <div className="pt-2 border-t border-brand-border/40">
                    <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-brand-gold" />
                      Expertise & Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {staff.skills.split(',').map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-brand-bg px-2 py-0.5 rounded-md border border-brand-border text-brand-dark font-medium"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-brand-border/50 flex items-center justify-between">
                <span
                  className={`text-xs font-semibold ${
                    staff.isActive ? 'text-emerald-700' : 'text-brand-muted'
                  }`}
                >
                  {staff.isActive ? 'Active Member' : 'Inactive'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(staff)}
                    className="p-1.5 text-brand-muted hover:text-brand-gold hover:bg-brand-bg rounded-lg transition-colors"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(staff.id)}
                    className="p-1.5 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Staff"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? 'Edit Crew Profile' : 'Add New Crew Member'}
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
            placeholder="e.g. Murugan K."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number *"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91 94432 12345"
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. murugan@sathuragiridecoration.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Role / Designation *"
              required
              value={formData.roleTitle}
              onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
              placeholder="e.g. Chief Floral Artisan"
            />
            <Select
              label="Availability Status"
              value={formData.availabilityStatus}
              onChange={(e) =>
                setFormData({ ...formData, availabilityStatus: e.target.value })
              }
              options={[
                { label: 'Available for Assignments', value: 'AVAILABLE' },
                { label: 'Currently Assigned', value: 'ASSIGNED' },
                { label: 'On Leave', value: 'ON_LEAVE' },
              ]}
            />
          </div>

          <Input
            label="Skills / Specialties (Comma separated)"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            placeholder="e.g. Mandapam Floral, Jasmine Garlands, Truss Setup"
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveStaff"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded text-brand-gold focus:ring-brand-gold"
            />
            <label htmlFor="isActiveStaff" className="text-sm text-brand-dark font-medium cursor-pointer">
              Active Crew Member
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
              {editingStaff ? 'Save Changes' : 'Add Crew Member'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Remove Crew Member"
        message="Are you sure you want to delete this staff member? This will not remove their historical assignment records."
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
};
