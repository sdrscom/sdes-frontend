import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { translations } from "./src/locales/translations";
import { applyCachedSiteContent } from "./src/cms/siteContent";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translations.en },
    ar: { translation: translations.ar },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  // Re-render t() users when CMS content replaces a resource bundle.
  react: { bindI18nStore: "added removed" },
});

applyCachedSiteContent();

export default i18n;
