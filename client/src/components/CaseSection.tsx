import ScrollFadeIn from './ui/ScrollFadeIn';
import EditableImage from './ui/EditableImage';
import { useEdit } from '../context/EditContext';

interface CaseSectionProps {
  onOpenModal: () => void;
  dynamicContent?: Record<string, any>;
}

export default function CaseSection({ onOpenModal, dynamicContent: dc }: CaseSectionProps) {
  const edit = useEdit();
  const e = edit?.isEditing;
  const caseImage = (e ? edit.content.case_image : dc?.case_image) || '/images/ozi-site.webp';

  const imgEl = (
    <img src={caseImage} alt="OZI Audiovisual" loading="lazy" decoding="async" style={{ width: '100%', borderRadius: 'var(--radius-medium)' }} />
  );

  return (
    <section id="section-case">
      <div className="container">
        <div className="case-grid">
          <ScrollFadeIn>
            <div className="case-text">
              <h2>
                A <img src="/images/ozi.webp" alt="OZI Audiovisual" style={{ height: '0.75em', verticalAlign: '-1px', display: 'inline' }} />{' '}
                já escolheu a <img src="/images/logo.webp" alt="Alanis" style={{ height: '1em', verticalAlign: '-6px', display: 'inline' }} />.
                <br /><span className="accent">E você?</span>
              </h2>
              <p>
                A OZI Audiovisual, referência em educação audiovisual no Brasil, migrou para a Alanis e descobriu um novo
                nível de engajamento e receita. Quando os melhores escolhem, o caminho fica claro.
              </p>
              <a href="#" onClick={(ev) => { ev.preventDefault(); onOpenModal(); }} className="btn-primary">
                Quero Faturar Mais →
              </a>
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn direction="left">
            <div className="case-image">
              {e ? (
                <EditableImage fieldKey="case_image">{imgEl}</EditableImage>
              ) : imgEl}
            </div>
          </ScrollFadeIn>
        </div>
      </div>
    </section>
  );
}
