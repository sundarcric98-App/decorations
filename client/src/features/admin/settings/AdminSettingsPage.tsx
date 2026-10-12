import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings as SettingsIcon,
  Save,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  Youtube,
  Sparkles,
  Upload,
} from "lucide-react";
import { api } from "../../../lib/api";
import { BusinessSettings } from "../../../types";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Textarea } from "../../../components/common/Textarea";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner";
import { useToast } from "../../../context/ToastContext";
import { useSettings } from "../../../context/SettingsContext";

export const AdminSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { refreshSettings } = useSettings();

  const [formData, setFormData] = useState<Partial<BusinessSettings>>({
    business_name: "Sathuragiri Decoration",
    tagline: "Every Celebration, Beautifully Crafted.",
    logo_url: "/logo-gold.svg",
    whatsapp_number: "+9189035 75802",
    phone: "+91 98421 87654",
    email: "contact@sathuragiridecoration.com",
    address: "Usilai Road, Peraiyur - 625703, Madurai District, Tamil Nadu",
    about_text:
      "At Sathuragiri Decoration, we transform your most cherished milestones into timeless memories. Rooted in traditional South Indian heritage and elevated with contemporary luxury design, our master artisans create breathtaking wedding mandaps, opulent reception stages, joyous birthday backdrops, and auspicious family celebrations.",
    instagram_url: "https://instagram.com/sathuragiridecoration",
    facebook_url: "https://facebook.com/sathuragiridecoration",
    youtube_url: "https://youtube.com/@sathuragiridecoration",
    footer_text:
      "© 2026 Sathuragiri Decoration. Every Celebration, Beautifully Crafted. All rights reserved.",
  });

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Fetch settings from backend
  const { data: serverSettings, isLoading } = useQuery({
    queryKey: ["admin-business-settings"],
    queryFn: () => api.get<BusinessSettings>("/admin/settings"),
  });

  useEffect(() => {
    if (serverSettings) {
      setFormData({
        business_name:
          serverSettings.business_name || serverSettings.businessName || "",
        tagline: serverSettings.tagline || "",
        logo_url:
          serverSettings.logo_url ||
          serverSettings.logoUrl ||
          "/Decoration_Logo.png",
        whatsapp_number:
          serverSettings.whatsapp_number ||
          serverSettings.whatsappNumber ||
          "918903575802",
        whatsapp_number_secondary:
          serverSettings.whatsapp_number_secondary ||
          serverSettings.whatsappNumberSecondary ||
          "919842322624",
        phone: serverSettings.phone || "+91 89035 75802, +91 98423 22624",
        email: serverSettings.email || "",
        address: serverSettings.address || "",
        about_text: serverSettings.about_text || serverSettings.aboutText || "",
        instagram_url:
          serverSettings.instagram_url || serverSettings.socialInstagram || "",
        facebook_url:
          serverSettings.facebook_url || serverSettings.socialFacebook || "",
        youtube_url:
          serverSettings.youtube_url || serverSettings.socialYoutube || "",
        footer_text:
          serverSettings.footer_text || serverSettings.footerText || "",
      });
    }
  }, [serverSettings]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put("/admin/settings", data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["admin-business-settings"] });
      queryClient.invalidateQueries({ queryKey: ["public-settings"] });
      await refreshSettings();
      success("Business settings saved successfully and live on website");
    },
    onError: (err: any) => {
      error(err.message || "Failed to update settings");
    },
  });

  const handleInputChange = (field: keyof BusinessSettings, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    setIsUploadingLogo(true);
    try {
      const res = await api.post<any>("/admin/upload", form);
      const url = res.url || res.image_url;
      if (url) {
        handleInputChange("logo_url", url);
        success("Logo uploaded to Supabase Storage");
      }
    } catch (err: any) {
      error(err.message || "Logo upload failed");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading business settings..." fullHeight />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B8955A]">
            Configuration
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#28231F] mt-1">
            Business Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#77716B] mt-1">
            Manage your company details, WhatsApp enquiry phone number, address,
            and social links.
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSubmit}
          isLoading={updateMutation.isPending}
        >
          Save All Settings
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Identity & WhatsApp Channel (PRIMARY) */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E0D6] shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E8E0D6]">
            <div className="w-8 h-8 rounded-lg bg-[#25D366]/15 flex items-center justify-center text-[#25D366]">
              <MessageCircle className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#28231F]">
                WhatsApp & Primary Brand Identity
              </h2>
              <p className="text-xs text-[#77716B]">
                WhatsApp is the primary customer enquiry channel across the
                website.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                WhatsApp Line 1 (Primary) *
              </label>
              <Input
                value={formData.whatsapp_number || ""}
                onChange={(e) =>
                  handleInputChange("whatsapp_number", e.target.value)
                }
                placeholder="918903575802"
                required
              />
              <p className="text-[11px] text-gray-500 mt-1">
                e.g. 918903575802 or +91 89035 75802
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                WhatsApp Line 2 (Alternate)
              </label>
              <Input
                value={formData.whatsapp_number_secondary || ""}
                onChange={(e) =>
                  handleInputChange("whatsapp_number_secondary", e.target.value)
                }
                placeholder="919842322624"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                e.g. 919842322624 or +91 98423 22624
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                Telephone Enquiries (Calls)
              </label>
              <Input
                value={formData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+91 89035 75802, +91 98423 22624"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Displayed in Header & Footer
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                Business Name
              </label>
              <Input
                value={formData.business_name || ""}
                onChange={(e) =>
                  handleInputChange("business_name", e.target.value)
                }
                placeholder="Sathuragiri Decoration"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                Tagline
              </label>
              <Input
                value={formData.tagline || ""}
                onChange={(e) => handleInputChange("tagline", e.target.value)}
                placeholder="Every Celebration, Beautifully Crafted."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#28231F] mb-1">
              Logo URL / Upload
            </label>
            <div className="flex gap-2">
              <Input
                value={formData.logo_url || ""}
                onChange={(e) => handleInputChange("logo_url", e.target.value)}
                placeholder="/logo-gold.svg or https://..."
                className="flex-1"
              />
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8E0D6] text-xs font-semibold text-[#28231F] hover:bg-[#B8955A]/10 hover:border-[#B8955A] transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#B8955A]" />
                <span>{isUploadingLogo ? "Uploading..." : "Upload Logo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isUploadingLogo}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* 2. Contact Details & Physical Location */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E0D6] shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E8E0D6]">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8E0D6] flex items-center justify-center text-[#B8955A]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#28231F]">
                Location & Communication
              </h2>
              <p className="text-xs text-[#77716B]">
                Shown in the website footer and contact consultation section.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                Official Email Address
              </label>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="contact@sathuragiridecoration.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                Studio / Workshop Full Address
              </label>
              <Input
                value={formData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Usilai Road, Peraiyur - 625703, Madurai District, Tamil Nadu"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#28231F] mb-1">
              About Us Story Text
            </label>
            <Textarea
              rows={4}
              value={formData.about_text || ""}
              onChange={(e) => handleInputChange("about_text", e.target.value)}
              placeholder="Introduction describing your tradition, floral artistry, and client devotion..."
            />
          </div>
        </div>

        {/* 3. Social Channels & Footer */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E0D6] shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E8E0D6]">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8E0D6] flex items-center justify-center text-[#B8955A]">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#28231F]">
                Social Media Links & Footer Text
              </h2>
              <p className="text-xs text-[#77716B]">
                Social profiles linked across public pages and the website
                footer.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                Instagram URL
              </label>
              <Input
                value={formData.instagram_url || ""}
                onChange={(e) =>
                  handleInputChange("instagram_url", e.target.value)
                }
                placeholder="https://instagram.com/sathuragiridecoration"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                Facebook URL
              </label>
              <Input
                value={formData.facebook_url || ""}
                onChange={(e) =>
                  handleInputChange("facebook_url", e.target.value)
                }
                placeholder="https://facebook.com/sathuragiridecoration"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#28231F] mb-1">
                YouTube URL
              </label>
              <Input
                value={formData.youtube_url || ""}
                onChange={(e) =>
                  handleInputChange("youtube_url", e.target.value)
                }
                placeholder="https://youtube.com/@sathuragiridecoration"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#28231F] mb-1">
              Footer Copyright Text
            </label>
            <Input
              value={formData.footer_text || ""}
              onChange={(e) => handleInputChange("footer_text", e.target.value)}
              placeholder="© 2026 Sathuragiri Decoration. Every Celebration, Beautifully Crafted. All rights reserved."
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="gold"
            size="lg"
            leftIcon={<Save className="w-4 h-4" />}
            isLoading={updateMutation.isPending}
          >
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
export default AdminSettingsPage;
