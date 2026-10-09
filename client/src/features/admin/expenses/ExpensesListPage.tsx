import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Receipt, 
  Search, 
  Plus, 
  IndianRupee, 
  Calendar, 
  Filter, 
  Layers, 
  Truck, 
  Building2, 
  Edit2, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Expense, Booking, Vendor } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Textarea } from '../../../components/common/Textarea';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { EmptyState } from '../../../components/common/EmptyState';
import { ConfirmDialog } from '../../../components/admin/ConfirmDialog';
import { Pagination } from '../../../components/common/Pagination';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDate } from '../../../lib/utils';

export const ExpensesListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    category: 'FLOWERS',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    bookingId: '',
    vendorId: '',
    paymentMethod: 'UPI',
    receiptUrl: '',
  });

  // Fetch expenses
  const { data, isLoading } = useQuery({
    queryKey: ['admin-expenses', page, searchTerm, categoryFilter],
    queryFn: async () => {
      const res = await api.get<{
        items: Expense[];
        pagination: { total: number; page: number; totalPages: number };
        summary?: { totalExpenses: number };
      }>(
        `/expenses?page=${page}&limit=12&search=${searchTerm}&category=${categoryFilter !== 'ALL' ? categoryFilter : ''}`
      );
      return res.data;
    },
  });

  // Fetch bookings and vendors for selectors
  const { data: bookingsData } = useQuery({
    queryKey: ['admin-bookings-brief'],
    queryFn: async () => {
      const res = await api.get<{ items: Booking[] }>('/bookings?limit=100');
      return res.data.items || [];
    },
  });

  const { data: vendorsList = [] } = useQuery({
    queryKey: ['admin-vendors-brief'],
    queryFn: async () => {
      const res = await api.get<Vendor[]>('/vendors');
      return res.data;
    },
  });

  const expenses = data?.items || [];
  const pagination = data?.pagination;
  const totalExpenseAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        category: expense.category,
        description: expense.description,
        amount: String(expense.amount),
        expenseDate: expense.expenseDate ? expense.expenseDate.split('T')[0] : new Date().toISOString().split('T')[0],
        bookingId: expense.bookingId || '',
        vendorId: expense.vendorId || '',
        paymentMethod: expense.paymentMethod || 'UPI',
        receiptUrl: expense.receiptUrl || '',
      });
    } else {
      setEditingExpense(null);
      setFormData({
        category: 'FLOWERS',
        description: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        bookingId: '',
        vendorId: '',
        paymentMethod: 'UPI',
        receiptUrl: '',
      });
    }
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        bookingId: formData.bookingId || null,
        vendorId: formData.vendorId || null,
      };
      if (editingExpense) {
        return api.put(`/expenses/${editingExpense.id}`, payload);
      }
      return api.post('/expenses', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-kpis'] });
      showToast(
        editingExpense ? 'Expense record updated' : 'Expense recorded successfully',
        'success'
      );
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to save expense', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-kpis'] });
      showToast('Expense entry deleted', 'success');
      setDeletingId(null);
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete expense', 'error');
    },
  });

  const expenseCategories = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Flowers & Garlands', value: 'FLOWERS' },
    { label: 'Decoration Materials & Fabrics', value: 'DECORATION_MATERIALS' },
    { label: 'Lighting & Sound Equipment', value: 'LIGHTING_SOUND' },
    { label: 'Labour & Artisan Wages', value: 'LABOUR' },
    { label: 'Photography & Media', value: 'PHOTOGRAPHY' },
    { label: 'Catering & Food Supplies', value: 'CATERING' },
    { label: 'Transportation & Logistics', value: 'TRANSPORTATION' },
    { label: 'Stall & Pandal Setup', value: 'STALL_SETUP' },
    { label: 'Equipment Rental', value: 'EQUIPMENT_RENTAL' },
    { label: 'Other Expenses', value: 'OTHER' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-dark flex items-center gap-2">
            <Receipt className="w-7 h-7 text-brand-gold" />
            Operational & Event Expenses
          </h1>
          <p className="text-sm text-brand-muted">
            Track material costs, flower purchases, artisan labor wages, and logistics for accurate profit analysis.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Record New Expense
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-4 border border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
          <Input
            placeholder="Search expense description, notes..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-10 h-10 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-brand-muted font-medium">Category:</span>
          <Select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            options={expenseCategories}
            className="h-9 text-xs"
          />
        </div>
      </Card>

      {/* Expenses Table */}
      {isLoading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="lg" message="Calculating expense journals..." />
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses recorded"
          description={
            searchTerm
              ? 'No expenses matched your filter criteria.'
              : 'Record event material purchases, flower wholesale orders, or transport costs.'
          }
          actionLabel="Record Expense"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-brand-border/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-brand-bg/60 border-b border-brand-border text-xs font-semibold text-brand-dark uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Linked Event / Vendor</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-brand-bg/30 transition-colors">
                      <td className="py-3.5 px-4 text-xs font-medium text-brand-muted whitespace-nowrap">
                        {formatDate(exp.expenseDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20 whitespace-nowrap">
                          {exp.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-brand-dark">
                        {exp.description}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-brand-muted">
                        {exp.booking && (
                          <div className="font-semibold text-brand-dark flex items-center gap-1">
                            <span className="text-brand-gold text-[10px]">#{exp.booking.reference}</span>
                            <span className="truncate max-w-[180px]">{exp.booking.eventName}</span>
                          </div>
                        )}
                        {exp.vendor && (
                          <div className="text-brand-muted flex items-center gap-1 text-[11px]">
                            <Building2 className="w-3 h-3 text-brand-gold" />
                            <span>{exp.vendor.businessName}</span>
                          </div>
                        )}
                        {!exp.booking && !exp.vendor && (
                          <span className="italic text-brand-muted/60">General Overhead</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-brand-muted">
                        <span className="bg-brand-bg px-2 py-0.5 rounded text-brand-dark">
                          {exp.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-serif font-bold text-brand-dark text-base whitespace-nowrap">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(exp)}
                            className="p-1.5 text-brand-muted hover:text-brand-gold hover:bg-brand-bg rounded-lg transition-colors"
                            title="Edit Expense"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(exp.id)}
                            className="p-1.5 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Entry"
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

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* Record / Edit Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Expense Category *"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={expenseCategories.filter((c) => c.value !== 'ALL')}
            />

            <Input
              label="Amount (₹) *"
              type="number"
              required
              min="1"
              step="1"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g. 25000"
            />
          </div>

          <Input
            label="Description / Purpose *"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. Fresh Chettinad Jasmine & Bangalore Lotus for Reception Mandapam"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Expense Date *"
              type="date"
              required
              value={formData.expenseDate}
              onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
            />

            <Select
              label="Payment Method *"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              options={[
                { label: 'UPI (GPay / PhonePe)', value: 'UPI' },
                { label: 'Cash', value: 'CASH' },
                { label: 'Bank Transfer (NEFT/IMPS)', value: 'BANK_TRANSFER' },
                { label: 'Card Payment', value: 'CARD' },
                { label: 'Other', value: 'OTHER' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1">
                Linked Event (Optional)
              </label>
              <select
                value={formData.bookingId}
                onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                className="w-full rounded-xl border border-brand-border bg-white p-2.5 text-xs text-brand-dark focus:border-brand-gold focus:outline-none"
              >
                <option value="">-- General Overhead / Not Linked --</option>
                {(bookingsData || []).map((b) => (
                  <option key={b.id} value={b.id}>
                    #{b.reference} — {b.eventName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1">
                Vendor Partner (Optional)
              </label>
              <select
                value={formData.vendorId}
                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                className="w-full rounded-xl border border-brand-border bg-white p-2.5 text-xs text-brand-dark focus:border-brand-gold focus:outline-none"
              >
                <option value="">-- Direct Purchase / No Vendor --</option>
                {vendorsList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.businessName} ({v.category.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
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
              {editingExpense ? 'Save Changes' : 'Record Expense'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Delete Expense Entry"
        message="Are you sure you want to delete this expense record? This will adjust your profit and event balance metrics."
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
};
