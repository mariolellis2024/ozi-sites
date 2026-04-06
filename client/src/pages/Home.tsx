import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import BenefitsGrid from '../components/BenefitsGrid';
import FeatureSection from '../components/FeatureSection';
import QualificadorSection from '../components/QualificadorSection';
import CaseSection from '../components/CaseSection';
import ComparisonSection from '../components/ComparisonSection';
import FaqSection from '../components/FaqSection';
import Footer from '../components/Footer';
import PurchaseModal from '../components/PurchaseModal';
import { trackModalOpen, trackModalClose } from '../hooks/useGA4';
import { useServerTracking, trackServerEvent } from '../hooks/useServerTracking';

interface DynamicContent {
  content_index: {
    hero_title: string;
    hero_subtitle: string;
    hero_image: string;
    cta_text: string;
    pix_link: string;
    pix_price: string;
    pix_detail: string;
    card_link: string;
    card_price: string;
    card_detail: string;
    [key: string]: string;
  };
  [key: string]: any;
}

interface HomeProps {
  dynamicContent?: DynamicContent;
  pageId?: number;
  slug?: string;
}

export default function Home({ dynamicContent, pageId, slug }: HomeProps) {
  const dc = dynamicContent?.content_index;
  const [modalOpen, setModalOpen] = useState(false);

  // Server-side tracking
  useServerTracking(pageId, slug);

  const openModal = useCallback(() => {
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
    trackModalOpen();
    trackServerEvent('comprar', pageId);
  }, [pageId]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    document.body.style.overflow = '';
    trackModalClose();
    trackServerEvent('page_view', pageId);
  }, [pageId]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) closeModal();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [modalOpen, closeModal]);

  // Smooth scroll with offset
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navH = document.querySelector('nav')?.offsetHeight || 80;
        const targetY = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top: targetY - 1, behavior: 'instant' as ScrollBehavior });
        requestAnimationFrame(() => {
          const finalY = target.getBoundingClientRect().top + window.scrollY - navH;
          window.scrollTo({ top: finalY, behavior: 'smooth' });
        });
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <>
      <Navbar onOpenModal={openModal} dynamicContent={dc} />

      <HeroSection onOpenModal={openModal} dynamicContent={dc} />

      <BenefitsGrid dynamicContent={dc} />

      <FeatureSection
        id="section-monetizacao"
        image={dc?.monetizacao_image || '/images/01-a.webp'}
        imageAlt="Diagrama Receitas"
        title={dc?.monetizacao_title ? <span dangerouslySetInnerHTML={{ __html: dc.monetizacao_title }} /> : <>Sua concorrência tem 1 forma de ganhar dinheiro. <span className="accent">Você vai ter 6</span>.</>}
        items={[
          'Cursos gratuitos → atraem a base sem custo',
          'VIP por indicação → crescimento orgânico e viral',
          'Cursos pagos → receita direta com checkout integrado',
          'Módulos pagos avulsos → monetize partes de um curso, não só o todo',
          'Anúncios de marcas → receita recorrente de anunciantes',
          'Trilhas pagas → bundles premium de conteúdo sequencial',
        ]}
      />

      <FeatureSection
        id="section-referral"
        reverse
        image={dc?.referral_image || '/images/02-a.webp'}
        imageAlt="Diagrama Viral Loop"
        title={dc?.referral_title ? <span dangerouslySetInnerHTML={{ __html: dc.referral_title }} /> : <>Cada aluno traz 5 novos. <span className="accent">Sem gastar um centavo em ads</span>.</>}
        items={[
          'Aluno indica amigos → desbloqueia cursos VIP exclusivos',
          'Crescimento exponencial sem custo de aquisição',
          'Dashboard de indicações com tracking em tempo real',
          'Gamificação inteligente que motiva mais indicações',
          'Cursos VIP invisíveis para não-indicados, exclusividade real',
          'Sistema anti-fraude que garante indicações genuínas',
        ]}
      />

      <FeatureSection
        id="section-commerce"
        image={dc?.commerce_image || '/images/03-a.webp'}
        imageAlt="Mockup Commerce"
        title={dc?.commerce_title ? <span dangerouslySetInnerHTML={{ __html: dc.commerce_title }} /> : <>A aula menciona um produto? <span className="accent">O botão de compra já aparece na hora, dentro do video</span>.</>}
        items={[
          'IA identifica cada produto mencionado na transcrição da aula',
          'Botões de compra automáticos: Amazon, Mercado Livre, links próprios',
          'O administrador escolhe quais produtos promover',
          'Scraping inteligente traz as melhores ofertas em tempo real',
          'Receita adicional sem nenhum esforço do criador',
          'Tracking de cliques e conversões por produto recomendado',
        ]}
      />

      <FeatureSection
        id="section-anuncios"
        reverse
        image={dc?.anuncios_image || '/images/04.webp'}
        imageAlt="Mockup Anúncios"
        title={dc?.anuncios_title ? <span dangerouslySetInnerHTML={{ __html: dc.anuncios_title }} /> : <><span className="accent">Ganhe dinheiro</span> até com alunos que nunca pagaram um centavo.</>}
        items={[
          'Anúncios em vídeo pré-aula: marcas pagam para exibir antes do seu conteúdo',
          'Banners e imagens patrocinadas dentro da plataforma',
          'Gestão completa de anunciantes e campanhas no painel admin',
          'Métricas de impressões e cliques em tempo real',
          'Alunos VIP podem ter anúncios removidos: benefício premium',
        ]}
      />

      <FeatureSection
        id="section-trilhas"
        image={dc?.trilhas_image || '/images/05-a.webp'}
        imageAlt="Mockup Trilhas"
        title={dc?.trilhas_title ? <span dangerouslySetInnerHTML={{ __html: dc.trilhas_title }} /> : <>Chega da <span style={{ color: '#ff0049' }}>confusão "Netflix"</span>. Aqui, <span className="accent">cada aluno sabe exatamente o próximo passo</span>.</>}
        items={[
          'Trilhas de carreira com sequência definida: o aluno nunca fica perdido',
          'Dashboard orientado à ação: o próximo passo é sempre óbvio',
          'Desafios diários com streak e freeze: engajamento que vicia',
          'Quiz com nota mínima de aprovação: garante que aprendeu de verdade',
          'Tarefas práticas com entrega de URL: o aluno age, não só assiste',
          'Cursos em vídeo, áudio e livros interativos: aprende onde quiser',
          'Progresso salvo com timestamp: nunca perde onde parou',
        ]}
      />

      <FeatureSection
        id="section-analytics"
        reverse
        image={dc?.analytics_image || '/images/06-a.webp'}
        imageAlt="Dashboard Analytics"
        title={dc?.analytics_title ? <span dangerouslySetInnerHTML={{ __html: dc.analytics_title }} /> : <>Analytics por aula. Crie intervenções antes dos pontos de saída e <span className="accent">mantenha seus alunos na aula</span>.</>}
        items={[
          'Veja exatamente onde cada aluno abandona a aula',
          'Insira quiz ou interação 15 segundos antes do ponto de desistência',
          'Identifique quais aulas precisam ser refeitas: com dados, não achismo',
          'Transcrição automática de todas as aulas via IA',
          'Hospedagem em 4K com proteção anti-pirataria',
          'Player dedicado para vídeo e áudio: sem depender de terceiros',
        ]}
      />

      <FeatureSection
        id="section-whitelabel"
        image={dc?.whitelabel_image || '/images/07.webp'}
        imageAlt="Mockup White Label"
        title={dc?.whitelabel_title ? <span dangerouslySetInnerHTML={{ __html: dc.whitelabel_title }} /> : <>Aqui, a plataforma é SUA. <span style={{ color: '#ff0049' }}>Não alugada</span>. <span className="accent">Sua</span>.</>}
        items={[
          '100% com sua marca, seu domínio, sua identidade',
          'PWA instalável: seus alunos terão um "app" com seu ícone',
          'Arquitetura clonável e exportável: white label real',
          'Infraestrutura isolada por cliente: segurança enterprise',
          'Você é dono. Não inquilino. Dono.',
        ]}
      />

      <QualificadorSection onOpenModal={openModal} dynamicContent={dc} />
      <CaseSection onOpenModal={openModal} dynamicContent={dc} />
      <ComparisonSection onOpenModal={openModal} dynamicContent={dc} />
      <FaqSection onOpenModal={openModal} dynamicContent={dc} />
      <Footer dynamicContent={dc} />
      <PurchaseModal isOpen={modalOpen} onClose={closeModal} dynamicContent={dc} pageId={pageId} />
    </>
  );
}
