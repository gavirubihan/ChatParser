import { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  item?: string;
}

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  schema?: Record<string, unknown>;
  breadcrumbs?: BreadcrumbItem[];
}

export function useSEO({ title, description, canonical, noindex, schema, breadcrumbs }: SEOProps) {
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
        // Empty string means "no canonical" — remove the href so bots ignore it
        canonicalTag.removeAttribute('href');
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

    // 5. Inject Structured Data (page-level schema)
    // Use a data attribute to avoid stacking duplicate scripts on re-renders
    const PAGE_SCHEMA_ID = 'seo-page-schema';
    const existing = document.getElementById(PAGE_SCHEMA_ID);
    if (existing) existing.remove();

    const scripts: HTMLScriptElement[] = [];

    if (schema) {
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.id = PAGE_SCHEMA_ID;
      schemaScript.textContent = JSON.stringify(schema);
      document.head.appendChild(schemaScript);
      scripts.push(schemaScript);
    }

    // 6. Inject BreadcrumbList schema
    const BREADCRUMB_SCHEMA_ID = 'seo-breadcrumb-schema';
    const existingBreadcrumb = document.getElementById(BREADCRUMB_SCHEMA_ID);
    if (existingBreadcrumb) existingBreadcrumb.remove();

    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.id = BREADCRUMB_SCHEMA_ID;
      breadcrumbScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          ...(crumb.item ? { item: crumb.item } : {}),
        })),
      });
      document.head.appendChild(breadcrumbScript);
      scripts.push(breadcrumbScript);
    }

    return () => {
      scripts.forEach(s => s.remove());
      // Also clean up breadcrumb if no schema was provided but breadcrumb was
      const bc = document.getElementById(BREADCRUMB_SCHEMA_ID);
      if (bc) bc.remove();
    };
  }, [title, description, canonical, noindex, schema, breadcrumbs]);
}
