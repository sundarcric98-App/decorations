import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { BusinessSettings } from '../types';

interface SettingsContextType {
  settings: BusinessSettings | null;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultFallbackSettings: BusinessSettings = {
  id: 'default-settings',
  businessName: 'Sathuragiri Decoration',
  tagline: 'Every Celebration, Beautifully Crafted.',
  phone: '+91 98421 87654',
  alternatePhone: '+91 94432 10987',
  whatsappNumber: '+919842187654',
  email: 'contact@sathuragiridecoration.com',
  address: 'Plot No. 45, Temple View Avenue, Near Ring Road',
  city: 'Madurai',
  state: 'Tamil Nadu',
  pincode: '625009',
  mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125747.88722421375!2d78.04169722883301!3d9.92520074218841!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00c582b1189633%3A0xdc955b7264f63933!2sMadurai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  primaryGold: '#B8955A',
  gstNumber: '33AAHCS1234F1Z9',
  advancePercentageDefault: 30,
  currencySymbol: '₹',
  termsDefault: '1. 30% advance on booking.\n2. 50% prior to event setup.\n3. 20% on completion.',
  socialInstagram: 'https://instagram.com/sathuragiridecoration',
  socialFacebook: 'https://facebook.com/sathuragiridecoration',
  socialYoutube: 'https://youtube.com/@sathuragiridecoration',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultFallbackSettings,
  isLoading: false,
  refreshSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BusinessSettings>(defaultFallbackSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSettings = async () => {
    try {
      const data = await api.get<BusinessSettings>('/settings');
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.warn('Could not fetch remote settings, using defaults.', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
