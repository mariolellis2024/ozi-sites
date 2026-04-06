import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface SiteConfig {
  logo_url: string;
  favicon_url: string;
  site_title: string;
}

const defaults: SiteConfig = {
  logo_url: '/images/logo.webp',
  favicon_url: '/images/favicon.webp',
  site_title: 'Alanis | A Área de Membros do Futuro',
};

const SiteConfigContext = createContext<SiteConfig>(defaults);

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaults);

  useEffect(() => {
    fetch('/api/settings/public/site_config')
      .then(r => r.ok ? r.json() : defaults)
      .then((data: SiteConfig) => {
        const merged = {
          logo_url: data.logo_url || defaults.logo_url,
          favicon_url: data.favicon_url || defaults.favicon_url,
          site_title: data.site_title || defaults.site_title,
        };
        setConfig(merged);

        // Apply title
        document.title = merged.site_title;

        // Apply favicon
        let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (link) {
          link.href = merged.favicon_url;
        } else {
          link = document.createElement('link');
          link.rel = 'icon';
          link.href = merged.favicon_url;
          document.head.appendChild(link);
        }
      })
      .catch(() => { /* use defaults */ });
  }, []);

  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}
