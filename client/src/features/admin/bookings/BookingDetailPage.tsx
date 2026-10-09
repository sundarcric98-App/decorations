import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarCheck,
  ArrowLeft,
  IndianRupee,
  Clock,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Building2,
  Plus,
  Trash2,
  CreditCard,
  FileText,
  Sparkles,
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Booking, BookingStatus, StaffProfile, Vendor } from '../../../types';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDate } from '../../../lib/utils';

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Assignment form state
  const [assignType, setAssignType] = useState<'staff' | 'vendor'>('staff');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [assignRole, setAssignRole] = useState('Lead Stage Decorator');
  const [assignNotes, setAssignNotes] = useState('');

  // Payment form state
  const [payAmount, setPayAmount] = useState<number>(50000);
  const [payMethod, setPayMethod] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CARD'>('UPI');
  const [payType, setPayType] = useState<'ADVANCE' | 'PARTIAL' | 'FINAL_SETTLEMENT'>('ADVANCE');
  const [payReference, setPayReference] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Fetch Booking Details
  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['admin-booking-detail', id],
    queryFn: () => api.get<Booking>(`/bookings/${id}`),
    enabled: !!id,
  });

  // Fetch Staff and Vendors for assignment
  const { data: staffList = [] } = useQuery({
    queryKey: ['admin-staff-list'],
    queryFn: () => api.get<StaffProfile[]>('/staff?active=true'),
  });

  const { data: vendorsList = [] } = useQuery({
    queryKey: ['admin-vendors-list'],
    queryFn: () => api.get<Vendor[]>('/vendors?active=true'),
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: BookingStatus) =>
      api.patch(`/bookings/${id}`, { status: newStatus }),
    onSuccess: () => {
      success('Booking status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-booking-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
    onError: (err: any) => {
      error(err.message || 'Status update failed');
    },
  });

  // Add Assignment Mutation
  const addAssignmentMutation = useMutation({
    mutationFn: (payload: any) => api.post(`/bookings/${id}/assignments`, payload),
    onSuccess: () => {
      success('Staff/Vendor assigned successfully');
      setIsAssignModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-booking-detail', id] });
    },
    onError: (err: any) => {
      error(err.message || 'Assignment failed');
    },
  });

  // Remove Assignment Mutation
  const removeAssignmentMutation = useMutation({
    mutationFn: (assignmentId: string) =>
      api.delete(`/bookings/${id}/assignments/${assignmentId}`),
    onSuccess: () => {
      success('Assignment removed');
      queryClient.invalidateQueries({ queryKey: ['admin-booking-detail', id] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to remove assignment');
    },
  });

  // Record Payment Mutation
  const recordPaymentMutation = useMutation({
    mutationFn: (payload: any) => api.post('/payments', payload),
    onSuccess: (newPayment: any) => {
      success(`Payment recorded: ${newPayment.receiptNumber}`);
      setIsPaymentModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-booking-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to record payment');
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading booking details..." fullHeight />;
  }

  if (isError || !booking) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#24211F]">Booking Not Found</h2>
        <Link to="/admin/bookings">
          <Button variant="gold" size="sm">Back to Bookings</Button>
        </Link>
      </div>
    );
  }

  const handleCreateAssignment = () => {
    addAssignmentMutation.mutate({
      staffId: assignType === 'staff' ? selectedStaffId : null,
      vendorId: assignType === 'vendor' ? selectedVendorId : null,
      role: assignRole,
      notes: assignNotes || null,
    });
  };

  const handleRecordPayment = () => {
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
    <div className="space-y-8 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77716B] hover:text-[#B8955A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Bookings
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#24211F]">
              {booking.eventName}
            </h1>
            <span className="font-mono text-sm font-bold text-[#B8955A] bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#EBDDBF]">
              {booking.reference}
            </span>
          </div>
        </div>

        {/* Status Dropdown & Payment Action */}
        <div className="flex items-center gap-3">
          <select
            value={booking.status}
            onChange={(e) => updateStatusMutation.mutate(e.target.value as BookingStatus)}
            className="text-xs font-bold px-3.5 py-2 rounded-xl border border-[#B8955A] bg-[#FAF7F2] text-[#96743A]"
          >
            <option value="DRAFT">Draft</option>
            <option value="TENTATIVE">Tentative</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <Button
            variant="gold"
            size="sm"
            onClick={() => setIsPaymentModalOpen(true)}
            leftIcon={<CreditCard className="w-3.5 h-3.5" />}
          >
            Record Payment
          </Button>
        </div>
      </div>

      {/* 1. FINANCIAL METRICS RIBBON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 bg-white">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#77716B] block">Total Contract Value</span>
          <div className="font-serif text-xl font-bold text-[#24211F] mt-1">
            {formatCurrency(booking.finalAmount)}
          </div>
        </Card>
        <Card className="p-4 bg-white">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#77716B] block">Revenue Received</span>
          <div className="font-serif text-xl font-bold text-[#24845D] mt-1">
            {formatCurrency(booking.totalPaid)}
          </div>
        </Card>
        <Card className="p-4 bg-white">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#77716B] block">Outstanding Balance</span>
          <div className="font-serif text-xl font-bold text-[#C74646] mt-1">
            {formatCurrency(booking.balance)}
          </div>
        </Card>
        <Card className="p-4 bg-white">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#77716B] block">Direct Expenses</span>
          <div className="font-serif text-xl font-bold text-[#77716B] mt-1">
            {formatCurrency(booking.totalExpenses)}
          </div>
        </Card>
        <Card className="p-4 bg-white">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#77716B] block">Estimated Profit</span>
          <div className="font-serif text-xl font-bold text-[#B8955A] mt-1">
            {formatCurrency(booking.estimatedProfit)}
          </div>
        </Card>
      </div>

      {/* 2. MAIN GRID: Client & Event on left, Services & Crew on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Customer & Event Details) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-white space-y-4">
            <h3 className="font-serif text-base font-bold text-[#24211F] border-b border-gray-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#B8955A]" /> Client Profile
            </h3>
            <div className="space-y-2.5 text-xs text-[#56504A]">
              <div>
                <span className="text-[#77716B] block text-[11px]">Client Name</span>
                <p className="font-bold text-[#24211F] text-sm">{booking.customer?.name}</p>
              </div>
              <div>
                <span className="text-[#77716B] block text-[11px]">Phone Number</span>
                <a href={`tel:${booking.customer?.phone}`} className="font-semibold text-[#B8955A] hover:underline">
                  {booking.customer?.phone}
                </a>
              </div>
              {booking.customer?.email && (
                <div>
                  <span className="text-[#77716B] block text-[11px]">Email</span>
                  <p className="text-[#24211F]">{booking.customer.email}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-white space-y-4">
            <h3 className="font-serif text-base font-bold text-[#24211F] border-b border-gray-100 pb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#B8955A]" /> Event Logistics
            </h3>
            <div className="space-y-3 text-xs text-[#56504A]">
              <div>
                <span className="text-[#77716B] block text-[11px]">Event Date</span>
                <p className="font-bold text-[#24211F]">{formatDate(booking.startDate, 'time')}</p>
              </div>
              <div>
                <span className="text-[#77716B] block text-[11px]">Venue & Hall</span>
                <p className="font-semibold text-[#24211F]">
                  {booking.venueName || 'Venue TBD'}, {booking.venueCity || ''}
                </p>
                {booking.venueAddress && <p className="text-[#77716B] text-[11px] mt-0.5">{booking.venueAddress}</p>}
              </div>
              {booking.guestCount && (
                <div>
                  <span className="text-[#77716B] block text-[11px]">Expected Guests</span>
                  <p className="font-semibold text-[#24211F]">{booking.guestCount} Attendees</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column (Services, Assignments, Payments) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Services Breakdown */}
          <Card className="p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-base font-bold text-[#24211F] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B8955A]" /> Contracted Services & Setup
              </h3>
              <Link to={`/admin/quotations?create=true&bookingId=${booking.id}`}>
                <Button variant="secondary" size="sm" leftIcon={<FileText className="w-3.5 h-3.5 text-[#B8955A]" />}>
                  Create Quotation
                </Button>
              </Link>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              {booking.services && booking.services.length > 0 ? (
                booking.services.map((svc) => (
                  <div key={svc.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#24211F]">{svc.serviceName}</p>
                      {svc.notes && <p className="text-[11px] text-[#77716B] mt-0.5">{svc.notes}</p>}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#B8955A]">{formatCurrency(svc.unitPrice * svc.quantity)}</span>
                      <span className="text-[10px] text-gray-400 block">Qty: {svc.quantity}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic py-3 text-center">
                  No individual service line items mapped yet. Total agreed contract: {formatCurrency(booking.finalAmount)}
                </p>
              )}
            </div>
          </Card>

          {/* Assigned Staff & Vendors */}
          <Card className="p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-base font-bold text-[#24211F] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#B8955A]" /> Assigned Crew & Suppliers
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAssignModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5 text-[#B8955A]" />}
              >
                Assign Staff / Vendor
              </Button>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              {booking.assignments && booking.assignments.length > 0 ? (
                booking.assignments.map((asgn) => (
                  <div key={asgn.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#24211F]">
                        {asgn.staff ? asgn.staff.name : asgn.vendor?.businessName}
                      </p>
                      <p className="text-[11px] text-[#B8955A] font-semibold">{asgn.role}</p>
                      {asgn.notes && <p className="text-[10px] text-[#77716B]">{asgn.notes}</p>}
                    </div>
                    <button
                      onClick={() => removeAssignmentMutation.mutate(asgn.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#C74646] hover:bg-[#FDF2F2] transition-colors"
                      title="Remove Assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic py-3 text-center">
                  No staff or vendors assigned to this event yet.
                </p>
              )}
            </div>
          </Card>

          {/* Payment Receipts History */}
          <Card className="p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-base font-bold text-[#24211F] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#B8955A]" /> Payment Receipts
              </h3>
              <Button
                variant="gold"
                size="sm"
                onClick={() => setIsPaymentModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Record Payment
              </Button>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              {booking.payments && booking.payments.length > 0 ? (
                booking.payments.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-[#B8955A]">{p.receiptNumber}</p>
                      <p className="text-[11px] text-[#77716B]">
                        {p.paymentMethod} • {formatDate(p.paymentDate, 'short')} {p.reference ? `(${p.reference})` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#24845D]">{formatCurrency(p.amount)}</span>
                      <span className="text-[10px] text-gray-400 block capitalize">{p.paymentType.toLowerCase()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic py-3 text-center">
                  No payments recorded for this booking yet.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ASSIGN STAFF / VENDOR MODAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Crew Member or Vendor"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-1 bg-[#FAF7F2] rounded-xl border border-[#E8E0D6]">
            <button
              type="button"
              onClick={() => setAssignType('staff')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                assignType === 'staff' ? 'bg-[#B8955A] text-white shadow-xs' : 'text-[#77716B]'
              }`}
            >
              Internal Staff
            </button>
            <button
              type="button"
              onClick={() => setAssignType('vendor')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                assignType === 'vendor' ? 'bg-[#B8955A] text-white shadow-xs' : 'text-[#77716B]'
              }`}
            >
              External Vendor
            </button>
          </div>

          {assignType === 'staff' ? (
            <Select
              label="Select Staff Member"
              options={staffList.map((s) => ({ label: `${s.name} (${s.roleTitle})`, value: s.id }))}
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
            />
          ) : (
            <Select
              label="Select Vendor"
              options={vendorsList.map((v) => ({ label: `${v.businessName} (${v.category})`, value: v.id }))}
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
            />
          )}

          <Input
            label="Assigned Role / Responsibility"
            value={assignRole}
            onChange={(e) => setAssignRole(e.target.value)}
            required
          />

          <Input
            label="Assignment Notes / Instructions"
            placeholder="e.g. Arrive at 6 PM for mandapam flower hangings"
            value={assignNotes}
            onChange={(e) => setAssignNotes(e.target.value)}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <Button variant="secondary" size="sm" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={addAssignmentMutation.isPending}
              onClick={handleCreateAssignment}
            >
              Confirm Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* RECORD PAYMENT MODAL */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment Receipt"
        subtitle={`Booking: ${booking.reference} — ${booking.customer?.name}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label="Amount Received (INR)"
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(Number(e.target.value))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Payment Type"
              options={[
                { label: 'Advance Payment', value: 'ADVANCE' },
                { label: 'Partial Payment', value: 'PARTIAL' },
                { label: 'Final Settlement', value: 'FINAL_SETTLEMENT' },
              ]}
              value={payType}
              onChange={(e) => setPayType(e.target.value as any)}
            />

            <Select
              label="Payment Method"
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
            label="Transaction Reference / Cheque #"
            placeholder="e.g. UPI/20261009/001928"
            value={payReference}
            onChange={(e) => setPayReference(e.target.value)}
          />

          <Input
            label="Receipt Notes"
            placeholder="e.g. Received 30% advance for booking confirmation"
            value={payNotes}
            onChange={(e) => setPayNotes(e.target.value)}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <Button variant="secondary" size="sm" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={recordPaymentMutation.isPending}
              onClick={handleRecordPayment}
            >
              Generate Receipt
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
