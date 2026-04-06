import { useState } from 'react';
import { trackPaymentSelect, trackLead } from '../hooks/useGA4';
import { trackMetaEvent } from '../hooks/useMetaPixel';
import { trackServerEvent, getCheckoutUrl } from '../hooks/useServerTracking';

interface DynamicIndex {
  pix_link: string;
  pix_price: string;
  pix_detail: string;
  card_link: string;
  card_price: string;
  card_detail: string;
  [key: string]: string;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  dynamicContent?: DynamicIndex;
  pageId?: number;
}

export default function PurchaseModal({ isOpen, onClose, dynamicContent: dc, pageId }: PurchaseModalProps) {
  const [redirecting, setRedirecting] = useState<'pix' | 'card' | null>(null);

  if (!isOpen) return null;

  const pixLink = dc?.pix_link || 'https://pay.cakto.com.br/eenyazw';
  const pixPrice = dc?.pix_price || 'R$ 297,00';
  const pixDetail = dc?.pix_detail || 'pagamento único — sua pra sempre';
  const cardLink = dc?.card_link || 'https://pay.cakto.com.br/33wcy9w_791231';
  const cardPrice = dc?.card_price || '12x R$ 57,78';
  const cardDetail = dc?.card_detail || 'no cartão';

  // Enrich checkout links with SCK + UTMs
  const enrichedPixLink = getCheckoutUrl(pixLink);
  const enrichedCardLink = getCheckoutUrl(cardLink);

  /** Extract numeric value from price string like "R$ 297,00" or "12x R$ 57,78" */
  const parsePrice = (s: string): number => {
    // Take the last number pattern (handles "12x R$ 57,78" → 57.78)
    const matches = s.match(/[\d.,]+/g);
    if (!matches) return 0;
    const last = matches[matches.length - 1];
    // Brazilian format: 1.234,56 → 1234.56
    return parseFloat(last.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const handlePixClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (redirecting) return;
    setRedirecting('pix');
    trackPaymentSelect('pix');
    trackLead('pix_click');
    trackMetaEvent('InitiateCheckout', { content_name: 'pix', value: parsePrice(pixPrice), currency: 'BRL' });
    trackServerEvent('pix_click', pageId);
    setTimeout(() => { window.location.href = enrichedPixLink; }, 350);
  };

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (redirecting) return;
    setRedirecting('card');
    trackPaymentSelect('card');
    trackLead('card_click');
    trackMetaEvent('InitiateCheckout', { content_name: 'card', value: parsePrice(cardPrice), currency: 'BRL' });
    trackServerEvent('card_click', pageId);
    setTimeout(() => { window.location.href = enrichedCardLink; }, 350);
  };

  return (
    <div className="purchase-modal active" aria-hidden="false">
      <div className="purchase-modal__backdrop" onClick={onClose} />
      <div className="purchase-modal__container">
        <button className="purchase-modal__close" aria-label="Fechar" onClick={onClose}>
          &times;
        </button>
        <div className="purchase-modal__header">
          <h3 className="purchase-modal__title">
            Garanta sua Alanis
          </h3>
          <p className="purchase-modal__subtitle">Escolha a melhor forma de pagamento</p>
        </div>
        <div className="purchase-modal__options">
          {/* PIX */}
          <a href={enrichedPixLink} className="purchase-modal__option purchase-modal__option--pix" onClick={handlePixClick} style={{ opacity: redirecting ? 0.6 : 1, pointerEvents: redirecting ? 'none' : 'auto', transition: 'opacity 150ms' }}>
            <div className="purchase-modal__badge">🔥 Melhor oferta</div>
            <div className="purchase-modal__icon-wrap">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13.17 2.32a2.74 2.74 0 0 0-2.34 0l-3.56 1.7a.5.5 0 0 0 0 .9l5.73 2.74 5.73-2.74a.5.5 0 0 0 0-.9l-3.56-1.7ZM19 8.27l-5.5 2.63v6.83a.5.5 0 0 0 .67.47L19 16.04a1 1 0 0 0 .5-.87V8.74a.5.5 0 0 0-.5-.47ZM5 8.27l5.5 2.63v6.83a.5.5 0 0 1-.67.47L5 16.04a1 1 0 0 1-.5-.87V8.74A.5.5 0 0 1 5 8.27Z" />
              </svg>
            </div>
            <span className="purchase-modal__method">Pix</span>
            <div className="purchase-modal__price">
              <span className="purchase-modal__amount">{pixPrice}</span>
              <span className="purchase-modal__detail">{pixDetail}</span>
            </div>
            <span className="purchase-modal__savings">Economize R$ 396,36</span>
            <span className="purchase-modal__cta-text">{redirecting === 'pix' ? '⏳ Redirecionando...' : 'Pagar com Pix →'}</span>
          </a>
          {/* Cartão */}
          <a href={enrichedCardLink} className="purchase-modal__option purchase-modal__option--card" onClick={handleCardClick} style={{ opacity: redirecting ? 0.6 : 1, pointerEvents: redirecting ? 'none' : 'auto', transition: 'opacity 150ms' }}>
            <div className="purchase-modal__icon-wrap">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <span className="purchase-modal__method">Cartão de Crédito</span>
            <div className="purchase-modal__price">
              <span className="purchase-modal__amount">{cardPrice}</span>
              <span className="purchase-modal__detail">{cardDetail}</span>
            </div>
            <span className="purchase-modal__cta-text">{redirecting === 'card' ? '⏳ Redirecionando...' : 'Pagar com Cartão →'}</span>
          </a>
        </div>
        <p className="purchase-modal__guarantee">🔒 Pagamento 100% seguro · Acesso imediato após confirmação</p>
      </div>
    </div>
  );
}
