import ScrollFadeIn from './ui/ScrollFadeIn';
import EditableImage from './ui/EditableImage';
import EditableText from './ui/EditableText';
import { useEdit } from '../context/EditContext';

interface CaseSectionProps {
  onOpenModal: () => void;
  dynamicContent?: Record<string, any>;
}

export default function CaseSection({ onOpenModal, dynamicContent: dc }: CaseSectionProps) {
  const edit = useEdit();
  const e = edit?.isEditing;
  const src = e ? edit.content : dc;

  const caseImage = src?.case_image || '/images/ozi-site.webp';
  const caseTitle = src?.case_title || 'A <strong>OZI Audiovisual</strong> já escolheu a Alanis.<br/><span class="accent">E você?</span>';
  const caseText = src?.case_text || 'A OZI Audiovisual, referência em educação audiovisual no Brasil, migrou para a Alanis e descobriu um novo nível de engajamento e receita. Quando os melhores escolhem, o caminho fica claro.';
  const caseBtnText = src?.case_btn || 'Quero Faturar Mais →';

  const imgEl = (
    <img src={caseImage} alt="Case de Sucesso" loading="lazy" decoding="async" style={{ width: '100%', borderRadius: 'var(--radius-medium)' }} />
  );

  return (
    <section id="section-case">
      <div className="container">
        <div className="case-grid">
          <ScrollFadeIn>
            <div className="case-text">
              <h2>
                {e ? (
                  <EditableText fieldKey="case_title" label="Título do Case" html>
                    <span dangerouslySetInnerHTML={{ __html: caseTitle }} />
                  </EditableText>
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: caseTitle }} />
                )}
              </h2>
              <p>
                {e ? (
                  <EditableText fieldKey="case_text" label="Texto do Case">{caseText}</EditableText>
                ) : caseText}
              </p>
              <a href="#" onClick={(ev) => { ev.preventDefault(); onOpenModal(); }} className="btn-primary">
                {e ? (
                  <EditableText fieldKey="case_btn" label="Botão do Case">{caseBtnText}</EditableText>
                ) : caseBtnText}
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
