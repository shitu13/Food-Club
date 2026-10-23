import { useLanguage } from "../../i18n/useLanguage";

const options = [
  { code: "en", label: "EN" },
  { code: "bn", label: "বাংলা" },
];

export default function LanguageSwitcher({ className = "" }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className={`flex rounded-full border-2 border-gold p-0.5 text-sm font-bold ${className}`}
    >
      {options.map((option) => (
        <button
          key={option.code}
          type="button"
          lang={option.code}
          aria-pressed={lang === option.code}
          onClick={() => setLang(option.code)}
          className={`rounded-full px-3 py-1 transition-colors ${
            lang === option.code ? "bg-navy text-white" : "text-navy hover:bg-tint"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
