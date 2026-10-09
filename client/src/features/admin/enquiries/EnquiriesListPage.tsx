import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  CalendarCheck,
  Phone,
  Calendar,
  Sparkles,
  Plus,
  ArrowRight,
  Clock,
  User,
  CheckCircle2,
  FileEdit,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Enquiry, EnquiryStatus } from '../../../types';
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

export const EnquiriesListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  // Follow-up note state
  const [noteText, setNoteText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Convert to booking state
  const [bookingEventName, setBookingEventName] = useState('');
  const [bookingTotalAmount, setBookingTotalAmount] = useState<number>(150000);
  const [bookingAdvanceAmount, setBookingAdvanceAmount] = useState<number>(50000);

  // Fetch enquiries with filters
  const { data, isLoading } = useQuery({
    queryKey: ['admin-enquiries', page, statusFilter, eventTypeFilter, searchTerm],
    queryFn: () => {
      const statusParam = statusFilter !== 'ALL' ? `status=${statusFilter}&` : '';
      const typeParam = eventTypeFilter !== 'ALL' ? `eventType=${eventTypeFilter}&` : '';
      const searchParam = searchTerm ? `search=${encodeURIComponent(searchTerm)}&` : '';
      return api.get<any>(`/enquiries?page=${page}&limit=15&${statusParam}${typeParam}${searchParam}`);
    },
  });

  const enquiries: Enquiry[] = data?.enquiries || [];
  const meta = data?.meta;

  // Add Note Mutation
  const addNoteMutation = useMutation({
    mutationFn: ({ enquiryId, note, followUpDate }: { enquiryId: string; note: string; followUpDate?: string }) =>
      api.post(`/enquiries/${enquiryId}/notes`, { note, followUpDate: followUpDate || undefined }),
    onSuccess: (newNote) => {
      success('Follow-up note recorded');
      setNoteText('');
      setFollowUpDate('');
      queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
      if (selectedEnquiry) {
        setSelectedEnquiry({
          ...selectedEnquiry,
          notes: [newNote, ...(selectedEnquiry.notes || [])],
        });
      }
    },
    onError: (err: any) => {
      error(err.message || 'Failed to add follow-up note');
    },
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EnquiryStatus }) =>
      api.patch(`/enquiries/${id}`, { status }),
    onSuccess: () => {
      success('Enquiry status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update status');
    },
  });

  // Convert to Booking Mutation
  const convertMutation = useMutation({
    mutationFn: (enquiryId: string) =>
      api.post(`/enquiries/${enquiryId}/convert`, {
        eventName: bookingEventName,
        totalAmount: Number(bookingTotalAmount) || 0,
        finalAmount: Number(bookingTotalAmount) || 0,
      }),
    onSuccess: (booking: any) => {
      success(`Enquiry converted to Booking: ${booking.reference}`);
      setIsConvertModalOpen(false);
      setIsDetailModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
    onError: (err: any) => {
      error(err.message || 'Conversion failed');
    },
  });

  const openDetails = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsDetailModalOpen(true);
  };

  const handleOpenConvert = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setBookingEventName(enquiry.eventTitle || `${enquiry.eventType} for ${enquiry.customer.name}`);
    setIsConvertModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#24211F]">
            Enquiry Management
          </h1>
          <p className="text-xs text-[#77716B] mt-0.5">
            Track incoming leads, schedule venue consultations, and convert inquiries into confirmed bookings.
          </p>
        </div>
        <Link to="/book-event">
          <Button variant="gold" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            New Manual Enquiry
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer, phone, ref, or city..."
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
              { label: 'All Statuses', value: 'ALL' },
              { label: 'New', value: 'NEW' },
              { label: 'Contacted', value: 'CONTACTED' },
              { label: 'Consultation Scheduled', value: 'CONSULTATION_SCHEDULED' },
              { label: 'Quotation Sent', value: 'QUOTATION_SENT' },
              { label: 'Negotiation', value: 'NEGOTIATION' },
              { label: 'Converted', value: 'CONVERTED' },
              { label: 'Lost', value: 'LOST' },
              { label: 'Archived', value: 'ARCHIVED' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />

          <Select
            options={[
              { label: 'All Event Types', value: 'ALL' },
              { label: 'Traditional Wedding', value: 'Traditional Wedding' },
              { label: 'Grand Reception', value: 'Grand Reception' },
              { label: 'Engagement Ceremony', value: 'Engagement Ceremony' },
              { label: 'Haldi & Sangeet', value: 'Haldi & Sangeet' },
              { label: 'Birthday Celebration', value: 'Birthday Celebration' },
              { label: 'Corporate Event', value: 'Corporate Event' },
            ]}
            value={eventTypeFilter}
            onChange={(e) => {
              setEventTypeFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </Card>

      {/* Enquiries Data Table */}
      <Card className="bg-white overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Loading enquiries..." />
        ) : enquiries.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No enquiries found matching your search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#77716B] font-bold uppercase tracking-wider border-b border-[#E8E0D6]">
                <tr>
                  <th className="py-3.5 px-4">Ref #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Event Type</th>
                  <th className="py-3.5 px-4">Event Date</th>
                  <th className="py-3.5 px-4">Venue & City</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#B8955A]">{enq.reference}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#24211F]">{enq.customer?.name}</p>
                      <p className="text-[11px] text-[#77716B]">{enq.customer?.phone}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#24211F]">{enq.eventType}</td>
                    <td className="py-3.5 px-4 text-[#77716B]">{formatDate(enq.eventDate, 'short')}</td>
                    <td className="py-3.5 px-4 text-[#77716B]">
                      {enq.venueName ? `${enq.venueName}, ` : ''}{enq.venueCity || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={enq.status} type="enquiry" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openDetails(enq)}
                        className="p-1.5 rounded-lg border border-[#E8E0D6] bg-white text-[#56504A] hover:text-[#B8955A] hover:bg-[#FAF7F2] transition-colors"
                        title="View Complete Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {enq.status !== 'CONVERTED' && (
                        <button
                          onClick={() => handleOpenConvert(enq)}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#B8955A]/50 text-[11px] font-bold text-[#96743A] hover:bg-[#B8955A] hover:text-white transition-colors"
                          title="Convert to Booking"
                        >
                          Convert
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && (
          <div className="p-4">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              itemsPerPage={meta.limit}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </Card>

      {/* DETAIL MODAL WITH FOLLOW-UP NOTES */}
      {selectedEnquiry && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Enquiry: ${selectedEnquiry.reference}`}
          subtitle={`${selectedEnquiry.eventType} for ${selectedEnquiry.customer?.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8E0D6] text-xs">
              <div>
                <span className="text-[#77716B] block">Customer Phone</span>
                <span className="font-bold text-[#24211F]">{selectedEnquiry.customer?.phone}</span>
              </div>
              <div>
                <span className="text-[#77716B] block">Email</span>
                <span className="font-bold text-[#24211F]">{selectedEnquiry.customer?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#77716B] block">Preferred Contact</span>
                <span className="font-bold text-[#24211F]">{selectedEnquiry.preferredContactMethod}</span>
              </div>
              <div>
                <span className="text-[#77716B] block">Event Date</span>
                <span className="font-bold text-[#24211F]">{formatDate(selectedEnquiry.eventDate, 'short')}</span>
              </div>
              <div>
                <span className="text-[#77716B] block">Venue</span>
                <span className="font-bold text-[#24211F]">
                  {selectedEnquiry.venueName || 'TBD'}, {selectedEnquiry.venueCity || ''}
                </span>
              </div>
              <div>
                <span className="text-[#77716B] block">Budget Range</span>
                <span className="font-bold text-[#B8955A]">{selectedEnquiry.budgetRange || 'Flexible'}</span>
              </div>
            </div>

            {/* Custom Requirements */}
            {selectedEnquiry.customRequirements && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#24211F]">
                  Customer Notes & Requirements:
                </span>
                <p className="text-xs text-[#56504A] p-3.5 bg-white border border-[#E8E0D6] rounded-xl whitespace-pre-line leading-relaxed">
                  {selectedEnquiry.customRequirements}
                </p>
              </div>
            )}

            {/* Status Update Dropdown */}
            <div className="flex items-center justify-between p-3.5 bg-white border border-[#E8E0D6] rounded-xl">
              <span className="text-xs font-bold text-[#24211F]">Change Pipeline Status:</span>
              <select
                value={selectedEnquiry.status}
                onChange={(e) => {
                  const newStatus = e.target.value as EnquiryStatus;
                  setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
                  updateStatusMutation.mutate({ id: selectedEnquiry.id, status: newStatus });
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#B8955A] bg-[#FAF7F2] text-[#96743A]"
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CONSULTATION_SCHEDULED">Consultation Scheduled</option>
                <option value="QUOTATION_SENT">Quotation Sent</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="CONVERTED">Converted</option>
                <option value="LOST">Lost</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Follow-up Notes Log */}
            <div className="space-y-3 pt-2">
              <h4 className="font-serif text-sm font-bold text-[#24211F] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#B8955A]" /> Follow-up Notes & Contact History
              </h4>

              <div className="flex gap-2">
                <Input
                  placeholder="Record customer discussion / next action..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="flex-1 text-xs"
                />
                <Input
                  type="date"
                  placeholder="Follow-up Date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-36 text-xs"
                />
                <Button
                  size="sm"
                  variant="gold"
                  disabled={!noteText.trim() || addNoteMutation.isPending}
                  onClick={() =>
                    addNoteMutation.mutate({
                      enquiryId: selectedEnquiry.id,
                      note: noteText,
                      followUpDate: followUpDate || undefined,
                    })
                  }
                >
                  Add Note
                </Button>
              </div>

              {/* List of notes */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedEnquiry.notes && selectedEnquiry.notes.length > 0 ? (
                  selectedEnquiry.notes.map((n) => (
                    <div key={n.id} className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E0D6] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#77716B]">
                        <span className="font-bold text-[#24211F]">{n.user?.name || 'Staff'}</span>
                        <span>{formatDate(n.createdAt, 'short')}</span>
                      </div>
                      <p className="text-[#56504A]">{n.note}</p>
                      {n.followUpDate && (
                        <p className="text-[10px] text-[#D97706] font-semibold">
                          📅 Follow-up scheduled for: {formatDate(n.followUpDate, 'short')}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-2">No follow-up notes recorded yet.</p>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <Button variant="secondary" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              {selectedEnquiry.status !== 'CONVERTED' && (
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenConvert(selectedEnquiry);
                  }}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Convert to Booking
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* CONVERT TO BOOKING MODAL */}
      {selectedEnquiry && (
        <Modal
          isOpen={isConvertModalOpen}
          onClose={() => setIsConvertModalOpen(false)}
          title="Convert Enquiry to Booking"
          subtitle={`Converting ${selectedEnquiry.reference} for ${selectedEnquiry.customer?.name}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-[#77716B]">
              This will create a new confirmed booking record linked to this enquiry and update the pipeline status.
            </p>

            <Input
              label="Official Event Name"
              value={bookingEventName}
              onChange={(e) => setBookingEventName(e.target.value)}
              required
            />

            <Input
              label="Agreed Total Amount (INR)"
              type="number"
              value={bookingTotalAmount}
              onChange={(e) => setBookingTotalAmount(Number(e.target.value))}
              required
            />

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <Button variant="secondary" size="sm" onClick={() => setIsConvertModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="gold"
                size="sm"
                isLoading={convertMutation.isPending}
                onClick={() => convertMutation.mutate(selectedEnquiry.id)}
              >
                Confirm Conversion
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
