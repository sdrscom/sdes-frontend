import React, { createContext, useContext, useState, useEffect } from "react";
import i18n from "i18next";
import { loadSiteContent } from "../cms/siteContent";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  /** Bumps when CMS content arrives so consumers re-render with it. */
  contentVersion: number;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return saved === "ar" || saved === "en" ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;

    i18n.changeLanguage(language);
  }, [language]);

  const [contentVersion, setContentVersion] = useState(0);

  useEffect(() => {
    loadSiteContent().then((changed) => {
      if (changed) setContentVersion((v) => v + 1);
    });
  }, []);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === "en" ? "ar" : "en"));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, setLanguage, contentVersion }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
