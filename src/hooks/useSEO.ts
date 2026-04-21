import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  schema?: Record<string, any>;
}

export function useSEO({ title, description, canonical, noindex, schema }: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    document.title = title;
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);

    // 2. Update Description
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
      document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
    }

    // 3. Update Canonical URL & OG URL
    const canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag && canonical !== undefined) {
      if (canonical === '') {
        canonicalTag.setAttribute('href', '');
      } else {
        const fullUrl = `https://chatparser.online${canonical}`;
        canonicalTag.setAttribute('href', fullUrl);
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', fullUrl);
      }
    }

    // 4. Update Robots
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (robotsTag) {
        robotsTag.setAttribute('content', 'noindex, nofollow');
      } else {
        robotsTag = document.createElement('meta');
        robotsTag.setAttribute('name', 'robots');
        robotsTag.setAttribute('content', 'noindex, nofollow');
        robotsTag.id = 'temp-robots';
        document.head.appendChild(robotsTag);
      }
    } else {
      if (robotsTag) {
        robotsTag.setAttribute('content', 'index, follow');
      } else {
        // Remove temp robots tag if we added one previously
        const temp = document.getElementById('temp-robots');
        if (temp) temp.remove();
      }
    }

    // 5. Update Structured Data
    let schemaScript: HTMLScriptElement | null = null;
    if (schema) {
      schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.textContent = JSON.stringify(schema);
      document.head.appendChild(schemaScript);
    }

    return () => {
      if (schemaScript) {
        schemaScript.remove();
      }
    };
  }, [title, description, canonical, noindex, schema]);
}
