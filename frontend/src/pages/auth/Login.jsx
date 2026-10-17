import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import logo from "../../assets/logo.jpg";

const inputClass =
    "mt-1 w-full rounded-xl border-2 border-navy/20 px-4 py-3 focus:border-orange focus:outline-none";

export default function Login() {
    const { t } = useLanguage();
    const [form, setForm] = useState({ email: "", password: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (event) =>
        setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitted(true);
    };

    return (
        <section className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
            <img src={logo} alt="" className="h-24 w-24 rounded-full" />
            <h1 className="mt-4 text-3xl font-extrabold">{t("login.title")}</h1>
            <p className="mt-1 text-navy-dark/70">{t("login.subtitle")}</p>

            <form onSubmit={handleSubmit} className="mt-8 w-full space-y-5 rounded-3xl border-2 border-gold bg-white p-6 shadow-sm">
                <label className="block font-bold text-navy">
                    {t("login.email")}
                    <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" className={inputClass} />
                </label>
                <label className="block font-bold text-navy">
                    {t("login.password")}
                    <input type="password" name="password" value={form.password} onChange={handleChange} required autoComplete="current-password" className={inputClass} />
                </label>
                <button type="submit" className="w-full rounded-full bg-orange py-3 font-bold text-white hover:bg-orange-dark">
                    {t("login.submit")}
                </button>
                {submitted && <p role="status" className="text-sm font-semibold text-leaf-dark">{t("login.notice")}</p>}
            </form>

            <Link to="/" className="mt-6 font-semibold text-navy hover:text-orange-dark">{t("login.back")}</Link>
        </section>
    );
}