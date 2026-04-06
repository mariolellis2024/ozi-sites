import ScrollFadeIn from './ui/ScrollFadeIn';
import YouTubeFacade from './ui/YouTubeFacade';
import EditableImage from './ui/EditableImage';
import EditableText from './ui/EditableText';
import { useEdit } from '../context/EditContext';

const defaultBenefits = [
  { icon: '/images/icon-1.webp', title: '6 Fontes de Receita' },
  { icon: '/images/icon-2.webp', title: 'Engajamento por IA' },
  { icon: '/images/icon-3.webp', title: 'Trilhas de Carreira' },
  { icon: '/images/icon-4.webp', title: 'Sistema Viral de Indicação' },
  { icon: '/images/icon-5.webp', title: 'Commerce Dentro da Aula' },
];

interface BenefitsGridProps {
  dynamicContent?: Record<string, any>;
}

export default function BenefitsGrid({ dynamicContent: dc }: BenefitsGridProps) {
  const edit = useEdit();
  const e = edit?.isEditing;
  const src = e ? edit.content : dc;

  const benefitsTitle = src?.benefits_title || 'O que só a Alanis tem.';
  const motorImage = src?.motor_image || '/images/motor.webp';

  // Build benefits array from dynamic content or defaults
  const benefits = defaultBenefits.map((def, i) => {
    const idx = i + 1;
    return {
      icon: src?.[`benefit_${idx}_icon`] || def.icon,
      title: src?.[`benefit_${idx}_title`] || def.title,
      iconKey: `benefit_${idx}_icon`,
      titleKey: `benefit_${idx}_title`,
    };
  });

  return (
    <section id="section-quick-benefits">
      <div className="container">
        <ScrollFadeIn>
          <h2 className="benefits-headline">
            {e ? (
              <EditableText fieldKey="benefits_title" label="Título da seção">
                {benefitsTitle}
              </EditableText>
            ) : benefitsTitle}
          </h2>
        </ScrollFadeIn>
        <div className="benefits-grid stagger-children">
          {benefits.map((b, i) => (
            <ScrollFadeIn key={i}>
              <div className="benefit-card">
                <div className="benefit-icon">
                  {e ? (
                    <EditableImage fieldKey={b.iconKey}>
                      <img src={b.icon} alt={b.title} width={48} height={48} loading="lazy" decoding="async" />
                    </EditableImage>
                  ) : (
                    <img src={b.icon} alt={b.title} width={48} height={48} loading="lazy" decoding="async" />
                  )}
                </div>
                <h3>
                  {e ? (
                    <EditableText fieldKey={b.titleKey} label={`Benefício ${i + 1}`}>
                      {b.title}
                    </EditableText>
                  ) : b.title}
                </h3>
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
