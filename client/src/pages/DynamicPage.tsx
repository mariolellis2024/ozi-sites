import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Home from './Home';
import { COLOR_PALETTES } from '../config/colorPalettes';

interface PageContent {
  id: number;
  name: string;
  slug: string;
  palette_id?: string;
  base_template_id?: number;
  reveal_seconds?: number;
  content_index: {
    seo_title: string;
    seo_description: string;
    hero_title: string;
    hero_subtitle: string;
    hero_image: string;
    cta_text: string;
    pix_link: string;
    pix_price: string;
    pix_detail: string;
    card_link: string;
    card_price: string;
    card_detail: string;
  };
  content_obrigado: {
    title: string;
    subtitle: string;
    message: string;
    cta_text: string;
    cta_link: string;
  };
}

export function useDynamicPage() {
  const { slug } = useParams();
  const [content, setContent] = useState<PageContent | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pages/p/${slug}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then(data => { if (data) { setContent(data); setLoading(false); } })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  // Apply palette CSS variables to :root when content loads
  useEffect(() => {
    if (!content?.palette_id || content.palette_id === 'mint') return;
    const palette = COLOR_PALETTES.find(p => p.id === content.palette_id);
    if (!palette) return;
    const root = document.documentElement;
    const entries = Object.entries(palette.variables);
    entries.forEach(([key, value]) => root.style.setProperty(key, value));
    return () => { entries.forEach(([key]) => root.style.removeProperty(key)); };
  }, [content?.palette_id]);

  return { content, notFound, loading };
}

export default function DynamicPage() {
  const { content, notFound, loading } = useDynamicPage();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
          Carregando...
        </div>
      </div>
    );
  }

  if (notFound || !content) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--color-accent)', margin: 0 }}>404</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 8 }}>Página não encontrada</p>
          <a href="/" className="btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>Voltar ao início</a>
        </div>
      </div>
    );
  }

  // Update document title
  document.title = content.name || content.content_index.seo_title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', content.content_index.seo_description);

  // Render the Home component with dynamic content overrides
  return <Home dynamicContent={content} pageId={content.id} slug={content.slug} />;
}
