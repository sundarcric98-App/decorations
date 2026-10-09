import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  DollarSign, 
  Calendar, 
  Users, 
  CheckCircle2, 
  FileSpreadsheet, 
  PieChart as PieIcon,
  IndianRupee,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { api } from '../../../lib/api';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { formatCurrency } from '../../../lib/utils';
import { useToast } from '../../../context/ToastContext';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [timeRange, setTimeRange] = useState('year');

  // Fetch summary reports
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['admin-reports-summary', timeRange],
    queryFn: async () => {
      const res = await api.get<{
        totalEnquiries: number;
        convertedEnquiries: number;
        conversionRate: number;
        totalBookings: number;
        totalBookingValue: number;
        totalRevenueReceived: number;
        totalOutstanding: number;
        totalExpenses: number;
        estimatedProfit: number;
        monthlyTrend: Array<{ month: string; revenue: number; expenses: number; bookings: number }>;
        statusBreakdown: Array<{ name: string; value: number; color: string }>;
        categoryBreakdown: Array<{ name: string; count: number; value: number }>;
      }>(`/reports/summary?range=${timeRange}`);
      return res.data;
    },
  });

  const handleExportCsv = (type: 'bookings' | 'payments' | 'expenses') => {
    try {
      const baseUrl = api.defaults.baseURL || '/api/v1';
      window.open(`${baseUrl}/reports/export-csv?type=${type}`, '_blank');
      showToast(`Exporting ${type} CSV report...`, 'info');
    } catch (e) {
      showToast('Failed to trigger CSV export', 'error');
    }
  };

  const COLORS = ['#B8955A', '#24845D', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-dark flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-brand-gold" />
            Executive Reports & Business Analytics
          </h1>
          <p className="text-sm text-brand-muted">
            Financial trends, wedding conversion funnels, event profitability, and audit-ready data exports.
          </p>
        </div>

        {/* CSV Export Dropdown / Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExportCsv('bookings')}
            className="text-xs gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-brand-gold" />
            Export Bookings CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExportCsv('payments')}
            className="text-xs gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export Payments CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExportCsv('expenses')}
            className="text-xs gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-red-600" />
            Export Expenses CSV
          </Button>
        </div>
      </div>

      {isSummaryLoading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="lg" message="Aggregating performance analytics..." />
        </div>
      ) : (
        <>
          {/* Executive KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border border-brand-border/60 bg-white shadow-sm">
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                Total Revenue Received
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-serif font-bold text-emerald-800">
                  {formatCurrency(summaryData?.totalRevenueReceived || 0)}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Realized Cash
                </span>
              </div>
              <p className="text-[11px] text-brand-muted mt-2">
                Booking Value: {formatCurrency(summaryData?.totalBookingValue || 0)}
              </p>
            </Card>

            <Card className="p-5 border border-brand-border/60 bg-white shadow-sm">
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                Total Expenses
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-serif font-bold text-red-800">
                  {formatCurrency(summaryData?.totalExpenses || 0)}
                </span>
                <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                  Material + Labor
                </span>
              </div>
              <p className="text-[11px] text-brand-muted mt-2">
                Across all decoration & catering jobs
              </p>
            </Card>

            <Card className="p-5 border border-brand-border/60 bg-white shadow-sm">
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                Estimated Net Margin
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-serif font-bold text-brand-gold">
                  {formatCurrency(summaryData?.estimatedProfit || 0)}
                </span>
                <span className="text-xs font-semibold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full">
                  Operating Profit
                </span>
              </div>
              <p className="text-[11px] text-brand-muted mt-2">
                Calculated as Realized Revenue – Operational Expenses
              </p>
            </Card>

            <Card className="p-5 border border-brand-border/60 bg-white shadow-sm">
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                Enquiry Conversion Rate
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-serif font-bold text-brand-dark">
                  {summaryData?.conversionRate || 0}%
                </span>
                <span className="text-xs font-semibold text-brand-dark bg-brand-bg px-2 py-0.5 rounded-full">
                  {summaryData?.convertedEnquiries || 0} of {summaryData?.totalEnquiries || 0}
                </span>
              </div>
              <p className="text-[11px] text-brand-muted mt-2">
                Lead to confirmed booking conversion
              </p>
            </Card>
          </div>

          {/* Charts Row 1: Monthly Financial Trend & Booking Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Monthly Trend (8 cols) */}
            <div className="lg:col-span-8">
              <Card className="p-5 border border-brand-border/60 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif font-bold text-brand-dark text-lg">
                      Monthly Cashflow & Cost Trajectory
                    </h3>
                    <p className="text-xs text-brand-muted">
                      Comparison of collections vs operational material costs by month.
                    </p>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={summaryData?.monthlyTrend || []}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE4" />
                      <XAxis dataKey="month" stroke="#77716B" fontSize={11} />
                      <YAxis stroke="#77716B" fontSize={11} />
                      <Tooltip
                        formatter={(val: any) => formatCurrency(Number(val))}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '8px',
                          border: '1px solid #E8E0D6',
                          fontSize: '12px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue Collected" fill="#24845D" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses Incurred" fill="#B8955A" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Status Breakdown (4 cols) */}
            <div className="lg:col-span-4">
              <Card className="p-5 border border-brand-border/60 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-brand-dark text-lg">
                    Event Portfolio Distribution
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Breakdown of bookings by lifecycle stage.
                  </p>
                </div>

                <div className="h-56 w-full my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summaryData?.statusBreakdown || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {(summaryData?.statusBreakdown || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '8px',
                          border: '1px solid #E8E0D6',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(summaryData?.statusBreakdown || []).map((st, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: st.color || COLORS[idx % COLORS.length] }}
                      ></span>
                      <span className="text-brand-dark truncate">{st.name}:</span>
                      <span className="font-bold text-brand-dark ml-auto">{st.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Top performing service categories */}
          <Card className="p-5 border border-brand-border/60 shadow-sm">
            <h3 className="font-serif font-bold text-brand-dark text-lg mb-1">
              Top Service Inclusions & Customer Demand
            </h3>
            <p className="text-xs text-brand-muted mb-4">
              Highest utilized decor themes and services across completed and active contracts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(summaryData?.categoryBreakdown || []).map((cat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-brand-border/80 bg-brand-bg/40 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold text-brand-dark">{cat.name}</span>
                    <span className="text-xs font-bold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-brand-border/50 flex items-baseline justify-between">
                    <span className="text-[11px] text-brand-muted">Bookings</span>
                    <span className="text-sm font-bold text-brand-dark">{cat.count} events</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
