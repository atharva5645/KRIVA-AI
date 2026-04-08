import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
    const { language, setLanguage, SUPPORTED_LANGUAGES } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    const current = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

    useEffect(() => {
        const handleOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-sm font-bold text-zinc-700 transition-all shadow-sm tracking-wide"
                aria-label="Select language"
            >
                <Globe className="w-4 h-4 text-zinc-500" />
                <span className="hidden sm:inline tracking-wide">{current.native}</span>
                <svg className={`w-3 h-3 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </button>

            <div className={`absolute right-0 mt-3 w-48 origin-top-right rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-all duration-200 z-50 ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setIsOpen(false); }}
                        className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-bold transition-colors first:rounded-t-2xl last:rounded-b-2xl tracking-wide ${language === lang.code ? 'bg-emerald-50 text-emerald-700' : 'text-zinc-700 hover:bg-zinc-50'}`}
                    >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="flex-1 text-left tracking-wide">{lang.native}</span>
                        {language === lang.code && (
                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSwitcher;
