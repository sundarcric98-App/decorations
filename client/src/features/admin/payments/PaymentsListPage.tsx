import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Search,
  Plus,
  Download,
  IndianRupee,
  CheckCircle2,
  Calendar,
  User,
  Trash2,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Payment, Booking, Customer } from '../../../types';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Pagination } from '../../../components/common/Pagination';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDate } from '../../../lib/utils';

export const PaymentsListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [page, setPage] = useState(1);
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Form State
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [payAmount, setPayAmount] = useState<number>(50000);
  const [payMethod, setPayMethod] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CARD'>('UPI');
  const [payType, setPayType] = useState<'ADVANCE' | 'PARTIAL' | 'FINAL_SETTLEMENT'>('ADVANCE');
  const [payReference, setPayReference] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Fetch Payments List
  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', page, methodFilter, searchTerm],
    queryFn: () => {
      const methodParam = methodFilter !== 'ALL' ? `paymentMethod=${methodFilter}&` : '';
      const searchParam = searchTerm ? `search=${encodeURIComponent(searchTerm)}&` : '';
      return api.get<any>(`/payments?page=${page}&limit=15&${methodParam}${searchParam}`);
    },
  });

  // Fetch Bookings to record against
  const { data: bookings = [] } = useQuery({
    queryKey: ['payments-bookings-list'],
    queryFn: async () => {
      const res = await api.get<any>('/bookings?limit=100');
      return res.bookings || [];
    },
  });

  const payments: Payment[] = data?.payments || [];
  const meta = data?.meta;

  const recordPaymentMutation = useMutation({
    mutationFn: (payload: any) => api.post('/payments', payload),
    onSuccess: (newPayment: any) => {
      success(`Receipt generated: ${newPayment.receiptNumber}`);
      setIsRecordModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to record payment');
    },
  });

  const handleDownloadReceipt = (id: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api/v1' : '/api/v1');
    window.open(`${apiUrl}/payments/${id}/receipt-pdf`, '_blank');
  };

  const handleRecordSubmit = () => {
    if (!selectedBookingId) {
      error('Please select the target event booking.');
      return;
    }

    const booking = bookings.find((b: any) => b.id === selectedBookingId);
    if (!booking) return;

    recordPaymentMutation.mutate({
      bookingId: booking.id,
      customerId: booking.customerId,
      amount: Number(payAmount),
      paymentMethod: payMethod,
      paymentType: payType,
      reference: payReference || null,
      notes: payNotes || null,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#24211F]">
            Payments & Receipts
          </h1>
          <p className="text-xs text-[#77716B] mt-0.5">
            Record customer advances, milestone settlements, and download official receipts.
          </p>
        </div>
        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsRecordModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Record New Payment
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="p-4 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by receipt #, customer name, transaction ref, or event..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E8E0D6] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#B8955A]/30 focus:border-[#B8955A]"
            />
          </div>

          <Select
            options={[
              { label: 'All Payment Modes', value: 'ALL' },
              { label: 'UPI (GPay / PhonePe)', value: 'UPI' },
              { label: 'Bank Transfer (NEFT/IMPS)', value: 'BANK_TRANSFER' },
              { label: 'Cash', value: 'CASH' },
              { label: 'Card', value: 'CARD' },
            ]}
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-white overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Loading payments records..." />
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No payment records found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#77716B] font-bold uppercase tracking-wider border-b border-[#E8E0D6]">
                <tr>
                  <th className="py-3.5 px-4">Receipt #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Event Booking</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#B8955A]">{p.receiptNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-[#24211F]">{p.customer?.name}</td>
                    <td className="py-3.5 px-4 text-[#77716B]">{p.booking?.eventName || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#96743A] font-semibold text-[10px] border border-[#EBDDBF] uppercase">
                        {p.paymentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold text-[10px]">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#77716B]">{formatDate(p.paymentDate, 'short')}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#24845D]">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDownloadReceipt(p.id)}
                        className="p-1.5 rounded-lg border border-[#E8E0D6] bg-white text-[#56504A] hover:text-[#B8955A] hover:bg-[#FAF7F2] transition-colors"
                        title="Download Receipt PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && (
          <div className="p-4">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              itemsPerPage={meta.limit}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </Card>

      {/* RECORD PAYMENT MODAL */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record New Payment Receipt"
        maxWidth="md"
      >
        <div className="space-y-4">
          <Select
            label="Target Event Booking"
            options={[
              { label: 'Select Confirmed Booking...', value: '' },
              ...bookings.map((b: any) => ({
                label: `${b.reference} — ${b.eventName} (${b.customer?.name})`,
                value: b.id,
              })),
            ]}
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            required
          />

          <Input
            label="Amount Received (INR)"
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(Number(e.target.value))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Payment Stage"
              options={[
                { label: 'Advance Payment', value: 'ADVANCE' },
                { label: 'Partial Payment', value: 'PARTIAL' },
                { label: 'Final Settlement', value: 'FINAL_SETTLEMENT' },
              ]}
              value={payType}
              onChange={(e) => setPayType(e.target.value as any)}
            />

            <Select
              label="Payment Mode"
              options={[
                { label: 'UPI / GPay / PhonePe', value: 'UPI' },
                { label: 'Bank Transfer (IMPS/NEFT)', value: 'BANK_TRANSFER' },
                { label: 'Cash', value: 'CASH' },
                { label: 'Card', value: 'CARD' },
              ]}
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as any)}
            />
          </div>

          <Input
            label="Transaction ID / Reference (Optional)"
            placeholder="e.g. UPI/20261009/001928"
            value={payReference}
            onChange={(e) => setPayReference(e.target.value)}
          />

          <Input
            label="Internal Notes"
            placeholder="e.g. Received via business account scanner"
            value={payNotes}
            onChange={(e) => setPayNotes(e.target.value)}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <Button variant="secondary" size="sm" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={recordPaymentMutation.isPending}
              disabled={!selectedBookingId || !payAmount}
              onClick={handleRecordSubmit}
            >
              Issue Payment Receipt
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
