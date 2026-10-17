import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";

export default function PagePlaceholder({ titleKey }) {
    const { t } = useLanguage();

    return (
        <section className="mx-auto max-w-3xl px-4 py-24 text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl">{t(titleKey)}</h1>
            <p className="mt-4 text-lg text-navy-dark/70">{t("placeholder.text")}</p>
            <Link
                to="/"
                className="mt-8 inline-block rounded-full bg-orange px-6 py-3 font-bold text-white hover:bg-orange-dark"
            >
                {t("placeholder.back")}
            </Link>
        </section>
    );
}