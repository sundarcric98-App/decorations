import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Plus,
  Download,
  Eye,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Printer,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Quotation } from '../../../types';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Select } from '../../../components/common/Select';
import { Pagination } from '../../../components/common/Pagination';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDate } from '../../../lib/utils';

export const QuotationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-quotations', page, statusFilter, searchTerm],
    queryFn: () => {
      const statusParam = statusFilter !== 'ALL' ? `status=${statusFilter}&` : '';
      const searchParam = searchTerm ? `search=${encodeURIComponent(searchTerm)}&` : '';
      return api.get<any>(`/quotations?page=${page}&limit=15&${statusParam}${searchParam}`);
    },
  });

  const quotations: Quotation[] = data?.quotations || [];
  const meta = data?.meta;

  const deleteQuotationMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/quotations/${id}`),
    onSuccess: () => {
      success('Quotation deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-quotations'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete quotation');
    },
  });

  const handleDownloadPdf = (id: string, quoteNumber: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api/v1' : '/api/v1');
    window.open(`${apiUrl}/quotations/${id}/pdf`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#24211F]">
            Quotation Builder & Proposals
          </h1>
          <p className="text-xs text-[#77716B] mt-0.5">
            Create professional, itemized price proposals with automated tax calculation & PDF generation.
          </p>
        </div>
        <Link to="/admin/quotations/builder">
          <Button variant="gold" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Create New Quotation
          </Button>
        </Link>
      </div>

      {/* Filter Card */}
      <Card className="p-4 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by quote #, client name, or phone..."
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
              { label: 'All Quotation Statuses', value: 'ALL' },
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Sent', value: 'SENT' },
              { label: 'Accepted', value: 'ACCEPTED' },
              { label: 'Rejected', value: 'REJECTED' },
              { label: 'Expired', value: 'EXPIRED' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-white overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Loading quotations..." />
        ) : quotations.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No quotations created yet. Click "Create New Quotation" to build an itemized proposal.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#77716B] font-bold uppercase tracking-wider border-b border-[#E8E0D6]">
                <tr>
                  <th className="py-3.5 px-4">Quote #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Event Ref</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Valid Until</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotations.map((quote) => (
                  <tr key={quote.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#B8955A]">
                      {quote.quotationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#24211F]">{quote.customer?.name}</p>
                      <p className="text-[11px] text-[#77716B]">{quote.customer?.phone}</p>
                    </td>
                    <td className="py-3.5 px-4 text-[#77716B]">
                      {quote.booking?.eventName || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-[#77716B]">
                      {(quote as any)._count?.items || quote.items?.length || 0} line items
                    </td>
                    <td className="py-3.5 px-4 text-[#77716B]">{formatDate(quote.validUntil, 'short')}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={quote.status} type="quotation" />
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#B8955A]">
                      {formatCurrency(quote.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleDownloadPdf(quote.id, quote.quotationNumber)}
                        className="p-1.5 rounded-lg border border-[#E8E0D6] bg-white text-[#56504A] hover:text-[#B8955A] hover:bg-[#FAF7F2] transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this quotation?')) {
                            deleteQuotationMutation.mutate(quote.id);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-[#E8E0D6] bg-white text-gray-400 hover:text-[#C74646] hover:bg-[#FDF2F2] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
};
