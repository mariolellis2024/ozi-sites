import { Check } from 'lucide-react';
import ScrollFadeIn from './ui/ScrollFadeIn';

interface FeatureSectionProps {
  id: string;
  reverse?: boolean;
  image: string;
  imageAlt: string;
  title: React.ReactNode;
  items: string[];
}

export default function FeatureSection({ id, reverse = false, image, imageAlt, title, items }: FeatureSectionProps) {
  return (
    <section id={id} className="feature-section">
      <div className="container">
        <div className={`feature-grid${reverse ? ' reverse' : ''}`}>
          <div className="feature-image">
            <img src={image} alt={imageAlt} loading="lazy" decoding="async" style={{ width: '100%', borderRadius: 'var(--radius-medium)' }} />
          </div>
          <ScrollFadeIn>
            <div className="feature-text">
              <h2>{title}</h2>
              <ul className="checklist stagger-children">
                {items.map((item, i) => (
                  <li key={i} className="check-item">
                    <Check size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollFadeIn>
        </div>
      </div>
    </section>
  );
}
