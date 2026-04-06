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

  const persistContent = useCallback(async (newContent: Record<string, any>) => {
    const body: Record<string, any> = {};
    if (pageType === 'index') body.content_index = newContent;
    else body.content_obrigado = newContent;

    await fetch(`/api/pages/${pageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  }, [pageId, pageType, token]);

  const updateField = useCallback(async (key: string, value: any) => {
    let saved: Record<string, any> = {};
    setContent(prev => {
      saved = { ...prev, [key]: value };
      return saved;
    });
    // Wait for state to be set, then persist
    await persistContent(saved);
  }, [persistContent]);

  const batchUpdate = useCallback(async (fields: Record<string, string>) => {
    let saved: Record<string, any> = {};
    setContent(prev => {
      saved = { ...prev, ...fields };
      return saved;
    });
    await persistContent(saved);
  }, [persistContent]);

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

    let saved: Record<string, any> = {};
    setContent(prev => {
      saved = { ...prev, [key]: url };
      return saved;
    });
    await persistContent(saved);

    return url;
  }, [token, persistContent]);

  return (
    <EditContext.Provider value={{ isEditing: true, pageId, pageType, content, setContent, updateField, batchUpdate, uploadImage }}>
      {children}
    </EditContext.Provider>
  );
}
