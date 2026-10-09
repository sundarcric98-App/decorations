import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings as SettingsIcon, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Percent, 
  FileText, 
  Share2, 
  Save, 
  Palette,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { api } from '../../../lib/api';
import { BusinessSettings } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Textarea } from '../../../components/common/Textarea';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { useToast } from '../../../context/ToastContext';
import { useSettings } from '../../../context/SettingsContext';

export const AdminSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { settings: contextSettings, refreshSettings } = useSettings();
  const [activeSection, setActiveSection] = useState<'general' | 'contact' | 'financial' | 'social'>('general');

  const [formData, setFormData] = useState<Partial<BusinessSettings>>({
    businessName: 'Sathuragiri Decoration',
    tagline: 'Every Celebration, Beautifully Crafted.',
    phone: '+91 98421 23456',
    alternatePhone: '+91 94432 67890',
    whatsappNumber: '+91 98421 23456',
    email: 'contact@sathuragiridecoration.com',
    address: '142 Temple Road, Bypass Junction',
    city: 'Madurai',
    state: 'Tamil Nadu',
    pincode: '625001',
    mapsEmbedUrl: '',
    primaryGold: '#B8955A',
    gstNumber: '33AAAAA0000A1Z5',
    advancePercentageDefault: 30,
    currencySymbol: '₹',
    termsDefault: '1. Advance payment is non-refundable upon confirmation.\n2. Balance settlement is required before event day execution.\n3. Flower availability subject to seasonal market harvest.',
    socialInstagram: 'https://instagram.com/sathuragiri_decoration',
    socialFacebook: 'https://facebook.com/sathuragiridecoration',
    socialYoutube: 'https://youtube.com/@sathuragiridecoration',
  });

  const { data: serverSettings, isLoading } = useQuery({
    queryKey: ['admin-business-settings'],
    queryFn: async () => {
      const res = await api.get<BusinessSettings>('/settings');
      return res.data;
    },
  });

  useEffect(() => {
    if (serverSettings) {
      setFormData(serverSettings);
    }
  }, [serverSettings]);

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<BusinessSettings>) => {
      return api.put('/settings', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-business-settings'] });
      refreshSettings();
      showToast('Business settings updated successfully', 'success');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update settings', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" message="Loading business configuration..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-dark flex items-center gap-2">
            <SettingsIcon className="w-7 h-7 text-brand-gold" />
            Business & Branding Settings
          </h1>
          <p className="text-sm text-brand-muted">
            Configure Sathuragiri Decoration company profile, contact channels, default quotation terms, and GST details.
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          isLoading={updateMutation.isPending}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Tabs (3 cols) */}
        <div className="lg:col-span-3 space-y-1">
          <Card className="p-2 border border-brand-border/60">
            <button
              type="button"
              onClick={() => setActiveSection('general')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeSection === 'general'
                  ? 'bg-brand-gold text-white shadow-xs'
                  : 'text-brand-dark hover:bg-brand-bg'
              }`}
            >
              <Building className="w-4 h-4" />
              Company & Identity
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('contact')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeSection === 'contact'
                  ? 'bg-brand-gold text-white shadow-xs'
                  : 'text-brand-dark hover:bg-brand-bg'
              }`}
            >
              <Phone className="w-4 h-4" />
              Contact & Address
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('financial')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeSection === 'financial'
                  ? 'bg-brand-gold text-white shadow-xs'
                  : 'text-brand-dark hover:bg-brand-bg'
              }`}
            >
              <FileText className="w-4 h-4" />
              Quotations & GST
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('social')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeSection === 'social'
                  ? 'bg-brand-gold text-white shadow-xs'
                  : 'text-brand-dark hover:bg-brand-bg'
              }`}
            >
              <Share2 className="w-4 h-4" />
              Social Media Links
            </button>
          </Card>
        </div>

        {/* Content Form (9 cols) */}
        <div className="lg:col-span-9">
          <form onSubmit={handleSubmit}>
            {/* General Section */}
            {activeSection === 'general' && (
              <Card className="p-6 border border-brand-border/60 space-y-5">
                <div>
                  <h3 className="text-lg font-serif font-bold text-brand-dark">
                    Company Identity & Aesthetics
                  </h3>
                  <p className="text-xs text-brand-muted">
                    This brand information is presented on all public landing pages, quotation PDFs, and receipts.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Official Business Name *"
                    required
                    value={formData.businessName || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    placeholder="Sathuragiri Decoration"
                  />

                  <Input
                    label="Brand Tagline *"
                    required
                    value={formData.tagline || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, tagline: e.target.value })
                    }
                    placeholder="Every Celebration, Beautifully Crafted."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Primary Accent Gold (HEX)"
                    value={formData.primaryGold || '#B8955A'}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryGold: e.target.value })
                    }
                    placeholder="#B8955A"
                  />
                  <Input
                    label="Logo Image URL (Optional)"
                    value={formData.logoUrl || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, logoUrl: e.target.value })
                    }
                    placeholder="https://.../logo.png"
                  />
                </div>
              </Card>
            )}

            {/* Contact Section */}
            {activeSection === 'contact' && (
              <Card className="p-6 border border-brand-border/60 space-y-5">
                <div>
                  <h3 className="text-lg font-serif font-bold text-brand-dark">
                    Contact Channels & Office Location
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Phone and WhatsApp numbers used for customer instant messaging and inquiry alerts.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Primary Phone *"
                    required
                    value={formData.phone || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+91 98421 23456"
                  />

                  <Input
                    label="Alternate Phone"
                    value={formData.alternatePhone || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, alternatePhone: e.target.value })
                    }
                    placeholder="+91 94432 67890"
                  />

                  <Input
                    label="WhatsApp Number *"
                    required
                    value={formData.whatsappNumber || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsappNumber: e.target.value })
                    }
                    placeholder="+91 98421 23456"
                  />
                </div>

                <Input
                  label="Official Email Address *"
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contact@sathuragiridecoration.com"
                />

                <Input
                  label="Street Address / Office *"
                  required
                  value={formData.address || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="142 Temple Road, Bypass Junction"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="City *"
                    required
                    value={formData.city || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="Madurai"
                  />

                  <Input
                    label="State *"
                    required
                    value={formData.state || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder="Tamil Nadu"
                  />

                  <Input
                    label="Postal Pincode *"
                    required
                    value={formData.pincode || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                    placeholder="625001"
                  />
                </div>

                <Input
                  label="Google Maps Embed URL (iframe src)"
                  value={formData.mapsEmbedUrl || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, mapsEmbedUrl: e.target.value })
                  }
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
              </Card>
            )}

            {/* Financial & Quotation Terms */}
            {activeSection === 'financial' && (
              <Card className="p-6 border border-brand-border/60 space-y-5">
                <div>
                  <h3 className="text-lg font-serif font-bold text-brand-dark">
                    Commercial Terms, GST & Advance Milestones
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Set default policy for quotations, booking advances, and invoicing.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="GST Identification Number (GSTIN)"
                    value={formData.gstNumber || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, gstNumber: e.target.value })
                    }
                    placeholder="33AAAAA0000A1Z5"
                  />

                  <Input
                    label="Default Advance Required (%)"
                    type="number"
                    min="10"
                    max="100"
                    value={String(formData.advancePercentageDefault || 30)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        advancePercentageDefault: parseInt(e.target.value) || 30,
                      })
                    }
                    placeholder="30"
                  />

                  <Input
                    label="Currency Symbol"
                    value={formData.currencySymbol || '₹'}
                    onChange={(e) =>
                      setFormData({ ...formData, currencySymbol: e.target.value })
                    }
                    placeholder="₹"
                  />
                </div>

                <Textarea
                  label="Standard Quotation Terms & Conditions"
                  value={formData.termsDefault || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, termsDefault: e.target.value })
                  }
                  rows={5}
                  placeholder="Enter default contract terms printed on PDF quotations..."
                />
              </Card>
            )}

            {/* Social Media */}
            {activeSection === 'social' && (
              <Card className="p-6 border border-brand-border/60 space-y-5">
                <div>
                  <h3 className="text-lg font-serif font-bold text-brand-dark">
                    Social Media Profiles & Portfolio Links
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Links displayed on website footer and customer communications.
                  </p>
                </div>

                <Input
                  label="Instagram Profile Link"
                  value={formData.socialInstagram || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, socialInstagram: e.target.value })
                  }
                  placeholder="https://instagram.com/sathuragiri_decoration"
                />

                <Input
                  label="Facebook Page Link"
                  value={formData.socialFacebook || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, socialFacebook: e.target.value })
                  }
                  placeholder="https://facebook.com/sathuragiridecoration"
                />

                <Input
                  label="YouTube Channel Link"
                  value={formData.socialYoutube || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, socialYoutube: e.target.value })
                  }
                  placeholder="https://youtube.com/@sathuragiridecoration"
                />
              </Card>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                isLoading={updateMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Business Settings
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
