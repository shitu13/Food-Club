// Picks the Bangla text when the site is in Bangla and a translation exists, otherwise English.
export const pickLang = (value, lang) => (lang === "bn" && value?.bn) || value?.en || "";
