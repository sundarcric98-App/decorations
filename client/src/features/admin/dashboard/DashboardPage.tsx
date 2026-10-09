import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquare,
  CalendarCheck,
  Calendar,
  CreditCard,
  TrendingDown,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  IndianRupee,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '../../../lib/api';
import { KpiCard } from '../../../components/admin/KpiCard';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../../lib/utils';

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#24845D',
  IN_PROGRESS: '#B8955A',
  COMPLETED: '#2563EB',
  TENTATIVE: '#D97706',
  DRAFT: '#AFAEA9',
  CANCELLED: '#C74646',
};

export const DashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => api.get<any>('/dashboard/stats'),
    refetchInterval: 30000,
  });

  if (isLoading || !stats) {
    return <LoadingSpinner message="Calculating real-time business metrics..." fullHeight />;
  }

  const {
    kpis,
    monthlyTrends,
    bookingStatuses,
    enquiryStatuses,
    recentEnquiries,
    upcomingBookingsList,
    recentPayments,
  } = stats;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#24211F]">
            Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#77716B] mt-0.5">
            Real-time business performance, upcoming events & pipeline metrics.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <Link to="/book-event">
            <Button variant="secondary" size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5 text-[#B8955A]" />}>
              New Enquiry
            </Button>
          </Link>
          <Link to="/admin/bookings">
            <Button variant="gold" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Manage Bookings
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Revenue Received"
          value={formatCurrency(kpis.totalRevenueReceived)}
          subtitle={`From ${kpis.confirmedBookings} active events`}
          icon={<IndianRupee className="w-6 h-6" />}
          highlight={true}
        />
        <KpiCard
          title="Outstanding Balance"
          value={formatCurrency(kpis.outstandingBalance)}
          subtitle="Pending client settlements"
          icon={<Clock className="w-6 h-6 text-[#D97706]" />}
        />
        <KpiCard
          title="Upcoming Events"
          value={kpis.upcomingEvents}
          subtitle="Scheduled across Tamil Nadu"
          icon={<Calendar className="w-6 h-6" />}
        />
        <KpiCard
          title="Active Enquiries"
          value={kpis.totalEnquiries}
          subtitle={`${kpis.newEnquiries} awaiting first follow-up`}
          icon={<MessageSquare className="w-6 h-6" />}
        />
      </div>

      {/* Secondary Financial Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-4 bg-white flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#77716B]">Total Booking Value</p>
            <p className="font-serif text-xl font-bold text-[#24211F]">{formatCurrency(kpis.totalBookingValue)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#B8955A]">
            <Sparkles className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 bg-white flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#77716B]">Recorded Expenses</p>
            <p className="font-serif text-xl font-bold text-[#C74646]">{formatCurrency(kpis.totalExpenses)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDF2F2] flex items-center justify-center text-[#C74646]">
            <TrendingDown className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 bg-white flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#77716B]">Estimated Net Profit</p>
            <p className="font-serif text-xl font-bold text-[#24845D]">{formatCurrency(kpis.estimatedProfit)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EBF7F0] flex items-center justify-center text-[#24845D]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue & Expenses Trend Chart */}
        <Card className="lg:col-span-8 p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#24211F]">
                Monthly Revenue & Expense Trends
              </h3>
              <p className="text-xs text-[#77716B]">Financial cash flow across recent months</p>
            </div>
            <Badge variant="gold">6-Month Trend</Badge>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B8955A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#B8955A" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C74646" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C74646" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E0D6" />
                <XAxis dataKey="month" stroke="#77716B" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#77716B"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, '']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E8E0D6',
                    fontSize: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#B8955A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#C74646"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Booking Status Breakdown Chart */}
        <Card className="lg:col-span-4 p-6 bg-white space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#24211F]">
              Bookings Breakdown
            </h3>
            <p className="text-xs text-[#77716B]">Status distribution of confirmed & pending events</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingStatuses}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {bookingStatuses.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || '#B8955A'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number, name: string) => [val, name]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E8E0D6',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100">
            {bookingStatuses.map((b: any) => (
              <div key={b.status} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[b.status] || '#B8955A' }}
                />
                <span className="text-[#56504A] capitalize">{b.status.toLowerCase()}:</span>
                <span className="font-bold text-[#24211F]">{b.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 3. RECENT ACTIVITY TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Enquiries */}
        <Card className="p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-[#24211F]">
              Recent Event Enquiries
            </h3>
            <Link to="/admin/enquiries" className="text-xs text-[#B8955A] font-semibold hover:underline">
              View All Enquiries →
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {recentEnquiries.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">No recent enquiries logged.</p>
            ) : (
              recentEnquiries.map((enq: any) => (
                <div key={enq.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-[#24211F] truncate">
                      {enq.customer.name} — <span className="font-medium text-[#77716B]">{enq.eventType}</span>
                    </p>
                    <p className="text-[11px] text-[#77716B]">
                      {enq.reference} • {formatDate(enq.eventDate, 'short')}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <StatusBadge status={enq.status} type="enquiry" />
                    <Link
                      to={`/admin/enquiries?id=${enq.id}`}
                      className="p-1 rounded-lg text-gray-400 hover:text-[#B8955A]"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Events List */}
        <Card className="p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-[#24211F]">
              Upcoming Event Execution
            </h3>
            <Link to="/admin/calendar" className="text-xs text-[#B8955A] font-semibold hover:underline">
              Open Calendar →
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {upcomingBookingsList.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">No upcoming events scheduled.</p>
            ) : (
              upcomingBookingsList.map((bkg: any) => (
                <div key={bkg.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-[#24211F] truncate">
                      {bkg.eventName}
                    </p>
                    <p className="text-[11px] text-[#77716B]">
                      📍 {bkg.venueName || 'Venue TBD'}, {bkg.venueCity || ''} • {formatDate(bkg.startDate, 'short')}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <StatusBadge status={bkg.status} type="booking" />
                    <Link
                      to={`/admin/bookings?id=${bkg.id}`}
                      className="p-1 rounded-lg text-gray-400 hover:text-[#B8955A]"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* 4. RECENT PAYMENTS STREAM */}
      <Card className="p-6 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-[#24211F]">
            Recent Payments & Receipts
          </h3>
          <Link to="/admin/payments" className="text-xs text-[#B8955A] font-semibold hover:underline">
            View All Payments →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#77716B] font-bold uppercase tracking-wider border-b border-[#E8E0D6]">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Event Ref</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No payment records logged yet.
                  </td>
                </tr>
              ) : (
                recentPayments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#B8955A]">{p.receiptNumber}</td>
                    <td className="py-3 px-4 font-medium text-[#24211F]">{p.customer.name}</td>
                    <td className="py-3 px-4 text-[#77716B]">{p.booking.eventName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold text-[10px]">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#77716B]">{formatDate(p.paymentDate, 'short')}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#24845D]">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
