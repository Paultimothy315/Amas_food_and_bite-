import { useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';

interface SEOProps {
  title?: string;
  description?: string;
  slug?: string;
}

export default function SEO({ title, description, slug }: SEOProps) {
  const { settings } = useSettings();

  useEffect(() => {
    // Update Title
    const baseTitle = settings.siteName;
    const metaTitle = title || settings.metaTitle || baseTitle;
    document.title = metaTitle;

    // Update Meta Description
    const metaDescription = description || settings.metaDescription || settings.siteDescription;
    let metaDescTag = document.querySelector('meta[name="description"]');
    if (!metaDescTag) {
      metaDescTag = document.createElement('meta');
      metaDescTag.setAttribute('name', 'description');
      document.head.appendChild(metaDescTag);
    }
    metaDescTag.setAttribute('content', metaDescription);

    // Update Canonical Link (optional but good for SEO)
    const canonicalUrl = `https://amasfoodandbite.com${slug ? `/${slug}` : ''}`;
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);

  }, [title, description, slug, settings]);

  return null;
}
