import { useSiteConfig } from '../context/SiteConfigContext';

export default function Splash() {
  const { logo_url } = useSiteConfig();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-primary)',
    }}>
      <img
        src={logo_url}
        alt="Logo"
        style={{ height: 40, opacity: 0.85 }}
      />
    </div>
  );
}
