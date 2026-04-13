import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const getPageNameForPath = (path: string): string | null => {
  if (path === '/') return null; // Home is always the root, handled separately
  if (path === '/about') return 'About ChatParser';
  if (path === '/privacy') return 'Privacy Policy';
  if (path.startsWith('/chat')) return 'WhatsApp Chat Viewer';
  return null; // Unrecognized routes or 404
};

export const DynamicBreadcrumbs: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const pageName = getPageNameForPath(path);
    const host = 'https://chatparser.online';

    // Initialize with Home as the base item
    const itemListElement: any[] = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": host
      }
    ];

    // If it's a known subpage, add it to the breadcrumb list
    if (pageName) {
      itemListElement.push({
        "@type": "ListItem",
        "position": 2,
        "name": pageName,
        "item": host + path
      });
    } else if (path !== '/') {
        // If it's an unknown path (like a 404), do not emit breadcrumb JSON-LD at all
        const existingScript = document.getElementById('dynamic-breadcrumb-schema');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
        return;
    }

    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": itemListElement
    };

    // Remove any existing breadcrumb tag before adding a new one
    const existingScript = document.getElementById('dynamic-breadcrumb-schema');
    if (existingScript) {
      document.head.removeChild(existingScript);
    }

    // Create and inject the new script tag
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'dynamic-breadcrumb-schema';
    script.text = JSON.stringify(breadcrumbList);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById('dynamic-breadcrumb-schema');
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, [location.pathname]);

  return null;
};
