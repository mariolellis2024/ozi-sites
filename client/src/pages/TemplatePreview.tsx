import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { COLOR_PALETTES } from '../config/colorPalettes';

/**
 * TemplatePreview — renders a template's content as a read-only landing page preview.
 * Loaded inside an iframe from the TemplatePreviewModal.
 *
 * Route: /admin/preview/template/:source/:id/:type?palette=<paletteId>
 * - source = 'base' (base_templates) or 'saved' (page_templates)
 * - type = 'index' → renders the landing page (Home)
 * - type = 'obrigado' → renders the thank-you page
 * - palette = optional palette id to apply color theme
 */
export default function TemplatePreview() {
  const { source, id, type } = useParams<{ source: string; id: string; type: string }>();
  const [searchParams] = useSearchParams();
  const paletteId = searchParams.get('palette');

  const [content, setContent] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [HomeComponent, setHomeComponent] = useState<any>(null);
  const [ObrigadoComponent, setObrigadoComponent] = useState<any>(null);

  // Inject palette CSS variables into :root
  useEffect(() => {
    if (!paletteId) return;
    const palette = COLOR_PALETTES.find(p => p.id === paletteId);
    if (!palette) return;

    const root = document.documentElement;
    const entries = Object.entries(palette.variables);
    entries.forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    return () => {
      // Cleanup: remove overrides when unmounting
      entries.forEach(([key]) => {
        root.style.removeProperty(key);
      });
    };
  }, [paletteId]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { setError('Não autenticado'); setLoading(false); return; }

    const apiUrl = source === 'base'
      ? `/api/base-templates/${id}/preview/${type}`
      : `/api/templates/${id}/preview/${type}`;

    fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        setContent(data.content || {});
        if (data.type === 'obrigado') {
          import('./DynamicObrigadoVisual').then(mod => setObrigadoComponent(() => mod.default));
        } else {
          import('./Home').then(mod => setHomeComponent(() => mod.default));
        }
      })
      .catch(() => setError('Erro ao carregar preview'))
      .finally(() => setLoading(false));
  }, [source, id, type]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)',
      }}>
        Carregando preview...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg-primary)', color: '#ff6b6b',
      }}>
        {error}
      </div>
    );
  }

  if (type === 'obrigado' && ObrigadoComponent && content) {
    return <ObrigadoComponent content={content} />;
  }

  if (type === 'index' && HomeComponent && content) {
    return <HomeComponent dynamicContent={{ content_index: content }} />;
  }

  return null;
}
