import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../translations/en.json";
import hi from "../translations/hi.json";
import or from "../translations/or.json";
import ta from "../translations/ta.json";
import te from "../translations/te.json";
import gu from "../translations/gu.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",

    resources: {
      en: { translation: en },
      hi: { translation: hi },
      or: { translation: or },
      ta: { translation: ta },
      te: { translation: te },
      gu: { translation: gu },
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;