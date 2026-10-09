import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Search,
  Plus,
  Eye,
  AlertTriangle,
  Calendar,
  IndianRupee,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Booking, BookingStatus, Customer } from '../../../types';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Textarea } from '../../../components/common/Textarea';
import { Pagination } from '../../../components/common/Pagination';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDate } from '../../../lib/utils';

export const BookingsListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Booking Form State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newEventName, setNewEventName] = useState('');
  const [newEventType, setNewEventType] = useState('Traditional Wedding');
  const [newStartDate, setNewStartDate] = useState('');
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueCity, setNewVenueCity] = useState('Madurai');
  const [newTotalAmount, setNewTotalAmount] = useState<number>(185000);

  // Overlap check state
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);

  // Fetch bookings list
  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', page, statusFilter, searchTerm],
    queryFn: () => {
      const statusParam = statusFilter !== 'ALL' ? `status=${statusFilter}&` : '';
      const searchParam = searchTerm ? `search=${encodeURIComponent(searchTerm)}&` : '';
      return api.get<any>(`/bookings?page=${page}&limit=15&${statusParam}${searchParam}`);
    },
  });

  const bookings: Booking[] = data?.bookings || [];
  const meta = data?.meta;

  // Check overlap when start date or venue changes
  const checkOverlap = async (date: string, venue: string) => {
    if (!date) return;
    try {
      const res = await api.get<any>(`/bookings/check-overlap?startDate=${date}&venueName=${encodeURIComponent(venue)}`);
      if (res?.hasOverlap) {
        setOverlapWarning(
          `⚠️ Note: ${res.overlappingCount} other event(s) are already scheduled around this date.`
        );
      } else {
        setOverlapWarning(null);
      }
    } catch (e) {
      // Ignore
    }
  };

  // Create Booking Mutation
  const createBookingMutation = useMutation({
    mutationFn: async () => {
      // 1. Create or find customer
      const customer = await api.post<Customer>('/customers', {
        name: newCustomerName,
        phone: newCustomerPhone,
        email: newCustomerEmail || undefined,
      });

      // 2. Create booking
      return api.post<Booking>('/bookings', {
        customerId: customer.id,
        eventName: newEventName,
        eventType: newEventType,
        startDate: new Date(newStartDate).toISOString(),
        venueName: newVenueName,
        venueCity: newVenueCity,
        totalAmount: Number(newTotalAmount),
        finalAmount: Number(newTotalAmount),
        status: 'CONFIRMED',
      });
    },
    onSuccess: (booking) => {
      success(`Booking created successfully: ${booking.reference}`);
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      navigate(`/admin/bookings/${booking.id}`);
    },
    onError: (err: any) => {
      error(err.message || 'Failed to create booking');
    },
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#24211F]">
            Booking Management
          </h1>
          <p className="text-xs text-[#77716B] mt-0.5">
            Confirmed marriage functions, reception stage schedules, and payment balances.
          </p>
        </div>
        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Create Direct Booking
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="p-4 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event name, reference, client, or venue..."
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
              { label: 'All Booking Statuses', value: 'ALL' },
              { label: 'Confirmed', value: 'CONFIRMED' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Tentative', value: 'TENTATIVE' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </Card>

      {/* Data Table */}
      <Card className="bg-white overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Loading bookings..." />
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No booking records found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#77716B] font-bold uppercase tracking-wider border-b border-[#E8E0D6]">
                <tr>
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Event Name</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Start Date</th>
                  <th className="py-3.5 px-4">Venue</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-right">Paid</th>
                  <th className="py-3.5 px-4 text-right">Balance</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((bkg) => (
                  <tr key={bkg.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#B8955A]">{bkg.reference}</td>
                    <td className="py-3.5 px-4 font-bold text-[#24211F]">{bkg.eventName}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#24211F]">{bkg.customer?.name}</p>
                      <p className="text-[11px] text-[#77716B]">{bkg.customer?.phone}</p>
                    </td>
                    <td className="py-3.5 px-4 text-[#77716B]">{formatDate(bkg.startDate, 'short')}</td>
                    <td className="py-3.5 px-4 text-[#77716B]">
                      {bkg.venueName || '—'}, {bkg.venueCity || ''}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={bkg.status} type="booking" />
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#24211F]">
                      {formatCurrency(bkg.finalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#24845D]">
                      {formatCurrency(bkg.totalPaid)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#C74646]">
                      {formatCurrency(bkg.balance)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/bookings/${bkg.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#B8955A] hover:underline"
                      >
                        Manage <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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

      {/* CREATE DIRECT BOOKING MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Direct Event Booking"
        subtitle="Manually create a new confirmed booking in the system"
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer Full Name"
              placeholder="e.g. Soundarya Swaminathan"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              required
            />
            <Input
              label="Customer Phone Number"
              placeholder="e.g. +91 98765 43211"
              value={newCustomerPhone}
              onChange={(e) => setNewCustomerPhone(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Event Name / Title"
              placeholder="e.g. Arvind & Soundarya Ring Ceremony"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              required
            />
            <Select
              label="Event Type"
              options={[
                { label: 'Traditional Wedding', value: 'Traditional Wedding' },
                { label: 'Grand Reception', value: 'Grand Reception' },
                { label: 'Engagement Ceremony', value: 'Engagement Ceremony' },
                { label: 'Haldi & Sangeet', value: 'Haldi & Sangeet' },
                { label: 'Birthday Celebration', value: 'Birthday Celebration' },
                { label: 'Corporate Event', value: 'Corporate Event' },
              ]}
              value={newEventType}
              onChange={(e) => setNewEventType(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Event Start Date"
              type="date"
              value={newStartDate}
              onChange={(e) => {
                setNewStartDate(e.target.value);
                checkOverlap(e.target.value, newVenueName);
              }}
              required
            />
            <Input
              label="Venue Name"
              placeholder="e.g. Heritage Madurai Lawn"
              value={newVenueName}
              onChange={(e) => {
                setNewVenueName(e.target.value);
                checkOverlap(newStartDate, e.target.value);
              }}
            />
            <Input
              label="City"
              placeholder="e.g. Madurai"
              value={newVenueCity}
              onChange={(e) => setNewVenueCity(e.target.value)}
            />
          </div>

          {overlapWarning && (
            <div className="p-3 bg-[#FEF6EE] border border-[#D97706]/30 text-[#D97706] rounded-xl text-xs font-medium">
              {overlapWarning}
            </div>
          )}

          <Input
            label="Total Agreed Booking Amount (INR)"
            type="number"
            value={newTotalAmount}
            onChange={(e) => setNewTotalAmount(Number(e.target.value))}
            required
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <Button variant="secondary" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={createBookingMutation.isPending}
              disabled={!newCustomerName || !newCustomerPhone || !newEventName || !newStartDate}
              onClick={() => createBookingMutation.mutate()}
            >
              Save Booking Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
