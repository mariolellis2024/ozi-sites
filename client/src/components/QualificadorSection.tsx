import ScrollFadeIn from './ui/ScrollFadeIn';

interface QualificadorProps {
  onOpenModal: () => void;
}

export default function QualificadorSection({ onOpenModal }: QualificadorProps) {
  return (
    <section id="section-qualificador">
      <div className="container">
        <ScrollFadeIn>
          <div className="qualificador-card">
            <h2>Fatura mais de R$ 10k/mês com conteúdo digital?</h2>
            <p>
              A <img src="/images/logo.webp" alt="Alanis" style={{ display: 'inline', height: 18, verticalAlign: '-2px', filter: 'brightness(0)', margin: '0 2px' }} /> é
              para quem leva educação digital a sério. Se você já fatura e quer multiplicar seus resultados com
              uma plataforma que trabalha por você, vamos conversar.
            </p>
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenModal(); }} className="btn-dark">
              Quero Minha Plataforma Própria
            </a>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
