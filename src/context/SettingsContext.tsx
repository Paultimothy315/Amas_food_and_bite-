import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactPhoneSecondary: string;
  addressLokogoma: string;
  addressDurumi: string;
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  metaTitle: string;
  metaDescription: string;
  openingHours: {
    monFri: string;
    sat: string;
    sun: string;
  };
}

const defaultSettings: SiteSettings = {
  siteName: "AMA'S FOOD AND BITE",
  siteDescription: "Authentic Nigerian native dishes and fast food favorites.",
  contactEmail: "info@amasfoodandbite.com",
  contactPhone: "0816 511 7588",
  contactPhoneSecondary: "0902 911 3628",
  addressLokogoma: "Plot 501 Gaduwa Express Way, beside Maxcare Plaza, Abuja",
  addressDurumi: "Zagada Oil & Gas Filling Station, Durumi 3, along Gudu Road, Abuja",
  whatsappNumber: "2348165117588",
  instagramUrl: "https://instagram.com/amasfoodandbite",
  facebookUrl: "https://facebook.com/amasfoodandbite",
  twitterUrl: "",
  metaTitle: "AMA'S FOOD AND BITE | Authentic Nigerian Native Dishes & Fast Food",
  metaDescription: "Experience the best of Nigerian native dishes and fast food favorites in Abuja. Fast delivery, fresh ingredients, and authentic taste.",
  openingHours: {
    monFri: "9:00 AM – 10:00 PM",
    sat: "10:00 AM – 11:00 PM",
    sun: "12:00 PM – 9:00 PM"
  }
};

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as SiteSettings);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/global');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
