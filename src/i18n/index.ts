import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

export const LANGUAGES = {
  ar: { label: "العربية", dir: "rtl" as const },
  en: { label: "English", dir: "ltr" as const },
};

export type AppLanguage = keyof typeof LANGUAGES;

const stored = (localStorage.getItem("lang") as AppLanguage | null) ?? "ar";

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: stored,
  fallbackLng: "ar",
  interpolation: { escapeValue: false },
});

export function applyDirection(lang: AppLanguage) {
  const { dir } = LANGUAGES[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
}

applyDirection(stored);

i18n.on("languageChanged", (lng) => {
  const lang = (lng as AppLanguage) in LANGUAGES ? (lng as AppLanguage) : "ar";
  localStorage.setItem("lang", lang);
  applyDirection(lang);
});

export default i18n;
