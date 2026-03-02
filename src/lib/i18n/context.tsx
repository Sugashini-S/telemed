"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { translations, type Language, type TranslationKey } from "./translations";

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    const t = useCallback(
        (key: TranslationKey): string => {
            return translations[language][key] || key;
        },
        [language]
    );

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useTranslation must be used within an I18nProvider");
    }
    return context;
}
