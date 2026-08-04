import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "or", label: "ଓଡ଼ିଆ", flag: "🟣" },
  { code: "ta", label: "தமிழ்", flag: "🟤" },
  { code: "te", label: "తెలుగు", flag: "🔵" },
  { code: "gu", label: "ગુજરાતી", flag: "🟠" },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (e) => {
    const lang = e.target.value;

    i18n.changeLanguage(lang);

    localStorage.setItem("language", lang);
  };

  return (
    <select
      value={i18n.language}
      onChange={changeLanguage}
      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white cursor-pointer"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.label}
        </option>
      ))}
    </select>
  );
}