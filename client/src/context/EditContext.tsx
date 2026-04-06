import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface EditContextType {
  isEditing: boolean;
  pageId: number;
  pageType: 'index' | 'obrigado';
  content: Record<string, any>;
  setContent: (c: Record<string, any>) => void;
  updateField: (key: string, value: any) => Promise<void>;
  batchUpdate: (fields: Record<string, string>) => Promise<void>;
  uploadImage: (key: string, file: File) => Promise<string>;
}

const EditContext = createContext<EditContextType | null>(null);

export function useEdit() {
  return useContext(EditContext);
}

interface EditProviderProps {
  children: ReactNode;
  pageId: number;
  pageType: 'index' | 'obrigado';
  initialContent: Record<string, any>;
}

export function EditProvider({ children, pageId, pageType, initialContent }: EditProviderProps) {
  const [content, setContent] = useState<Record<string, any>>(initialContent);
  const token = localStorage.getItem('admin_token');

  const updateField = useCallback(async (key: string, value: string) => {
    const newContent = { ...content, [key]: value };
    setContent(newContent);

    // Persist to DB
    const body: Record<string, any> = {};
    if (pageType === 'index') body.content_index = newContent;
    else body.content_obrigado = newContent;

    await fetch(`/api/pages/${pageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  }, [content, pageId, pageType, token]);

  const batchUpdate = useCallback(async (fields: Record<string, string>) => {
    const newContent = { ...content, ...fields };
    setContent(newContent);

    const body: Record<string, any> = {};
    if (pageType === 'index') body.content_index = newContent;
    else body.content_obrigado = newContent;

    await fetch(`/api/pages/${pageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  }, [content, pageId, pageType, token]);

  const uploadImage = useCallback(async (key: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) throw new Error('Upload failed');
    const { url } = await res.json();

    // Update content with new image URL
    const newContent = { ...content, [key]: url };
    setContent(newContent);

    const body: Record<string, any> = {};
    if (pageType === 'index') body.content_index = newContent;
    else body.content_obrigado = newContent;

    await fetch(`/api/pages/${pageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    return url;
  }, [content, pageId, pageType, token]);

  return (
    <EditContext.Provider value={{ isEditing: true, pageId, pageType, content, setContent, updateField, batchUpdate, uploadImage }}>
      {children}
    </EditContext.Provider>
  );
}
