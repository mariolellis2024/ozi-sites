export default function Footer() {
  return (
    <footer id="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="nav-logo">
              <img src="/images/logo.webp" alt="Alanis" style={{ height: 32 }} />
            </a>
            <p>Alanis, a plataforma de educação profissional com monetização nativa. Transforme conteúdo em máquina de vendas e sorrisos.</p>
            <div className="footer-social">
              <a href="https://www.instagram.com/alanis.digital1/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
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
              <li><a href="mailto:contato@alanis.digital">contato@alanis.digital</a></li>
              <li><a href="https://wa.me/5511984866827?text=Ol%C3%A1%2C%20quero%20garantir%20minha%20c%C3%B3pia%20da%20Alanis." target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              <li><a href="#">Telefone</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Alanis. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
