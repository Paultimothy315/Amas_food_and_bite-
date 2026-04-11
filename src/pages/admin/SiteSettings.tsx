import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { Save, Globe, Phone, Mail, MapPin, Instagram, Facebook, Twitter, Info, Search, Layout, Image as ImageIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';

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
  siteName: "Ama's Food & Bite",
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
  metaTitle: "Ama's Food & Bite | Authentic Nigerian Native Dishes & Fast Food",
  metaDescription: "Experience the best of Nigerian native dishes and fast food favorites in Abuja. Fast delivery, fresh ingredients, and authentic taste.",
  openingHours: {
    monFri: "9:00 AM – 10:00 PM",
    sat: "10:00 AM – 11:00 PM",
    sun: "12:00 PM – 9:00 PM"
  }
};

export default function SiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'seo'>('general');

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        ...settings,
        updatedAt: serverTimestamp()
      });
      toast.success("Settings saved successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/global');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-border">
        <div>
          <h1 className="text-3xl font-serif font-bold text-secondary">Site Settings</h1>
          <p className="text-secondary/70">Global configuration and content management</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:-translate-y-1 disabled:opacity-70"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Save size={20} className="mr-2" />
          )}
          Save Changes
        </button>
      </div>

      <div className="flex bg-white p-1.5 rounded-2xl border border-border shadow-sm">
        <button 
          onClick={() => setActiveTab('general')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'general' ? 'bg-secondary text-white shadow-md' : 'text-secondary/50 hover:bg-secondary/5'}`}
        >
          <Layout size={18} /> General
        </button>
        <button 
          onClick={() => setActiveTab('contact')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'contact' ? 'bg-secondary text-white shadow-md' : 'text-secondary/50 hover:bg-secondary/5'}`}
        >
          <Phone size={18} /> Contact & Social
        </button>
        <button 
          onClick={() => setActiveTab('seo')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'seo' ? 'bg-secondary text-white shadow-md' : 'text-secondary/50 hover:bg-secondary/5'}`}
        >
          <Globe size={18} /> SEO & Meta
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-border">
        {activeTab === 'general' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary">Restaurant Name</label>
                <input 
                  type="text" 
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary">Tagline / Description</label>
                <textarea 
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                  rows={2}
                  className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                ></textarea>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="font-bold text-secondary mb-4 flex items-center gap-2">
                <Clock className="text-primary" size={18} /> Opening Hours
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-secondary/40 uppercase tracking-wider">Mon – Fri</label>
                  <input 
                    type="text" 
                    value={settings.openingHours.monFri}
                    onChange={(e) => setSettings({...settings, openingHours: {...settings.openingHours, monFri: e.target.value}})}
                    className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-secondary/40 uppercase tracking-wider">Saturday</label>
                  <input 
                    type="text" 
                    value={settings.openingHours.sat}
                    onChange={(e) => setSettings({...settings, openingHours: {...settings.openingHours, sat: e.target.value}})}
                    className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-secondary/40 uppercase tracking-wider">Sunday</label>
                  <input 
                    type="text" 
                    value={settings.openingHours.sun}
                    onChange={(e) => setSettings({...settings, openingHours: {...settings.openingHours, sun: e.target.value}})}
                    className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary">Primary Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
                  <input 
                    type="text" 
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary">Secondary Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
                  <input 
                    type="text" 
                    value={settings.contactPhoneSecondary}
                    onChange={(e) => setSettings({...settings, contactPhoneSecondary: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary">Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
                  <input 
                    type="email" 
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary">WhatsApp Number (Intl Format)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40 font-bold">+</span>
                  <input 
                    type="text" 
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
                    className="w-full pl-8 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="234..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="font-bold text-secondary flex items-center gap-2">
                <MapPin className="text-primary" size={18} /> Branch Addresses
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-secondary/40 uppercase tracking-wider">Lokogoma Branch</label>
                  <input 
                    type="text" 
                    value={settings.addressLokogoma}
                    onChange={(e) => setSettings({...settings, addressLokogoma: e.target.value})}
                    className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-secondary/40 uppercase tracking-wider">Durumi Branch</label>
                  <input 
                    type="text" 
                    value={settings.addressDurumi}
                    onChange={(e) => setSettings({...settings, addressDurumi: e.target.value})}
                    className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="font-bold text-secondary flex items-center gap-2">
                <Globe className="text-primary" size={18} /> Social Media Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-secondary/40 uppercase tracking-wider flex items-center gap-1">
                    <Instagram size={12} /> Instagram
                  </label>
                  <input 
                    type="url" 
                    value={settings.instagramUrl}
                    onChange={(e) => setSettings({...settings, instagramUrl: e.target.value})}
                    className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-secondary/40 uppercase tracking-wider flex items-center gap-1">
                    <Facebook size={12} /> Facebook
                  </label>
                  <input 
                    type="url" 
                    value={settings.facebookUrl}
                    onChange={(e) => setSettings({...settings, facebookUrl: e.target.value})}
                    className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-secondary/40 uppercase tracking-wider flex items-center gap-1">
                    <Twitter size={12} /> Twitter
                  </label>
                  <input 
                    type="url" 
                    value={settings.twitterUrl}
                    onChange={(e) => setSettings({...settings, twitterUrl: e.target.value})}
                    className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-muted p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-secondary flex items-center gap-2">
                <Search size={18} className="text-primary" /> Homepage Search Preview
              </h3>
              <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
                <p className="text-[#1a0dab] text-xl hover:underline cursor-pointer mb-1 truncate">
                  {settings.metaTitle || settings.siteName}
                </p>
                <p className="text-[#006621] text-sm mb-1 truncate">
                  https://amasfoodandbite.com/
                </p>
                <p className="text-[#545454] text-sm line-clamp-2">
                  {settings.metaDescription || settings.siteDescription}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary">Global Meta Title</label>
                <input 
                  type="text" 
                  value={settings.metaTitle}
                  onChange={(e) => setSettings({...settings, metaTitle: e.target.value})}
                  className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                  <span className={settings.metaTitle.length > 60 ? 'text-red-500' : 'text-secondary/40'}>
                    {settings.metaTitle.length} / 60 characters
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary">Global Meta Description</label>
                <textarea 
                  value={settings.metaDescription}
                  onChange={(e) => setSettings({...settings, metaDescription: e.target.value})}
                  rows={4}
                  className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                ></textarea>
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                  <span className={settings.metaDescription.length > 160 ? 'text-red-500' : 'text-secondary/40'}>
                    {settings.metaDescription.length} / 160 characters
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
