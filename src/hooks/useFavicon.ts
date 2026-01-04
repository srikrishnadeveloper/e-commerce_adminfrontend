import { useEffect } from 'react';

/**
 * Hook to dynamically update the document favicon from site config
 */
export const useFavicon = () => {
  useEffect(() => {
    const loadFavicon = async () => {
      try {
        const response = await fetch('/siteconfig-api/siteconfig');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.branding?.faviconUrl) {
            const faviconUrl = result.data.branding.faviconUrl;
            
            // Get or create favicon link element
            let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            
            // Update favicon href
            const fullUrl = faviconUrl.startsWith('http') 
              ? faviconUrl 
              : `http://localhost:5001${faviconUrl}`;
            link.href = fullUrl;
            
            // Also update the type if it's an SVG
            if (faviconUrl.endsWith('.svg')) {
              link.type = 'image/svg+xml';
            } else if (faviconUrl.endsWith('.png')) {
              link.type = 'image/png';
            } else if (faviconUrl.endsWith('.ico')) {
              link.type = 'image/x-icon';
            }
          }
        }
      } catch (error) {
        console.error('Failed to load favicon from site config:', error);
      }
    };

    loadFavicon();
  }, []);
};
