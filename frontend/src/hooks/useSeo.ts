import { useEffect } from 'react';

export interface SeoProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: string;
}

export const useSeo = ({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
}: SeoProps) => {
  useEffect(() => {
    // 1. Set Document Title
    const fullTitle = title.includes('Filoro') ? title : `${title} | Filoro`;
    document.title = fullTitle;

    // Helper to get or create a meta tag
    const setMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      let tag = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attrName, attrVal);
        document.head.appendChild(tag);
      }
      tag.content = contentVal;
    };

    // Helper to get or create link rel="canonical"
    const setCanonical = (href: string) => {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Construct absolute canonical URL
    const baseUrl = window.location.origin;
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = `${baseUrl}${cleanPath}`;

    // Standard SEO Tags
    setMetaTag('name', 'description', description);
    setCanonical(canonicalUrl);

    // Open Graph Tags
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'Filoro');

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);

    return () => {
      // Revert title on unmount if needed
      document.title = 'Filoro — Simple, Honest File Utilities';
    };
  }, [title, description, canonicalPath, ogType]);
};

