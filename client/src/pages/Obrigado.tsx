import { useEffect, useRef } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function Obrigado() {
  const particlesRef = useRef<HTMLDivElement>(null);
  const { logo_url } = useSiteConfig();

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;
    const colors = ['#75fbc6', '#5ee0ad', '#ffffff', '#a8a8b8', '#75fbc6'];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.width = (3 + Math.random() * 5) + 'px';
      p.style.height = p.style.width;
      p.style.animationDelay = (Math.random() * 2) + 's';
      p.style.animationDuration = (2.5 + Math.random() * 2) + 's';
      container.appendChild(p);
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .glow { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; animation: pulse-glow 5s ease-in-out infinite; }
        .glow-1 { width: 500px; height: 500px; top: -120px; right: -80px; background: radial-gradient(circle, var(--color-glow) 0%, transparent 70%); }
        .glow-2 { width: 400px; height: 400px; bottom: -100px; left: -100px; background: radial-gradient(circle, rgba(117,251,198,.08) 0%, transparent 70%); }
        .glow-3 { width: 300px; height: 300px; top: 50%; left: 50%; transform: translate(-50%,-50%); background: radial-gradient(circle, rgba(117,251,198,.06) 0%, transparent 70%); animation-delay: 1.5s; }
        .particles { position: fixed; inset: 0; pointer-events: none; z-index: 1; overflow: hidden; }
        .particle { position: absolute; width: 6px; height: 6px; border-radius: 50%; opacity: 0; animation: float-up 3s ease-out forwards; }
        @keyframes float-up { 0% { opacity:0; transform:translateY(100vh) scale(0);} 15% { opacity:1;} 85% { opacity:.6;} 100% { opacity:0; transform:translateY(-20vh) scale(1);}}
        .thankyou-card { position: relative; z-index: 2; text-align: center; max-width: 620px; padding: 48px 40px; animation: card-enter .8s cubic-bezier(.16,1,.3,1) both; }
        @keyframes card-enter { from { opacity:0; transform:translateY(30px) scale(.97);} to { opacity:1; transform:translateY(0) scale(1);}}
        .thankyou-logo { height: 48px; width: auto; margin: 0 auto 48px; display: block; }
        .check-circle { width: 80px; height: 80px; margin: 0 auto 32px; border-radius: 50%; background: var(--color-accent); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 40px rgba(117,251,198,.35); animation: pop-in .5s .3s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes pop-in { from { opacity:0; transform:scale(0);} to { opacity:1; transform:scale(1);}}
        .check-circle svg polyline { stroke-dasharray: 50; stroke-dashoffset: 50; animation: draw-check .5s .6s ease forwards; }
        @keyframes draw-check { to { stroke-dashoffset: 0; }}
        .thankyou-headline { font-size: 2.5rem; font-weight: 800; line-height: 1.15; color: var(--color-text-primary); margin-bottom: 20px; letter-spacing: -.5px; animation: fade-up-ty .6s .5s ease both; }
        .thankyou-headline .accent { color: var(--color-accent); }
        .thankyou-reminder { font-size: 1.125rem; color: var(--color-text-secondary); line-height: 1.7; max-width: 480px; margin: 0 auto 40px; animation: fade-up-ty .6s .7s ease both; }
        @keyframes fade-up-ty { from { opacity:0; transform:translateY(16px);} to { opacity:1; transform:translateY(0);}}
        .btn-access { display: inline-flex; align-items: center; gap: 10px; background: var(--color-cta); color: var(--color-cta-text); padding: 16px 40px; border-radius: var(--radius-full); font-size: 1.1rem; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: .5px; transition: all 200ms ease; box-shadow: var(--shadow-glow); animation: fade-up-ty .6s .9s ease both; }
        .btn-access:hover { background: var(--color-accent-hover); transform: translateY(-3px); box-shadow: 0 0 50px rgba(117,251,198,.35); }
        @media (max-width: 640px) { .thankyou-card { padding: 32px 24px;} .thankyou-logo { height: 36px; margin-bottom: 36px;} .check-circle { width: 64px; height: 64px; margin-bottom: 24px;} .thankyou-headline { font-size: 1.75rem;} .thankyou-reminder { font-size: 1rem;} .btn-access { padding: 14px 32px; font-size: 1rem;}}
      `}</style>

      <div className="glow glow-1" />
      <div className="glow glow-2" />
      <div className="glow glow-3" />
      <div className="particles" ref={particlesRef} />

      <div className="thankyou-card">
        <img src={logo_url} alt="Logo" className="thankyou-logo" />
        <div className="check-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="40" height="40" style={{ color: 'var(--color-bg-primary)' }}>
            <polyline points="4 12 9 17 20 6" />
          </svg>
        </div>
        <h1 className="thankyou-headline">Alô, parabéns!<br />Sua compra foi <span className="accent">confirmada</span>.</h1>
        <p className="thankyou-reminder">
          Por favor, clique no botão abaixo e crie sua conta com o <strong style={{ color: '#FFFFFF' }}>mesmo e-mail usado na compra</strong>.
        </p>
        <a href="https://app.alanis.digital/#/cadastro" className="btn-access">
          Acessar Área de Membros
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
