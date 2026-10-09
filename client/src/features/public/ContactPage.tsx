import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import { api } from '../../lib/api';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  phone: z.string().min(10, 'Please enter a valid phone number (at least 10 digits)'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  message: z.string().min(5, 'Please write your message or event requirements'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Submit as a lightweight enquiry
      await api.post('/enquiries/public', {
        name: data.name,
        phone: data.phone,
        email: data.email,
        eventType: 'General Enquiry / Consultation',
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        customRequirements: data.message,
        preferredContactMethod: 'Phone',
      });

      setIsSubmitted(true);
      success('Thank you! Your message has been received. We will contact you shortly.');
      reset();
    } catch (err: any) {
      error(err.message || 'Failed to send message. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rawNumber = settings?.whatsappNumber || '+919842187654';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    'Hello Sathuragiri Decoration! I would like to schedule a consultation.'
  )}`;

  return (
    <div className="pt-28 pb-20 space-y-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <Badge variant="gold">Get in Touch</Badge>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#24211F]">
          Contact Sathuragiri Decoration
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#77716B]">
          Have questions about dates, mandapam layouts, or custom catering? We'd love to assist you.
        </p>
      </div>

      {/* Main Grid: Contact Info on Left, Form on Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-[#E8E0D6] shadow-sm space-y-6">
              <h3 className="font-serif text-2xl font-bold text-[#24211F]">
                Reach Our Office
              </h3>

              <div className="space-y-5 text-sm text-[#56504A]">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EBDDBF] flex items-center justify-center text-[#B8955A] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#24211F]">Headquarters & Studio</h4>
                    <p className="text-xs text-[#77716B] mt-0.5 leading-relaxed">
                      {settings?.address || 'Plot No. 45, Temple View Avenue'},<br />
                      {settings?.city || 'Madurai'}, {settings?.state || 'Tamil Nadu'} - {settings?.pincode || '625009'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EBDDBF] flex items-center justify-center text-[#B8955A] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#24211F]">Direct Phone</h4>
                    <a
                      href={`tel:${settings?.phone || '+919842187654'}`}
                      className="text-xs text-[#B8955A] hover:underline font-semibold block mt-0.5"
                    >
                      {settings?.phone || '+91 98421 87654'}
                    </a>
                    {settings?.alternatePhone && (
                      <a
                        href={`tel:${settings.alternatePhone}`}
                        className="text-xs text-[#77716B] hover:underline block mt-0.5"
                      >
                        {settings.alternatePhone}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EBDDBF] flex items-center justify-center text-[#B8955A] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#24211F]">Email Enquiries</h4>
                    <a
                      href={`mailto:${settings?.email || 'contact@sathuragiridecoration.com'}`}
                      className="text-xs text-[#B8955A] hover:underline font-semibold block mt-0.5"
                    >
                      {settings?.email || 'contact@sathuragiridecoration.com'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EBDDBF] flex items-center justify-center text-[#B8955A] shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#24211F]">Consultation Hours</h4>
                    <p className="text-xs text-[#77716B] mt-0.5">
                      Monday – Sunday: 8:00 AM – 9:00 PM (IST)
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Button */}
              <div className="pt-4">
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="block">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full bg-[#EBF7F0] text-[#24845D] hover:bg-[#D9F2E2] border border-[#24845D]/30"
                    leftIcon={<MessageCircle className="w-4 h-4" />}
                  >
                    Chat Directly on WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Right Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#E8E0D6] shadow-sm space-y-6">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#24211F]">Send Us a Message</h3>
                <p className="text-xs text-[#77716B] mt-1">
                  Fill out the details below and our team will get back to you within 2 hours.
                </p>
              </div>

              {isSubmitted ? (
                <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-[#EBDDBF] space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-[#24845D] mx-auto" />
                  <h4 className="font-serif text-xl font-bold text-[#24211F]">Message Sent Successfully!</h4>
                  <p className="text-xs text-[#77716B] max-w-sm mx-auto">
                    We appreciate your interest in Sathuragiri Decoration. One of our event coordinators will call you shortly.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setIsSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Full Name"
                      placeholder="e.g. Karthik Rajan"
                      error={errors.name?.message}
                      {...register('name')}
                      required
                    />
                    <Input
                      label="Phone / WhatsApp Number"
                      placeholder="e.g. +91 98401 12233"
                      error={errors.phone?.message}
                      {...register('phone')}
                      required
                    />
                  </div>

                  <Input
                    label="Email Address (Optional)"
                    type="email"
                    placeholder="e.g. karthik@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  <Textarea
                    label="Tell Us About Your Event & Requirements"
                    placeholder="Provide details such as approximate event date, venue, guest count, or specific decor styles you like..."
                    rows={5}
                    error={errors.message?.message}
                    {...register('message')}
                    required
                  />

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full"
                    isLoading={isSubmitting}
                    rightIcon={<Send className="w-4 h-4" />}
                  >
                    Submit Enquiry
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps Embed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl overflow-hidden shadow-sm border border-[#E8E0D6] h-96 bg-gray-100">
          <iframe
            title="Sathuragiri Decoration Location Map"
            src={
              settings?.mapsEmbedUrl ||
              'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125747.88722421375!2d78.04169722883301!3d9.92520074218841!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00c582b1189633%3A0xdc955b7264f63933!2sMadurai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'
            }
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
};
