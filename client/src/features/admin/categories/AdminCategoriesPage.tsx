import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layers, Plus, Edit, Trash2, Upload, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api, ApiError } from '../../../lib/api';
import { EventCategory } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Textarea } from '../../../components/common/Textarea';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { useToast } from '../../../context/ToastContext';

export const AdminCategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch all categories (admin sees active and inactive)
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories-list'],
    queryFn: () => api.get<EventCategory[]>('/admin/categories'),
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setCoverImageUrl('');
    setDisplayOrder(categories.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: EventCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setCoverImageUrl(cat.cover_image_url || cat.coverImage || '');
    setDisplayOrder(cat.display_order ?? 0);
    setIsActive(cat.is_active ?? cat.isActive ?? true);
    setIsModalOpen(true);
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await api.post<any>('/admin/upload', formData);
      const uploadedUrl = res.url || res.image_url;
      if (uploadedUrl) {
        setCoverImageUrl(uploadedUrl);
        success('Category cover image uploaded to Supabase Storage');
      }
    } catch (err: any) {
      error(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories-list'] });
      queryClient.invalidateQueries({ queryKey: ['public-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      success('Category created successfully');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      error(err.message || 'Failed to create category');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/admin/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories-list'] });
      queryClient.invalidateQueries({ queryKey: ['public-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      success('Category updated successfully');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update category');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories-list'] });
      queryClient.invalidateQueries({ queryKey: ['public-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      success('Category deleted successfully');
      setIsDeleting(null);
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete category');
      setIsDeleting(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Category name is required');
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim(),
      cover_image_url: coverImageUrl.trim(),
      display_order: Number(displayOrder),
      is_active: Boolean(isActive),
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (cat: EventCategory) => {
    if (cat.projectCount && cat.projectCount > 0) {
      error(
        `Cannot delete "${cat.name}": It has ${cat.projectCount} project(s) assigned. Reassign or delete those projects first.`
      );
      return;
    }

    if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      setIsDeleting(cat.id);
      deleteMutation.mutate(cat.id);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading event categories..." fullHeight />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B8955A]">
            Catalogue Configuration
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#28231F] mt-1">
            Event Categories Management
          </h1>
          <p className="text-xs sm:text-sm text-[#77716B] mt-1">
            Add, reorder, activate or deactivate celebration categories shown to prospective clients.
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
        >
          Add New Category
        </Button>
      </div>

      {/* Categories Table / Card Grid */}
      <div className="bg-white rounded-2xl border border-[#E8E0D6] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF7F2] text-xs font-semibold text-[#77716B] border-b border-[#E8E0D6] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Projects</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E0D6]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-[#B8955A] w-16">
                    #{cat.display_order ?? 0}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-[#E8E0D6]">
                        <img
                          src={
                            cat.cover_image_url ||
                            cat.coverImage ||
                            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=200&q=80'
                          }
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-[#28231F]">{cat.name}</p>
                        <p className="text-xs text-[#77716B] line-clamp-1 max-w-xs">
                          {cat.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-gray-500">
                    {cat.slug}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        cat.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {cat.is_active ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Active (Public)</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Inactive (Hidden)</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-[#FAF7F2] border border-[#E8E0D6] text-[#28231F]">
                      {cat.projectCount || 0} project{cat.projectCount === 1 ? '' : 's'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#B8955A] hover:bg-[#FAF7F2] transition-colors"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={isDeleting === cat.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#28231F] mb-1">
              Category Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wedding Decoration"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#28231F] mb-1">
              Slug (URL Identifier)
            </label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. wedding-decoration (leave blank to auto-generate)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#28231F] mb-1">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief summary of services included in this category..."
            />
          </div>

          {/* Cover Image Upload / URL */}
          <div>
            <label className="block text-xs font-semibold text-[#28231F] mb-1">
              Cover Image URL
            </label>
            <div className="flex gap-2">
              <Input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://... or upload below"
                className="flex-1"
              />
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6] text-xs font-semibold text-[#28231F] hover:bg-[#B8955A]/10 hover:border-[#B8955A] transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#B8955A]" />
                <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
            {coverImageUrl && (
              <div className="mt-2 h-24 rounded-xl overflow-hidden bg-gray-100 border border-[#E8E0D6]">
                <img
                  src={coverImageUrl}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                Visibility Status
              </label>
              <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#B8955A] rounded-sm focus:ring-[#B8955A]"
                />
                <span className="text-xs font-medium text-[#28231F]">
                  Active on Public Website
                </span>
              </label>
            </div>
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
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default AdminCategoriesPage;
