import { Link } from "react-router-dom";
import HeroSlider from "../components/home/HeroSlider";
import { useLanguage } from "../i18n/useLanguage";
import { useMenuSections } from "../menu/useMenuSections";
import { pickLang } from "../utils/localize";
import logo from "../assets/logo.jpg";

const cardBars = ["bg-orange", "bg-leaf", "bg-navy", "bg-gold"];

export default function Home() {
  const { t, lang } = useLanguage();
  const { sections } = useMenuSections();

  return (
    <>
      <HeroSlider />

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <h1 className="text-5xl font-extrabold leading-tight sm:text-6xl">
            {t("home.title1")} <br />
            <span className="text-orange">{t("home.title2")}</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-navy-dark/75">{t("home.welcome")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/reservations/book-a-table" className="rounded-full bg-orange px-7 py-3 font-bold text-white hover:bg-orange-dark">
              {t("home.book")}
            </Link>
            <Link to="/reservations/order-online" className="rounded-full bg-leaf px-7 py-3 font-bold text-white hover:bg-leaf-dark">
              {t("home.order")}
            </Link>
            <Link to="/menu" className="rounded-full border-2 border-navy px-7 py-3 font-bold text-navy hover:bg-navy hover:text-white">
              {t("home.seeMenu")}
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md">
          <img src={logo} alt={`Food Club — ${t("tagline")}`} className="w-full rounded-full" />
        </div>
      </section>

      {sections.length > 0 && (
        <section className="bg-tint py-14">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-3xl font-extrabold">{t("home.exploreMenus")}</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {sections.map((section, index) => (
                <Link key={section.id} to={`/menu/${section.slug}`} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gold/40 hover:ring-2 hover:ring-orange">
                  <div className={`h-3 ${cardBars[index % cardBars.length]}`} />
                  <div className="p-6">
                    <h3 className="text-xl font-bold">{pickLang(section.name, lang)}</h3>
                    {pickLang(section.description, lang) && (
                      <p className="mt-2 text-sm text-navy-dark/70">{pickLang(section.description, lang)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="rounded-3xl bg-navy p-8 text-white sm:p-10">
          <h2 className="text-3xl font-extrabold !text-white">{t("home.events.title")}</h2>
          <p className="mt-3 max-w-2xl text-white/80">{t("home.events.text")}</p>
          <Link to="/reservations/private-events" className="mt-6 inline-block rounded-full bg-orange px-6 py-3 font-bold text-white hover:bg-orange-dark">
            {t("home.events.cta")}
          </Link>
        </div>
      </section>

      <section className="border-t-4 border-gold bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">{t("home.hoursTitle")}</h2>
            <p className="text-navy-dark/70">{t("hours.weekdays")}: {t("hours.weekdaysTime")}</p>
          </div>
          <Link to="/contact" className="rounded-full border-2 border-navy px-6 py-3 text-center font-bold text-navy hover:bg-navy hover:text-white">
            {t("home.contactCta")}
          </Link>
        </div>
      </section>
    </>
  );
}
