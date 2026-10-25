import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { en, type Dict } from './en';
import { vi } from './vi';

export type Lang = 'en' | 'vi';
const dicts: Record<Lang, Dict> = { en, vi };

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}

const LangContext = createContext<LangState | null>(null);

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('fdd-lang');
    if (saved === 'en' || saved === 'vi') return saved;
  } catch {
    /* storage unavailable */
  }
  return navigator.language.toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('fdd-lang', lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang]);
  return <LangContext.Provider value={{ lang, setLang, t: dicts[lang] }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
