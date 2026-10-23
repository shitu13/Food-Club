import { useCallback, useEffect, useMemo, useState } from "react";
import { LanguageContext } from "./context";
import en from "./en";
import bn from "./bn";

const dictionaries = { en, bn };
const STORAGE_KEY = "food-club-lang";

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return dictionaries[saved] ? saved : "en";
  } catch {
    return "en";
  }
}

export default function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      return;
    }
  }, [lang]);

  const t = useCallback(
    (key) => dictionaries[lang][key] ?? en[key] ?? key,
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}
