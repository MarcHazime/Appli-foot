import { createContext, useState, useContext, ReactNode } from 'react';
import { translations } from '../constants/translations';

interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => void;
    t: any;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<string>('fr'); // Default to French as requested

    const t = translations[language as keyof typeof translations];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
