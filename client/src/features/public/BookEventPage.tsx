import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  User,
  Calendar,
  Layers,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Check,
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Service, Package } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { useToast } from '../../context/ToastContext';

const bookingFormSchema = z.object({
  // Step 1: Customer
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number (at least 10 digits)'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  preferredContactMethod: z.enum(['Phone', 'WhatsApp', 'Email']).default('Phone'),

  // Step 2: Event Details
  eventType: z.string().min(2, 'Please select or enter an event type'),
  eventTitle: z.string().optional(),
  eventDate: z.string().min(1, 'Please select the event date'),
  endDate: z.string().optional().nullable(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  venueCity: z.string().optional(),
  guestCount: z.string().optional(),
  isOutdoor: z.boolean().default(false),

  // Step 3: Custom requirements
  customRequirements: z.string().optional(),

  // Step 4: Budget & notes
  budgetRange: z.string().optional(),
  consultationTime: z.string().optional(),
  additionalNotes: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, 'You must agree to the privacy policy to submit'),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export const BookEventPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('service');
  const preselectedPackageSlug = searchParams.get('package');

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    reference: string;
    customerName: string;
    eventType: string;
  } | null>(null);

  const { success, error } = useToast();

  const { data: services = [] } = useQuery({
    queryKey: ['book-services-list'],
    queryFn: () => api.get<Service[]>('/services'),
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['book-packages-list'],
    queryFn: () => api.get<Package[]>('/packages'),
  });

  useEffect(() => {
    if (preselectedServiceId && !selectedServices.includes(preselectedServiceId)) {
      setSelectedServices([preselectedServiceId]);
    }
  }, [preselectedServiceId]);

  useEffect(() => {
    if (preselectedPackageSlug && packages.length > 0) {
      const match = packages.find((p) => p.slug === preselectedPackageSlug);
      if (match) {
        setSelectedPackage(match.id);
      }
    }
  }, [preselectedPackageSlug, packages]);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      preferredContactMethod: 'Phone',
      eventType: 'Traditional Wedding',
      isOutdoor: false,
      consent: true,
      budgetRange: '₹1,00,000 - ₹2,50,000',
    },
  });

  const formValues = watch();

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof BookingFormData)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['name', 'phone', 'email', 'preferredContactMethod'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['eventType', 'eventDate', 'venueName', 'venueCity'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', files[0]);

      const data = await api.post<{ url: string }>('/uploads/single', formData);
      if (data?.url) {
        setUploadedImages((prev) => [...prev, data.url]);
        success('Inspiration photo attached successfully');
      }
    } catch (err: any) {
      error('Failed to upload image. Please ensure it is a JPG or PNG under 5MB.');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        preferredContactMethod: data.preferredContactMethod,
        eventType: data.eventType,
        eventTitle: data.eventTitle || `${data.eventType} for ${data.name}`,
        eventDate: new Date(data.eventDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        venueCity: data.venueCity,
        guestCount: data.guestCount ? Number(data.guestCount) : undefined,
        isOutdoor: data.isOutdoor,
        selectedServiceIds: selectedServices,
        selectedPackageId: selectedPackage || undefined,
        customRequirements: data.customRequirements,
        inspirationImages: uploadedImages,
        budgetRange: data.budgetRange,
        consultationTime: data.consultationTime,
        additionalNotes: data.additionalNotes,
      };

      const result = await api.post<{
        id: string;
        reference: string;
        customerName: string;
        eventType: string;
      }>('/enquiries/public', payload);

      setSubmissionResult(result);

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B8955A', '#D4B77D', '#24845D', '#FAF7F2'],
      });

      success('Event enquiry successfully submitted!');
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err: any) {
      error(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: 'Customer Details' },
    { number: 2, label: 'Event Specifics' },
    { number: 3, label: 'Services & Package' },
    { number: 4, label: 'Review & Submit' },
  ];

  return (
    <div className="pt-28 pb-20 space-y-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="gold">Event Consultation & Booking</Badge>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#24211F]">
          Request Your Customized Event Plan
        </h1>
        <p className="max-w-xl mx-auto text-sm text-[#77716B]">
          Complete the 4 simple steps below to receive a personalized stage design proposal, itemized quotation, and date availability confirmation.
        </p>
      </div>

      {/* Submission Success Screen */}
      {submissionResult ? (
        <div className="bg-white p-8 sm:p-14 rounded-3xl border border-[#E8E0D6] shadow-luxury text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border-2 border-[#B8955A] flex items-center justify-center text-[#B8955A] mx-auto shadow-sm">
            <Sparkles className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#24845D] bg-[#EBF7F0] px-3 py-1 rounded-full border border-[#24845D]/20">
              Enquiry Received
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#24211F] pt-2">
              Thank You, {submissionResult.customerName}!
            </h2>
            <p className="text-sm text-[#77716B] max-w-md mx-auto">
              Your request for <strong className="text-[#24211F]">{submissionResult.eventType}</strong> has been logged in our system.
            </p>
          </div>

          {/* Reference Card */}
          <div className="p-6 bg-[#FAF7F2] rounded-2xl border border-[#EBDDBF] max-w-md mx-auto space-y-2">
            <span className="text-xs text-[#77716B] uppercase font-semibold">Your Enquiry Reference Number:</span>
            <div className="font-mono text-2xl font-bold text-[#B8955A] tracking-wider">
              {submissionResult.reference}
            </div>
            <p className="text-[11px] text-[#77716B]">
              Please save this reference number for future communication with our coordinators.
            </p>
          </div>

          <div className="text-xs text-[#56504A] max-w-lg mx-auto leading-relaxed border-t border-gray-100 pt-6">
            <p>
              🌟 <strong>What Happens Next?</strong> A dedicated Sathuragiri wedding stylist will review your venue details and contact you via your preferred method within 2 to 4 hours with layout concepts and sample quotations.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button variant="gold" size="md">
                Return to Home
              </Button>
            </Link>
            <Link to="/portfolio">
              <Button variant="secondary" size="md">
                Browse Real Weddings Portfolio
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Multi-Step Form Container */
        <div className="bg-white rounded-3xl border border-[#E8E0D6] shadow-sm overflow-hidden">
          {/* Progress Bar Header */}
          <div className="bg-[#FAF7F2] px-6 sm:px-10 py-6 border-b border-[#E8E0D6]">
            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
              {steps.map((s) => (
                <div key={s.number} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                      currentStep === s.number
                        ? 'bg-[#B8955A] text-white shadow-luxury scale-105'
                        : currentStep > s.number
                        ? 'bg-[#24845D] text-white'
                        : 'bg-white text-gray-400 border border-[#E8E0D6]'
                    }`}
                  >
                    {currentStep > s.number ? <Check className="w-4 h-4" /> : s.number}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold mt-2 truncate w-full ${
                      currentStep === s.number ? 'text-[#B8955A]' : 'text-gray-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Form Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-10 space-y-8">
            {/* STEP 1: CUSTOMER DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-serif text-xl font-bold text-[#24211F]">
                    Step 1: Your Contact Information
                  </h3>
                  <p className="text-xs text-[#77716B] mt-1">
                    Tell us who you are so we can send the customized design and quotation proposal.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    placeholder="e.g. Karthik Rajan"
                    error={errors.name?.message}
                    {...register('name')}
                    required
                  />
                  <Input
                    label="Phone / Mobile Number"
                    placeholder="e.g. +91 98401 12233"
                    error={errors.phone?.message}
                    {...register('phone')}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="Email Address (Optional)"
                    type="email"
                    placeholder="e.g. karthik.rajan@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <Select
                    label="Preferred Mode of Contact"
                    options={[
                      { label: 'Phone Call', value: 'Phone' },
                      { label: 'WhatsApp Message', value: 'WhatsApp' },
                      { label: 'Email', value: 'Email' },
                    ]}
                    {...register('preferredContactMethod')}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: EVENT DETAILS */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-serif text-xl font-bold text-[#24211F]">
                    Step 2: Event Specifics & Venue
                  </h3>
                  <p className="text-xs text-[#77716B] mt-1">
                    Provide the auspicious dates and venue location so we can evaluate stage dimensions and equipment logistics.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Select
                    label="Event Category / Type"
                    options={[
                      { label: 'Traditional Wedding & Muhurtham', value: 'Traditional Wedding' },
                      { label: 'Grand Reception Stage', value: 'Grand Reception' },
                      { label: 'Engagement / Betrothal Function', value: 'Engagement Ceremony' },
                      { label: 'Haldi, Mehndi & Sangeet', value: 'Haldi & Sangeet' },
                      { label: 'Pre-Wedding Photoshoot', value: 'Pre-Wedding Shoot' },
                      { label: 'Milestone Birthday Party', value: 'Birthday Celebration' },
                      { label: 'Corporate Gala / Exhibition Stall', value: 'Corporate Event' },
                      { label: 'Other Custom Celebration', value: 'Other' },
                    ]}
                    error={errors.eventType?.message}
                    {...register('eventType')}
                    required
                  />
                  <Input
                    label="Event Name / Title (Optional)"
                    placeholder="e.g. Karthik & Divya Marriage"
                    {...register('eventTitle')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="Event Start Date"
                    type="date"
                    error={errors.eventDate?.message}
                    {...register('eventDate')}
                    required
                  />
                  <Input
                    label="Event End Date (If multi-day)"
                    type="date"
                    {...register('endDate')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <Input
                    label="Venue / Mahal Name"
                    placeholder="e.g. Meenakshi Thirumana Mahal"
                    {...register('venueName')}
                  />
                  <Input
                    label="City / Town"
                    placeholder="e.g. Madurai, Chennai, Coimbatore"
                    {...register('venueCity')}
                  />
                  <Input
                    label="Expected Guest Count"
                    type="number"
                    placeholder="e.g. 800"
                    {...register('guestCount')}
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8E0D6]">
                  <input
                    type="checkbox"
                    id="isOutdoor"
                    className="w-4 h-4 text-[#B8955A] rounded border-gray-300 focus:ring-[#B8955A]"
                    {...register('isOutdoor')}
                  />
                  <label htmlFor="isOutdoor" className="text-xs font-semibold text-[#24211F] cursor-pointer">
                    This is an outdoor or open lawn event (requires waterproof marquee & heavy-duty lighting structures)
                  </label>
                </div>
              </div>
            )}

            {/* STEP 3: SERVICES & PACKAGES */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-serif text-xl font-bold text-[#24211F]">
                    Step 3: Select Desired Services & Inspiration
                  </h3>
                  <p className="text-xs text-[#77716B] mt-1">
                    Choose the specific elements you want us to handle for your celebration.
                  </p>
                </div>

                {/* Pre-designed Packages */}
                {packages.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#24211F]">
                      Optional: Select an All-Inclusive Package
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackage(selectedPackage === pkg.id ? null : pkg.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-left ${
                            selectedPackage === pkg.id
                              ? 'border-[#B8955A] bg-[#FAF7F2] shadow-luxury ring-2 ring-[#B8955A]/30'
                              : 'border-[#E8E0D6] bg-white hover:border-[#B8955A]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-serif text-sm font-bold text-[#24211F] truncate">{pkg.name}</h4>
                            {selectedPackage === pkg.id && (
                              <Check className="w-4 h-4 text-[#B8955A]" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#B8955A] font-bold mt-1">
                            {pkg.packagePrice ? `₹${Number(pkg.packagePrice).toLocaleString('en-IN')}` : 'Custom'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Individual Services Selection */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#24211F]">
                    Or Choose Individual Specializations:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {services.map((service) => {
                      const isSelected = selectedServices.includes(service.id);
                      return (
                        <div
                          key={service.id}
                          onClick={() => toggleService(service.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'border-[#B8955A] bg-[#FAF7F2] shadow-sm'
                              : 'border-[#E8E0D6] bg-white hover:border-[#B8955A]/40'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#B8955A] text-white' : 'border border-gray-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#24211F] truncate">{service.name}</p>
                            <p className="text-[10px] text-[#77716B] truncate">
                              {service.startingPrice ? `From ₹${Number(service.startingPrice).toLocaleString('en-IN')}` : service.pricingMethod}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Notes */}
                <Textarea
                  label="Custom Themes or Specific Ideas"
                  placeholder="Describe your color palette, preferred flowers (e.g. Madurai Malli, roses, orchids), stage dimensions, or specific themes..."
                  rows={3}
                  {...register('customRequirements')}
                />

                {/* Upload Inspiration Photo */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#24211F]">
                    Attach Decor Inspiration Images (Optional)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-[#B8955A] bg-[#FAF7F2] text-xs font-semibold text-[#B8955A] hover:bg-[#F3ECE2] cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>

                    {uploadedImages.map((img, i) => (
                      <div key={i} className="w-12 h-12 rounded-xl overflow-hidden border border-[#E8E0D6] shadow-xs relative">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: BUDGET, REVIEW & SUBMIT */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-serif text-xl font-bold text-[#24211F]">
                    Step 4: Budget Range & Review
                  </h3>
                  <p className="text-xs text-[#77716B] mt-1">
                    Review your enquiry summary before final submission.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Select
                    label="Estimated Budget Range"
                    options={[
                      { label: 'Under ₹1,00,000', value: 'Under ₹1,00,000' },
                      { label: '₹1,00,000 - ₹2,50,000', value: '₹1,00,000 - ₹2,50,000' },
                      { label: '₹2,50,000 - ₹5,00,000', value: '₹2,50,000 - ₹5,00,000' },
                      { label: '₹5,00,000 - ₹10,00,000', value: '₹5,00,000 - ₹10,00,000' },
                      { label: '₹10,00,000+ (Grand Royal Celebration)', value: '₹10,00,000+' },
                    ]}
                    {...register('budgetRange')}
                  />
                  <Select
                    label="Preferred Consultation Call Time"
                    options={[
                      { label: 'Morning (9:00 AM - 12:00 PM)', value: 'Morning' },
                      { label: 'Afternoon (1:00 PM - 5:00 PM)', value: 'Afternoon' },
                      { label: 'Evening (5:00 PM - 8:30 PM)', value: 'Evening' },
                      { label: 'Anytime / Immediate WhatsApp', value: 'Anytime' },
                    ]}
                    {...register('consultationTime')}
                  />
                </div>

                {/* Summary Card */}
                <div className="p-6 bg-[#FAF7F2] rounded-2xl border border-[#E8E0D6] space-y-4 text-xs text-[#56504A]">
                  <h4 className="font-serif text-sm font-bold text-[#24211F] uppercase tracking-wider">
                    Enquiry Summary
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="font-bold text-[#24211F]">Customer:</span> {formValues.name} ({formValues.phone})
                    </div>
                    <div>
                      <span className="font-bold text-[#24211F]">Event:</span> {formValues.eventType}
                    </div>
                    <div>
                      <span className="font-bold text-[#24211F]">Date:</span> {formValues.eventDate || 'Not selected'}
                    </div>
                    <div>
                      <span className="font-bold text-[#24211F]">Venue:</span> {formValues.venueName || 'To be decided'}, {formValues.venueCity || ''}
                    </div>
                    <div>
                      <span className="font-bold text-[#24211F]">Selected Services:</span> {selectedServices.length} specializations selected
                    </div>
                    <div>
                      <span className="font-bold text-[#24211F]">Budget Range:</span> {formValues.budgetRange}
                    </div>
                  </div>
                </div>

                {/* Consent */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="consent"
                      className="w-4 h-4 text-[#B8955A] rounded border-gray-300 focus:ring-[#B8955A] mt-0.5"
                      {...register('consent')}
                    />
                    <label htmlFor="consent" className="text-xs text-[#56504A] leading-relaxed cursor-pointer">
                      I authorize Sathuragiri Decoration to contact me via Phone / WhatsApp regarding this event enquiry and agree to the{' '}
                      <Link to="/privacy-policy" target="_blank" className="text-[#B8955A] underline">
                        Privacy Policy
                      </Link>
                      .
                    </label>
                  </div>
                  {errors.consent && (
                    <p className="text-xs text-[#C74646] font-semibold">{errors.consent.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handlePrevStep}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Previous Step
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <Button
                  type="button"
                  variant="gold"
                  size="md"
                  onClick={handleNextStep}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Step {currentStep + 1}
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  isLoading={isSubmitting}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Submit Event Enquiry
                </Button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
