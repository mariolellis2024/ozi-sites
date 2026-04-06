import { trackPaymentSelect, trackLead } from '../hooks/useGA4';

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
}

export default function PurchaseModal({ isOpen, onClose, dynamicContent: dc }: PurchaseModalProps) {
  if (!isOpen) return null;

  const pixLink = dc?.pix_link || 'https://pay.cakto.com.br/eenyazw';
  const pixPrice = dc?.pix_price || 'R$ 297,00';
  const pixDetail = dc?.pix_detail || 'pagamento único — sua pra sempre';
  const cardLink = dc?.card_link || 'https://pay.cakto.com.br/33wcy9w_791231';
  const cardPrice = dc?.card_price || '12x R$ 57,78';
  const cardDetail = dc?.card_detail || 'no cartão';

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
          <a href={pixLink} className="purchase-modal__option purchase-modal__option--pix" onClick={() => { trackPaymentSelect('pix'); trackLead('pix_click'); }}>
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
            <span className="purchase-modal__cta-text">Pagar com Pix →</span>
          </a>
          {/* Cartão */}
          <a href={cardLink} className="purchase-modal__option purchase-modal__option--card" onClick={() => { trackPaymentSelect('card'); trackLead('card_click'); }}>
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
            <span className="purchase-modal__cta-text">Pagar com Cartão →</span>
          </a>
        </div>
        <p className="purchase-modal__guarantee">🔒 Pagamento 100% seguro · Acesso imediato após confirmação</p>
      </div>
    </div>
  );
}
