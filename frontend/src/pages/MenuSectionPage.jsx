import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../i18n/useLanguage";
import { useMenuSections } from "../menu/useMenuSections";
import { listDishes } from "../services/dish.service";
import { formatPrice } from "../utils/format";
import { pickLang } from "../utils/localize";

function DishImage({ src }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="h-44 w-full object-cover" />;
}

// One menu item (for example "Dine-In") and the dishes listed under it.
export default function MenuSectionPage() {
  const { slug } = useParams();
  const { t, lang } = useLanguage();
  const { sections, loading: sectionsLoading } = useMenuSections();
  const section = sections.find((item) => item.slug === slug);
  const sectionId = section?.id;

  const [dishes, setDishes] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!sectionId) return undefined;
    let cancelled = false;
    setStatus("loading");

    // isAvailable=true keeps unavailable dishes off the public page, even when staff are logged in.
    listDishes({ section: sectionId, isAvailable: true, sort: "name", limit: 100 })
      .then((result) => {
        if (cancelled) return;
        setDishes(result.dishes);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [sectionId]);

  if (!section) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p role="status" className="text-lg text-navy-dark/75">
          {sectionsLoading ? t("menu.loading") : t("menu.notFound")}
        </p>
        {!sectionsLoading && (
          <Link to="/menu" className="mt-8 inline-block rounded-full bg-orange px-6 py-3 font-bold text-white hover:bg-orange-dark">
            {t("menu.back")}
          </Link>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <Link to="/menu" className="text-sm font-bold text-orange-dark hover:underline">
        ← {t("menu.back")}
      </Link>
      <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">{pickLang(section.name, lang)}</h1>
      {pickLang(section.description, lang) && (
        <p className="mt-3 max-w-2xl text-lg text-navy-dark/75">{pickLang(section.description, lang)}</p>
      )}

      {status === "loading" && (
        <p role="status" className="mt-10 text-navy-dark/70">
          {t("menu.loading")}
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="mt-10 rounded-2xl bg-tint px-5 py-6 text-navy-dark/80">
          {t("menu.error")}
        </p>
      )}
      {status === "ready" && dishes.length === 0 && (
        <p role="status" className="mt-10 rounded-2xl bg-tint px-5 py-6 text-navy-dark/80">
          {t("menu.dishesEmpty")}
        </p>
      )}

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {dishes.map((dish) => (
          <li key={dish.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gold/40">
            <DishImage key={`${dish.id}-${dish.image}`} src={dish.image} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold">{pickLang(dish.name, lang)}</h2>
                <p className="shrink-0 font-display text-lg font-extrabold text-orange-dark">{formatPrice(dish.price)}</p>
              </div>
              {pickLang(dish.description, lang) && (
                <p className="mt-2 text-sm text-navy-dark/70">{pickLang(dish.description, lang)}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
