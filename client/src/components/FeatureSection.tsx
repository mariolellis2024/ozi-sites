import { Check } from 'lucide-react';
import ScrollFadeIn from './ui/ScrollFadeIn';
import EditableText from './ui/EditableText';
import EditableImage from './ui/EditableImage';
import { useEdit } from '../context/EditContext';

interface FeatureSectionProps {
  id: string;
  reverse?: boolean;
  image: string;
  imageAlt: string;
  title: React.ReactNode;
  items: string[];
}

export default function FeatureSection({ id, reverse = false, image, imageAlt, title, items }: FeatureSectionProps) {
  const edit = useEdit();
  const e = edit?.isEditing;

  // In edit mode, use dynamic content from context (with fallback to props)
  const sectionKey = id.replace('section-', '');
  const dynTitle = e ? edit.content[`${sectionKey}_title`] : undefined;
  const dynImage = e ? edit.content[`${sectionKey}_image`] : undefined;
  const dynItems = e ? edit.content[`${sectionKey}_items`] : undefined;

  const resolvedImage = dynImage || image;
  const resolvedItems: string[] = dynItems ? (typeof dynItems === 'string' ? JSON.parse(dynItems) : dynItems) : items;

  const imgEl = (
    <img src={resolvedImage} alt={imageAlt} loading="lazy" decoding="async" style={{ width: '100%', borderRadius: 'var(--radius-medium)' }} />
  );

  const titleEl = dynTitle ? (
    <h2 dangerouslySetInnerHTML={{ __html: dynTitle }} />
  ) : (
    <h2>{title}</h2>
  );

  return (
    <section id={id} className="feature-section">
      <div className="container">
        <div className={`feature-grid${reverse ? ' reverse' : ''}`}>
          <div className="feature-image">
            {e ? (
              <EditableImage fieldKey={`${sectionKey}_image`}>
                {imgEl}
              </EditableImage>
            ) : imgEl}
          </div>
          <ScrollFadeIn>
            <div className="feature-text">
              {e ? (
                <EditableText fieldKey={`${sectionKey}_title`} label={`Título: ${sectionKey}`} html>
                  {titleEl}
                </EditableText>
              ) : titleEl}
              <ul className="checklist stagger-children">
                {resolvedItems.map((item, i) => (
                  <li key={i} className="check-item">
                    <Check size={20} />
                    {e ? (
                      <EditableText fieldKey={`${sectionKey}_item_${i}`} label={`Item ${i + 1}: ${sectionKey}`}>
                        <span>{item}</span>
                      </EditableText>
                    ) : (
                      <span>{item}</span>
                    )}
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
