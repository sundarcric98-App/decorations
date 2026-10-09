import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  FileText,
  Plus,
  Trash2,
  Sparkles,
  ArrowLeft,
  Save,
  CheckCircle2,
  Calendar,
  Percent,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Customer, Booking, Service, QuotationItem } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Textarea } from '../../../components/common/Textarea';
import { Modal } from '../../../components/common/Modal';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../lib/utils';

export const QuotationBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialBookingId = searchParams.get('bookingId');
  const { success, error } = useToast();

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(initialBookingId || '');
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [taxRate, setTaxRate] = useState<number>(18);
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [terms, setTerms] = useState(
    '1. 30% advance on booking confirmation.\n2. 50% payable 2 days prior to event setup.\n3. 20% final settlement on event completion.'
  );
  const [exclusions, setExclusions] = useState(
    'Venue power backup / generator charges to be provided by client unless included.'
  );
  const [paymentSchedule, setPaymentSchedule] = useState(
    'Advance: 30% | Interim: 50% | Final: 20%'
  );
  const [status, setStatus] = useState<'DRAFT' | 'SENT' | 'ACCEPTED'>('DRAFT');

  // Line items state
  const [items, setItems] = useState<QuotationItem[]>([
    {
      name: 'Royal South Indian Muhurtham Mandapam',
      description: 'Hand-carved temple pillars with fresh Madurai Malli & rose hangings',
      quantity: 1,
      unit: 'Set',
      unitPrice: 75000,
      discount: 0,
      total: 75000,
    },
  ]);

  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  // Fetch Customers & Bookings & Services
  const { data: customers = [] } = useQuery({
    queryKey: ['builder-customers'],
    queryFn: async () => {
      const res = await api.get<any>('/customers?limit=100');
      return res.customers || [];
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['builder-bookings'],
    queryFn: async () => {
      const res = await api.get<any>('/bookings?limit=100');
      return res.bookings || [];
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ['builder-services'],
    queryFn: () => api.get<Service[]>('/services'),
  });

  // Calculate Subtotal and Totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const effectiveDiscount = Math.min(subtotal, Number(overallDiscount) || 0);
  const taxableAmount = Math.max(0, subtotal - effectiveDiscount);
  const taxAmount = (taxableAmount * (Number(taxRate) || 0)) / 100;
  const grandTotal = Math.round(taxableAmount + taxAmount);

  const handleUpdateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };

    const qty = Number(current.quantity) || 1;
    const price = Number(current.unitPrice) || 0;
    const disc = Number(current.discount) || 0;
    current.total = Math.max(0, qty * price - disc);

    updated[index] = current;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        name: '',
        description: '',
        quantity: 1,
        unit: 'Set',
        unitPrice: 0,
        discount: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddFromCatalog = (service: Service) => {
    setItems([
      ...items,
      {
        serviceId: service.id,
        name: service.name,
        description: service.shortDesc,
        quantity: 1,
        unit: service.pricingMethod === 'Per person' ? 'Plate' : 'Set',
        unitPrice: service.startingPrice || 25000,
        discount: 0,
        total: service.startingPrice || 25000,
      },
    ]);
    setIsCatalogModalOpen(false);
    success(`Added ${service.name} to quotation`);
  };

  // Create Quotation Mutation
  const createQuotationMutation = useMutation({
    mutationFn: (payload: any) => api.post('/quotations', payload),
    onSuccess: (res: any) => {
      success(`Quotation created: ${res.quotationNumber}`);
      navigate('/admin/quotations');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to create quotation');
    },
  });

  const handleSaveQuotation = () => {
    if (!selectedCustomerId) {
      error('Please select a customer for this quotation.');
      return;
    }

    createQuotationMutation.mutate({
      customerId: selectedCustomerId,
      bookingId: selectedBookingId || undefined,
      validUntil,
      taxRate: Number(taxRate),
      overallDiscount: Number(overallDiscount),
      terms,
      exclusions,
      paymentSchedule,
      status,
      items: items.map((item) => ({
        serviceId: item.serviceId,
        name: item.name,
        description: item.description,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount),
      })),
    });
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/admin/quotations')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77716B] hover:text-[#B8955A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Quotations
          </button>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#24211F]">
            Quotation Builder
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Select
            options={[
              { label: 'Save as Draft', value: 'DRAFT' },
              { label: 'Save as Sent', value: 'SENT' },
              { label: 'Save & Accept', value: 'ACCEPTED' },
            ]}
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="text-xs"
          />
          <Button
            variant="gold"
            size="md"
            isLoading={createQuotationMutation.isPending}
            onClick={handleSaveQuotation}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Quotation
          </Button>
        </div>
      </div>

      {/* Main Form Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 cols: Line Items Table & Catalog */}
        <div className="lg:col-span-8 space-y-6">
          {/* Client & Booking Links */}
          <Card className="p-6 bg-white space-y-4">
            <h3 className="font-serif text-base font-bold text-[#24211F] border-b border-gray-100 pb-3">
              Client & Event Assignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Target Client"
                options={[
                  { label: 'Select Customer...', value: '' },
                  ...customers.map((c: any) => ({ label: `${c.name} (${c.phone})`, value: c.id })),
                ]}
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
              />

              <Select
                label="Linked Booking (Optional)"
                options={[
                  { label: 'None / Standalone', value: '' },
                  ...bookings.map((b: any) => ({ label: `${b.reference} — ${b.eventName}`, value: b.id })),
                ]}
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
              />

              <Input
                label="Valid Until Date"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
              />
            </div>
          </Card>

          {/* Line Items Table */}
          <Card className="p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-base font-bold text-[#24211F]">
                Itemized Services & Materials
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCatalogModalOpen(true)}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#B8955A]" />}
                >
                  Insert from Catalog
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={handleAddItem}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Custom Item
                </Button>
              </div>
            </div>

            {/* Items Rows */}
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D6] space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#B8955A]">Line Item #{idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="text-gray-400 hover:text-[#C74646] p-1"
                        title="Remove Line"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      placeholder="Item name (e.g. Royal Lotus Mandapam Decor)"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Specification / description..."
                      value={item.description || ''}
                      onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Input
                      label="Quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                    />
                    <Select
                      label="Unit"
                      options={[
                        { label: 'Set', value: 'Set' },
                        { label: 'Package', value: 'Package' },
                        { label: 'Sq. Ft', value: 'Sq.Ft' },
                        { label: 'Plate / Leaf', value: 'Plate' },
                        { label: 'Day', value: 'Day' },
                        { label: 'Hour', value: 'Hour' },
                      ]}
                      value={item.unit}
                      onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                    />
                    <Input
                      label="Unit Price (₹)"
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(idx, 'unitPrice', Number(e.target.value))}
                    />
                    <Input
                      label="Discount (₹)"
                      type="number"
                      value={item.discount}
                      onChange={(e) => handleUpdateItem(idx, 'discount', Number(e.target.value))}
                    />
                  </div>

                  <div className="text-right text-xs font-bold text-[#24211F] pt-1">
                    Line Total: <span className="text-[#B8955A] font-mono text-sm">{formatCurrency(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Terms & Exclusions */}
          <Card className="p-6 bg-white space-y-4">
            <h3 className="font-serif text-base font-bold text-[#24211F] border-b border-gray-100 pb-3">
              Payment Milestones & Exclusions
            </h3>
            <div className="space-y-4">
              <Textarea
                label="Terms & Conditions"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={3}
              />
              <Textarea
                label="Exclusions"
                value={exclusions}
                onChange={(e) => setExclusions(e.target.value)}
                rows={2}
              />
            </div>
          </Card>
        </div>

        {/* Right 4 cols: Summary & Calculations Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-white space-y-6 sticky top-24 border-2 border-[#EBDDBF]">
            <h3 className="font-serif text-lg font-bold text-[#24211F] border-b border-gray-100 pb-3">
              Quotation Summary
            </h3>

            <div className="space-y-3.5 text-xs text-[#56504A]">
              <div className="flex items-center justify-between">
                <span>Subtotal ({items.length} items):</span>
                <span className="font-bold text-[#24211F] font-mono">{formatCurrency(subtotal)}</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>Overall Discount:</span>
                  <span className="font-bold text-[#C74646] font-mono">- {formatCurrency(effectiveDiscount)}</span>
                </div>
                <Input
                  type="number"
                  placeholder="Discount (INR)"
                  value={overallDiscount}
                  onChange={(e) => setOverallDiscount(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between">
                  <span>GST / Tax Rate ({taxRate}%):</span>
                  <span className="font-bold text-[#24211F] font-mono">{formatCurrency(taxAmount)}</span>
                </div>
                <Select
                  options={[
                    { label: '18% GST (Standard Wedding Decor)', value: '18' },
                    { label: '12% GST (Catering & Feasts)', value: '12' },
                    { label: '5% GST (Transport & Supplies)', value: '5' },
                    { label: '0% (Exempt / Demo)', value: '0' },
                  ]}
                  value={String(taxRate)}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
              </div>

              <div className="pt-4 border-t-2 border-[#EBDDBF] flex items-baseline justify-between">
                <span className="font-serif text-base font-bold text-[#24211F]">Grand Total:</span>
                <span className="font-serif text-2xl font-bold text-[#B8955A]">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <Button
              variant="gold"
              size="lg"
              className="w-full"
              isLoading={createQuotationMutation.isPending}
              onClick={handleSaveQuotation}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Generate Official Quotation
            </Button>
          </Card>
        </div>
      </div>

      {/* CATALOG PICKER MODAL */}
      <Modal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        title="Insert Service from Catalogue"
        subtitle="Click any service below to add it as a line item"
        maxWidth="2xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {services.map((svc) => (
            <div
              key={svc.id}
              onClick={() => handleAddFromCatalog(svc)}
              className="p-3.5 rounded-xl border border-[#E8E0D6] hover:border-[#B8955A] hover:bg-[#FAF7F2] cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="min-w-0 pr-2">
                <p className="font-serif text-xs font-bold text-[#24211F] truncate">{svc.name}</p>
                <p className="text-[10px] text-[#77716B] truncate">{svc.shortDesc}</p>
              </div>
              <span className="text-xs font-bold text-[#B8955A] shrink-0">
                {svc.startingPrice ? `₹${Number(svc.startingPrice).toLocaleString('en-IN')}` : 'Custom'}
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
