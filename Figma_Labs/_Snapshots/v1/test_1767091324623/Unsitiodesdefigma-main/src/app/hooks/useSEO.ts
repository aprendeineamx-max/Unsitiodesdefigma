import { useEffect } from 'react';
import { useLocation } from './useLocation';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: string;
  author?: string;
}

export function useSEO({
  title,
  description,
  image = 'https://platzi.com/og-image.png',
  type = 'website',
  author = 'Platzi'
}: SEOProps) {
  const location = useLocation();
  const url = `https://platzi.com${location}`;

  useEffect(() => {
    // Update document title
    document.title = `${title} | Platzi`;

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('author', author);

    // Open Graph
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', image, 'property');
    updateMetaTag('og:url', url, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', 'Platzi', 'property');

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', '@platzi');

    // Canonical URL
    updateLinkTag('canonical', url);

    // JSON-LD Structured Data
    updateStructuredData({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description: description,
      url: url,
      publisher: {
        '@type': 'Organization',
        name: 'Platzi',
        logo: {
          '@type': 'ImageObject',
          url: 'https://platzi.com/logo.png'
        }
      }
    });
  }, [title, description, image, url, type, author]);
}

function updateMetaTag(name: string, content: string, attribute: string = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`);
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  
  element.setAttribute('href', href);
}

function updateStructuredData(data: any) {
  let script = document.querySelector('script[type="application/ld+json"]');
  
  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    document.head.appendChild(script);
  }
  
  script.textContent = JSON.stringify(data);
}

// Hook to get current location
function useLocation() {
  return typeof window !== 'undefined' ? window.location.pathname : '/';
}
