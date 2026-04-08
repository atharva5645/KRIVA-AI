import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext(null);

const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'mr', label: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
];

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(() => {
        return localStorage.getItem('kriva_lang') || 'en';
    });

    const setLanguage = useCallback((code) => {
        setLanguageState(code);
        localStorage.setItem('kriva_lang', code);
    }, []);

    const t = useCallback((key) => {
        const entry = translations[key];
        if (!entry) return key;
        return entry[language] || entry.en || key;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, SUPPORTED_LANGUAGES }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
    return ctx;
};

export { SUPPORTED_LANGUAGES };
