import ScrollFadeIn from './ui/ScrollFadeIn';
import YouTubeFacade from './ui/YouTubeFacade';
import EditableImage from './ui/EditableImage';
import { useEdit } from '../context/EditContext';

const benefits = [
  { icon: 'icon-1.webp', title: '6 Fontes de Receita' },
  { icon: 'icon-2.webp', title: 'Engajamento por IA' },
  { icon: 'icon-3.webp', title: 'Trilhas de Carreira' },
  { icon: 'icon-4.webp', title: 'Sistema Viral de Indicação' },
  { icon: 'icon-5.webp', title: 'Commerce Dentro da Aula' },
];

interface BenefitsGridProps {
  dynamicContent?: Record<string, any>;
}

export default function BenefitsGrid({ dynamicContent: dc }: BenefitsGridProps) {
  const edit = useEdit();
  const e = edit?.isEditing;
  const motorImage = (e ? edit.content.motor_image : dc?.motor_image) || '/images/motor.webp';
  return (
    <section id="section-quick-benefits">
      <div className="container">
        <ScrollFadeIn>
          <h2 className="benefits-headline">
            O que só a <img src="/images/logo.webp" alt="Alanis" style={{ height: '1em', verticalAlign: '-3px', display: 'inline' }} /> tem.
          </h2>
        </ScrollFadeIn>
        <div className="benefits-grid stagger-children">
          {benefits.map((b) => (
            <ScrollFadeIn key={b.title}>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <img src={`/images/${b.icon}`} alt={b.title} width={48} height={48} loading="lazy" decoding="async" />
                </div>
                <h3>{b.title}</h3>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
        <ScrollFadeIn>
          {e ? (
            <EditableImage fieldKey="motor_image">
              <img src={motorImage} alt="Motor de Vendas da Alanis" className="motor-img" loading="lazy" decoding="async" width={900} />
            </EditableImage>
          ) : (
            <img src={motorImage} alt="Motor de Vendas da Alanis" className="motor-img" loading="lazy" decoding="async" width={900} />
          )}
        </ScrollFadeIn>
        <ScrollFadeIn>
          <div className="vsl-wrapper">
            <YouTubeFacade videoId="3t8-rLdcssE" title="Alanis – Apresentação" />
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
