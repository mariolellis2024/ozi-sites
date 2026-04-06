import { useState } from 'react';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { useSiteConfig } from '../context/SiteConfigContext';

interface NavbarProps {
  onOpenModal: () => void;
}

export default function Navbar({ onOpenModal }: NavbarProps) {
  const scrollY = useScrollPosition();
  const [menuOpen, setMenuOpen] = useState(false);
  const { logo_url } = useSiteConfig();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className={`navbar${scrollY > 80 ? ' scrolled' : ''}`} id="navbar">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <a href="#" className="nav-logo">
            <img src={logo_url} alt="Logo" />
          </a>
          <ul className="nav-links">
            <li><a href="#section-quick-benefits">Funcionalidades</a></li>
            <li><a href="#section-comparativo">Diferenciais</a></li>
            <li><a href="#section-faq">FAQ</a></li>
          </ul>
          <div className="nav-actions">
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenModal(); }} className="btn-primary">
              Quero a Minha Alanis
            </a>
            <button className="hamburger" aria-label="Menu" onClick={toggleMenu}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu${menuOpen ? ' active' : ''}`} onClick={(e) => {
        if ((e.target as HTMLElement).tagName === 'A') closeMenu();
      }}>
        <a href="#section-quick-benefits">Funcionalidades</a>
        <a href="#section-comparativo">Diferenciais</a>
        <a href="#section-faq">FAQ</a>
        <a href="#" className="btn-login" style={{ border: '1px solid var(--color-border)', padding: '12px 32px', borderRadius: 'var(--radius-full)' }}>
          Login
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); onOpenModal(); closeMenu(); }} className="btn-primary">
          Garantir Minha Cópia
        </a>
      </div>

      {menuOpen && <style>{`.menu-open .hamburger span:nth-child(1){transform:rotate(45deg) translate(5px,5px)}.menu-open .hamburger span:nth-child(2){opacity:0}.menu-open .hamburger span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}`}</style>}
      {menuOpen && <script dangerouslySetInnerHTML={{ __html: `document.body.classList.add('menu-open')` }} />}
    </>
  );
}
