import { useSiteConfig } from '../context/SiteConfigContext';
import EditableText from './ui/EditableText';
import { useEdit } from '../context/EditContext';

interface FooterProps {
  dynamicContent?: Record<string, any>;
}

export default function Footer({ dynamicContent: dc }: FooterProps) {
  const { logo_url } = useSiteConfig();
  const edit = useEdit();
  const e = edit?.isEditing;
  const src = e ? edit.content : dc;

  const footerDesc = src?.footer_desc || 'Alanis, a plataforma de educação profissional com monetização nativa. Transforme conteúdo em máquina de vendas e sorrisos.';
  const footerEmail = src?.footer_email || 'contato@alanis.digital';
  const footerWhatsapp = src?.footer_whatsapp || 'https://wa.me/5511984866827?text=Ol%C3%A1%2C%20quero%20garantir%20minha%20c%C3%B3pia%20da%20Alanis.';
  const footerCopyright = src?.footer_copyright || '© 2026 Alanis. Todos os direitos reservados.';
  const footerInstagram = src?.footer_instagram || 'https://www.instagram.com/alanis.digital1/';

  return (
    <footer id="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="nav-logo">
              <img src={logo_url} alt="Logo" style={{ height: 32 }} />
            </a>
            <p>
              {e ? (
                <EditableText fieldKey="footer_desc" label="Descrição do Footer">{footerDesc}</EditableText>
              ) : footerDesc}
            </p>
            <div className="footer-social">
              {e ? (
                <EditableText fieldKey="footer_instagram" label="Link do Instagram">
                  <a href={footerInstagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                    </svg>
                  </a>
                </EditableText>
              ) : (
                <a href={footerInstagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              )}
            </div>
          </div>
          <div className="footer-col">
            <h4>Menu</h4>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#section-quick-benefits">Funcionalidades</a></li>
              <li><a href="#section-comparativo">Diferenciais</a></li>
              <li><a href="#section-faq">FAQ</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Informações</h4>
            <ul>
              <li><a href="#">Termos de uso</a></li>
              <li><a href="#">Privacidade</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contato</h4>
            <ul>
              <li>
                {e ? (
                  <EditableText fieldKey="footer_email" label="Email do Footer">
                    <a href={`mailto:${footerEmail}`}>{footerEmail}</a>
                  </EditableText>
                ) : (
                  <a href={`mailto:${footerEmail}`}>{footerEmail}</a>
                )}
              </li>
              <li>
                {e ? (
                  <EditableText fieldKey="footer_whatsapp" label="Link do WhatsApp">
                    <a href={footerWhatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                  </EditableText>
                ) : (
                  <a href={footerWhatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                )}
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            {e ? (
              <EditableText fieldKey="footer_copyright" label="Copyright">{footerCopyright}</EditableText>
            ) : footerCopyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
