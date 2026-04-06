import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ScrollFadeIn from './ui/ScrollFadeIn';
import EditableText from './ui/EditableText';
import { useEdit } from '../context/EditContext';
import { trackFAQ } from '../hooks/useGA4';

const defaultFaqs = [
  { q: 'O que é a Alanis?', a: 'A Alanis é uma plataforma de educação profissional com monetização nativa. Diferente de áreas de membros genéricas, a Alanis foi construída para entregar resultado real para o aluno e receita diversificada para o criador, com trilhas de carreira, analytics avançados, sistema viral de indicação e 6 fontes de receita integradas.' },
  { q: 'Como a Alanis é diferente da The Members, Cademí, Kiwify, Hotmart e outras?', a: 'Essas plataformas são áreas de membros genéricas com uma única fonte de receita (taxa sobre vendas). A Alanis oferece 6 fontes de receita, sistema viral de indicação, commerce dentro da aula, anúncios nativos, trilhas de carreira estruturadas e um analytics preditivo que identifica o momento exato de evasão, aplicando automaticamente uma intervenção 15 segundos antes da saída para garantir uma retenção impossível de alcançar em qualquer outra plataforma no Brasil.' },
  { q: 'Quanto custa?', a: 'O investimento é simbólico porque nossa tecnologia é sustentada por uma comunidade de milhares de empresas e infoprodutores. Ao rodar o sistema em sua própria VPS, eliminamos custos intermediários de infraestrutura, permitindo que você acesse uma ferramenta de elite por uma fração do valor de mercado.' },
  { q: 'Posso migrar minha plataforma atual para a Alanis?', a: 'Pode e deve! A sua área de membros é sua e o processo de migração é super simples.' },
  { q: 'Como funciona o sistema de indicação/referral?', a: 'O aluno indica amigos usando um link exclusivo. Quando os indicados se cadastram, o aluno que indicou desbloqueia cursos VIP exclusivos. Isso cria um ciclo viral: cada aluno traz novos alunos, que trazem mais alunos, sem custo de aquisição para você.' },
  { q: 'Como funcionam os anúncios dentro das aulas?', a: 'Marcas e empresas pagam para exibir anúncios em vídeo antes das suas aulas, similar ao modelo do YouTube. Você gerencia tudo pelo painel admin, com métricas de impressões e cliques em tempo real. Alunos podem pagar para não verem anúncios, assim como na Netflix e nos maiores jogos do mundo.' },
  { q: 'A Alanis funciona em celular?', a: 'Sim. A Alanis é uma PWA (Progressive Web App) que seus alunos podem instalar no celular como se fosse um app nativo, com seu ícone e sua marca. Funciona em qualquer dispositivo: desktop, tablet e smartphone.' },
  { q: 'Quanto tempo leva para configurar tudo?', a: 'Depende do volume de conteúdo, mas a maioria dos criadores tem a plataforma operacional em 1 ou 2 dias no máximo.' },
  { q: 'Posso ter minha própria marca na plataforma?', a: '100%. A Alanis é white label: sua marca, seu domínio, suas cores, seu logo. Seus alunos nunca veem a marca Alanis. Tudo é 100% personalizado para a sua identidade.' },
];

interface FaqSectionProps {
  onOpenModal: () => void;
  dynamicContent?: Record<string, any>;
}

export default function FaqSection({ onOpenModal, dynamicContent: dc }: FaqSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const edit = useEdit();
  const e = edit?.isEditing;
  const src = e ? edit.content : dc;

  const faqTitle = src?.faq_title || 'Perguntas Frequentes';
  const faqBtnText = src?.faq_btn || 'QUERO FATURAR MAIS →';

  // Build FAQ items from dynamic content or defaults
  const faqs = defaultFaqs.map((def, i) => ({
    q: src?.[`faq_${i}_q`] || def.q,
    a: src?.[`faq_${i}_a`] || def.a,
  }));

  const toggle = (i: number) => {
    const isOpening = activeIndex !== i;
    setActiveIndex(isOpening ? i : null);
    trackFAQ(faqs[i].q, isOpening ? 'open' : 'close');
  };

  return (
    <section id="section-faq">
      <div className="container">
        <ScrollFadeIn>
          <div className="section-header">
            <h2>
              {e ? (
                <EditableText fieldKey="faq_title" label="Título do FAQ">{faqTitle}</EditableText>
              ) : faqTitle}
            </h2>
          </div>
        </ScrollFadeIn>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <ScrollFadeIn key={i}>
              <div className={`faq-item${activeIndex === i ? ' active' : ''}`}>
                <div className="faq-question" onClick={() => toggle(i)}>
                  <span>
                    {e ? (
                      <EditableText fieldKey={`faq_${i}_q`} label={`Pergunta ${i + 1}`}>{faq.q}</EditableText>
                    ) : faq.q}
                  </span>
                  <ChevronDown className="faq-chevron" size={20} />
                </div>
                <div className="faq-answer">
                  <div className="faq-answer-inner">
                    {e ? (
                      <EditableText fieldKey={`faq_${i}_a`} label={`Resposta ${i + 1}`}>{faq.a}</EditableText>
                    ) : faq.a}
                  </div>
                </div>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
        <ScrollFadeIn>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <a href="#" className="btn-primary" onClick={(ev) => { ev.preventDefault(); onOpenModal(); }}>
              {e ? (
                <EditableText fieldKey="faq_btn" label="Botão do FAQ">{faqBtnText}</EditableText>
              ) : faqBtnText}
            </a>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
