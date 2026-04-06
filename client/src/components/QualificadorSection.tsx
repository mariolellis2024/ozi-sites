import ScrollFadeIn from './ui/ScrollFadeIn';
import EditableText from './ui/EditableText';
import { useEdit } from '../context/EditContext';

interface QualificadorProps {
  onOpenModal: () => void;
  dynamicContent?: Record<string, any>;
}

export default function QualificadorSection({ onOpenModal, dynamicContent: dc }: QualificadorProps) {
  const edit = useEdit();
  const e = edit?.isEditing;
  const src = e ? edit.content : dc;

  const title = src?.qualificador_title || 'Fatura mais de R$ 10k/mês com conteúdo digital?';
  const text = src?.qualificador_text || 'A Alanis é para quem leva educação digital a sério. Se você já fatura e quer multiplicar seus resultados com uma plataforma que trabalha por você, vamos conversar.';
  const btnText = src?.qualificador_btn || 'Quero Minha Plataforma Própria';

  return (
    <section id="section-qualificador">
      <div className="container">
        <ScrollFadeIn>
          <div className="qualificador-card">
            <h2>
              {e ? (
                <EditableText fieldKey="qualificador_title" label="Título do Qualificador">{title}</EditableText>
              ) : title}
            </h2>
            <p>
              {e ? (
                <EditableText fieldKey="qualificador_text" label="Texto do Qualificador">{text}</EditableText>
              ) : text}
            </p>
            <a href="#" onClick={(ev) => { ev.preventDefault(); onOpenModal(); }} className="btn-dark">
              {e ? (
                <EditableText fieldKey="qualificador_btn" label="Botão do Qualificador">{btnText}</EditableText>
              ) : btnText}
            </a>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
