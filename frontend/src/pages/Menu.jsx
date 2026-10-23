import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/useLanguage";
import { useMenuSections } from "../menu/useMenuSections";
import { pickLang } from "../utils/localize";

const cardBars = ["bg-orange", "bg-leaf", "bg-navy", "bg-gold"];

export default function Menu() {
  const { t, lang } = useLanguage();
  const { sections, loading, error } = useMenuSections();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h1 className="text-4xl font-extrabold sm:text-5xl">{t("nav.menu")}</h1>
      <p className="mt-3 max-w-2xl text-lg text-navy-dark/75">{t("menu.intro")}</p>

      {loading && (
        <p role="status" className="mt-10 text-navy-dark/70">
          {t("menu.loading")}
        </p>
      )}
      {!loading && sections.length === 0 && (
        <p role={error ? "alert" : "status"} className="mt-10 rounded-2xl bg-tint px-5 py-6 text-navy-dark/80">
          {error ? t("menu.error") : t("menu.empty")}
        </p>
      )}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section, index) => (
          <Link key={section.id} to={`/menu/${section.slug}`} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gold/40 hover:ring-2 hover:ring-orange">
            <div className={`h-3 ${cardBars[index % cardBars.length]}`} />
            <div className="p-6">
              <h2 className="text-xl font-bold">{pickLang(section.name, lang)}</h2>
              {pickLang(section.description, lang) && (
                <p className="mt-2 text-sm text-navy-dark/70">{pickLang(section.description, lang)}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
