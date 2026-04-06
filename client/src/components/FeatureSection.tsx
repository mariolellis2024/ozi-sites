import { Check, Trash2, Copy, Plus } from 'lucide-react';
import ScrollFadeIn from './ui/ScrollFadeIn';
import EditableText from './ui/EditableText';
import EditableImage from './ui/EditableImage';
import { useEdit } from '../context/EditContext';

const actionBtnBase: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  opacity: 0.6, transition: 'opacity 150ms',
};

interface FeatureSectionProps {
  id: string;
  reverse?: boolean;
  image: string;
  imageAlt: string;
  title: React.ReactNode;
  items: string[];
  dynamicContent?: Record<string, any>;
}

export default function FeatureSection({ id, reverse = false, image, imageAlt, title, items: defaultItems, dynamicContent: dc }: FeatureSectionProps) {
  const edit = useEdit();
  const e = edit?.isEditing;

  const sectionKey = id.replace('section-', '');
  const src = e ? edit.content : dc;
  const dynTitle = src?.[`${sectionKey}_title`];
  const dynImage = src?.[`${sectionKey}_image`];
  const resolvedImage = dynImage || image;

  // Items: saved as JSON array, or migrate from individual keys, or fall back to defaults
  const itemsKey = `${sectionKey}_items`;
  let resolvedItems: string[];

  const savedArray = src?.[itemsKey];
  if (savedArray && Array.isArray(savedArray)) {
    resolvedItems = savedArray;
  } else {
    resolvedItems = defaultItems.map((def, i) => {
      const saved = src?.[`${sectionKey}_item_${i}`];
      return saved || def;
    });
  }

  const saveItems = (newItems: string[]) => {
    if (edit) edit.updateField(itemsKey, newItems);
  };

  const deleteItem = (index: number) => {
    saveItems(resolvedItems.filter((_, i) => i !== index));
  };

  const duplicateItem = (index: number) => {
    const newItems = [...resolvedItems];
    newItems.splice(index + 1, 0, resolvedItems[index]);
    saveItems(newItems);
  };

  const addItem = () => {
    saveItems([...resolvedItems, 'Novo item — clique para editar']);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...resolvedItems];
    newItems[index] = value;
    saveItems(newItems);
  };

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
                  <li key={i} className="check-item" style={{ position: 'relative' }}>
                    <Check size={20} />
                    {e ? (
                      <>
                        <EditableText
                          fieldKey={`__inline_${sectionKey}_${i}`}
                          label={`Item ${i + 1}: ${sectionKey}`}
                          onCustomSave={(val) => updateItem(i, val)}
                          customValue={item}
                        >
                          <span>{item}</span>
                        </EditableText>
                        <div style={{
                          position: 'absolute', right: -16, top: '50%', transform: 'translateY(-50%)',
                          display: 'flex', flexDirection: 'column', gap: 4,
                        }}>
                          <button
                            onClick={(ev) => { ev.stopPropagation(); duplicateItem(i); }}
                            title="Duplicar item"
                            style={{ ...actionBtnBase, background: 'rgba(117,251,198,0.12)', color: '#75fbc6' }}
                            onMouseEnter={ev => { ev.currentTarget.style.opacity = '1'; }}
                            onMouseLeave={ev => { ev.currentTarget.style.opacity = '0.6'; }}
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            onClick={(ev) => { ev.stopPropagation(); deleteItem(i); }}
                            title="Remover item"
                            style={{ ...actionBtnBase, background: 'rgba(255,107,107,0.15)', color: '#ff6b6b' }}
                            onMouseEnter={ev => { ev.currentTarget.style.opacity = '1'; }}
                            onMouseLeave={ev => { ev.currentTarget.style.opacity = '0.6'; }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <span>{item}</span>
                    )}
                  </li>
                ))}
              </ul>
              {e && (
                <button
                  onClick={addItem}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginTop: 12, padding: '8px 16px', borderRadius: 8,
                    border: '1px dashed rgba(117,251,198,0.3)', cursor: 'pointer',
                    background: 'rgba(117,251,198,0.06)', color: '#75fbc6',
                    fontSize: '0.85rem', fontWeight: 500, fontFamily: 'Inter, sans-serif',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(117,251,198,0.12)'; }}
                  onMouseLeave={ev => { ev.currentTarget.style.background = 'rgba(117,251,198,0.06)'; }}
                >
                  <Plus size={16} /> Adicionar item
                </button>
              )}
            </div>
          </ScrollFadeIn>
        </div>
      </div>
    </section>
  );
}
