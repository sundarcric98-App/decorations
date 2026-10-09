import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  CreditCard, 
  ChevronLeft, 
  Plus, 
  ExternalLink,
  Download,
  IndianRupee,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Customer, Booking, Quotation, Enquiry, Payment } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../../lib/utils';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'bookings' | 'quotes' | 'enquiries' | 'payments'>('bookings');

  const { data: customer, isLoading } = useQuery({
    queryKey: ['admin-customer-detail', id],
    queryFn: async () => {
      const res = await api.get<Customer & {
        bookings?: Booking[];
        quotations?: Quotation[];
        enquiries?: Enquiry[];
        payments?: Payment[];
      }>(`/customers/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" message="Loading customer dossier..." />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-brand-dark">Customer Not Found</h2>
        <Link to="/admin/customers" className="mt-4 inline-block">
          <Button variant="outline">Back to Customers</Button>
        </Link>
      </div>
    );
  }

  const bookings = customer.bookings || [];
  const quotations = customer.quotations || [];
  const enquiries = customer.enquiries || [];
  const payments = customer.payments || [];

  const totalBookingValue = bookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const balanceRemaining = Math.max(0, totalBookingValue - totalPaid);

  return (
    <div className="space-y-6">
      {/* Back link & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/customers"
          className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-dark transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Customer Directory
        </Link>

        <div className="flex items-center gap-3">
          <Link to={`/admin/quotations/new?customerId=${customer.id}`}>
            <Button size="sm" variant="outline" className="flex items-center gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5 text-brand-gold" />
              Create Quotation
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card className="p-6 border border-brand-border/60 shadow-sm bg-gradient-to-r from-white via-white to-brand-bg/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center font-serif font-bold text-2xl border-2 border-brand-gold/40 shadow-sm">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-serif font-bold text-brand-dark">
                {customer.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-brand-muted">
                <span className="flex items-center gap-1.5 font-medium text-brand-dark">
                  <Phone className="w-3.5 h-3.5 text-brand-gold" />
                  {customer.phone}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-gold" />
                    {customer.email}
                  </span>
                )}
                {customer.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                    {customer.address}
                  </span>
                )}
              </div>
              {customer.notes && (
                <p className="text-xs text-brand-muted/80 pt-1 italic">
                  Note: "{customer.notes}"
                </p>
              )}
            </div>
          </div>

          {/* Financial Summary Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-brand-bg/60 border border-brand-border/80 text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider block">
                Total Booked
              </span>
              <span className="text-base font-serif font-bold text-brand-dark">
                {formatCurrency(totalBookingValue)}
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                Total Received
              </span>
              <span className="text-base font-serif font-bold text-emerald-800">
                {formatCurrency(totalPaid)}
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block">
                Balance Due
              </span>
              <span className="text-base font-serif font-bold text-amber-800">
                {formatCurrency(balanceRemaining)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-brand-border/60">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'border-brand-gold text-brand-gold'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Bookings ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'quotes'
              ? 'border-brand-gold text-brand-gold'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <FileText className="w-4 h-4" />
          Quotations ({quotations.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'border-brand-gold text-brand-gold'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Payments ({payments.length})
        </button>

        <button
          onClick={() => setActiveTab('enquiries')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'enquiries'
              ? 'border-brand-gold text-brand-gold'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Enquiries ({enquiries.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <Card className="p-8 text-center text-brand-muted border border-brand-border/60">
                <Calendar className="w-10 h-10 text-brand-gold/40 mx-auto mb-2" />
                <p className="font-medium text-sm">No bookings recorded for this customer yet.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((b) => (
                  <Card
                    key={b.id}
                    className="p-5 border border-brand-border/60 hover:border-brand-gold/60 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-mono font-bold text-brand-gold">
                            {b.reference}
                          </span>
                          <h3 className="font-serif font-bold text-brand-dark text-lg">
                            {b.eventName}
                          </h3>
                        </div>
                        <StatusBadge status={b.status} type="booking" />
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-brand-muted">
                        <div className="flex items-center gap-2 text-brand-dark">
                          <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                          <span>{formatDate(b.startDate)}</span>
                        </div>
                        {b.venueName && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                            <span>{b.venueName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-brand-border/50 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-brand-muted block uppercase">Amount</span>
                        <span className="font-serif font-bold text-brand-dark text-sm">
                          {formatCurrency(b.finalAmount)}
                        </span>
                      </div>
                      <Link to={`/admin/bookings/${b.id}`}>
                        <Button size="sm" variant="outline" className="text-xs gap-1">
                          View Booking
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quotations Tab */}
        {activeTab === 'quotes' && (
          <div className="space-y-4">
            {quotations.length === 0 ? (
              <Card className="p-8 text-center text-brand-muted border border-brand-border/60">
                <FileText className="w-10 h-10 text-brand-gold/40 mx-auto mb-2" />
                <p className="font-medium text-sm">No quotations created for this customer.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {quotations.map((q) => (
                  <Card
                    key={q.id}
                    className="p-4 border border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-brand-gold text-sm">
                          {q.quotationNumber}
                        </span>
                        <span className="text-xs bg-brand-bg px-2 py-0.5 rounded text-brand-dark font-medium">
                          v{q.version}
                        </span>
                        <StatusBadge status={q.status} type="quotation" />
                      </div>
                      <p className="text-xs text-brand-muted mt-1">
                        Valid Until: {formatDate(q.validUntil)} • Created: {formatDate(q.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-brand-muted block">Grand Total</span>
                        <span className="font-serif font-bold text-brand-dark text-base">
                          {formatCurrency(q.grandTotal)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`${api.defaults.baseURL || '/api/v1'}/quotations/${q.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button size="sm" variant="outline" className="text-xs gap-1">
                            <Download className="w-3.5 h-3.5" />
                            PDF
                          </Button>
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            {payments.length === 0 ? (
              <Card className="p-8 text-center text-brand-muted border border-brand-border/60">
                <CreditCard className="w-10 h-10 text-brand-gold/40 mx-auto mb-2" />
                <p className="font-medium text-sm">No payment records found for this customer.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <Card
                    key={p.id}
                    className="p-4 border border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-brand-gold text-sm">
                          {p.receiptNumber}
                        </span>
                        <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          {p.paymentType.replace('_', ' ')}
                        </span>
                        <span className="text-xs bg-brand-bg text-brand-dark px-2 py-0.5 rounded font-medium">
                          {p.paymentMethod}
                        </span>
                      </div>
                      <p className="text-xs text-brand-muted mt-1">
                        Date: {formatDate(p.paymentDate)} {p.reference ? `• Ref: ${p.reference}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-brand-muted block">Amount Paid</span>
                        <span className="font-serif font-bold text-emerald-800 text-base">
                          {formatCurrency(p.amount)}
                        </span>
                      </div>

                      <a
                        href={`${api.defaults.baseURL || '/api/v1'}/payments/${p.id}/receipt`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button size="sm" variant="outline" className="text-xs gap-1">
                          <Download className="w-3.5 h-3.5" />
                          Receipt
                        </Button>
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Enquiries Tab */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            {enquiries.length === 0 ? (
              <Card className="p-8 text-center text-brand-muted border border-brand-border/60">
                <Sparkles className="w-10 h-10 text-brand-gold/40 mx-auto mb-2" />
                <p className="font-medium text-sm">No enquiries recorded for this customer.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {enquiries.map((e) => (
                  <Card
                    key={e.id}
                    className="p-4 border border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-brand-gold text-sm">
                          {e.reference}
                        </span>
                        <StatusBadge status={e.status} type="enquiry" />
                      </div>
                      <p className="text-sm font-semibold text-brand-dark mt-1">
                        {e.eventType} {e.eventTitle ? `— ${e.eventTitle}` : ''}
                      </p>
                      <p className="text-xs text-brand-muted">
                        Event Date: {formatDate(e.eventDate)} • Budget: {e.budgetRange || 'Flexible'}
                      </p>
                    </div>

                    <Link to="/admin/enquiries">
                      <Button size="sm" variant="outline" className="text-xs gap-1">
                        Manage Enquiries
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
