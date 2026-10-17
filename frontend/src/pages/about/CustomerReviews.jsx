import { useState } from "react";
import { reviews } from "../../data/reviews";
import { useLanguage } from "../../i18n/useLanguage";

const inputClass =
    "mt-1 w-full rounded-xl border-2 border-navy/20 px-4 py-3 focus:border-orange focus:outline-none";

function Stars({ value }) {
    return (
        <span className="tracking-wider text-gold" role="img" aria-label={`${value} / 5`}>
            {"★".repeat(value)}
            <span className="text-navy/20">{"★".repeat(5 - value)}</span>
        </span>
    );
}

export default function CustomerReviews() {
    const { lang, t } = useLanguage();
    const [form, setForm] = useState({ name: "", comment: "" });
    const [rating, setRating] = useState(0);
    const [status, setStatus] = useState("");

    const average = reviews.length
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    const handleChange = (event) =>
        setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

    const handleSubmit = (event) => {
        event.preventDefault();
        setStatus(rating === 0 ? "needRating" : "sent");
    };

    return (
        <>
            <section className="bg-tint py-12">
                <div className="mx-auto max-w-7xl px-4">
                    <h1 className="text-4xl font-extrabold sm:text-5xl">{t("nav.reviews")}</h1>
                    <p className="mt-3 max-w-2xl text-lg text-navy-dark/75">{t("reviews.intro")}</p>
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[1fr_24rem]">
                <div>
                    {reviews.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed border-gold p-10 text-center">
                            <h2 className="text-2xl font-bold">{t("reviews.emptyTitle")}</h2>
                            <p className="mt-2 text-navy-dark/70">{t("reviews.emptyText")}</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-4">
                                <span className="font-display text-5xl font-extrabold text-navy">{average.toFixed(1)}</span>
                                <div>
                                    <Stars value={Math.round(average)} />
                                    <p className="text-sm text-navy-dark/70">
                                        {t("reviews.average")} · {reviews.length} {t("reviews.count")}
                                    </p>
                                </div>
                            </div>
                            <ul className="mt-8 space-y-5">
                                {reviews.map((review) => (
                                    <li key={review.id} className="rounded-3xl bg-white p-6 ring-1 ring-gold/40">
                                        <Stars value={review.rating} />
                                        <p className="mt-3 text-lg text-navy-dark/85">{review.text[lang] ?? review.text.en}</p>
                                        <p className="mt-3 text-sm font-bold text-navy">
                                            {review.name}
                                            <span className="font-normal text-navy-dark/60">
                                                {" · "}
                                                {new Date(review.date).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB")}
                                            </span>
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="h-fit space-y-5 rounded-3xl border-2 border-gold bg-white p-6">
                    <h2 className="text-2xl font-extrabold">{t("reviews.formTitle")}</h2>
                    <label className="block font-bold text-navy">
                        {t("reviews.name")}
                        <input name="name" value={form.name} onChange={handleChange} required autoComplete="name" className={inputClass} />
                    </label>
                    <div>
                        <span className="font-bold text-navy" id="rating-label">{t("reviews.rating")}</span>
                        <div role="radiogroup" aria-labelledby="rating-label" className="mt-1 flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    role="radio"
                                    aria-checked={rating === n}
                                    aria-label={`${n} / 5`}
                                    onClick={() => setRating(n)}
                                    className={`text-4xl leading-none ${n <= rating ? "text-gold" : "text-navy/20"}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <label className="block font-bold text-navy">
                        {t("reviews.comment")}
                        <textarea name="comment" value={form.comment} onChange={handleChange} required rows={4} className={inputClass} />
                    </label>
                    <button type="submit" className="w-full rounded-full bg-orange py-3 font-bold text-white hover:bg-orange-dark">
                        {t("reviews.submit")}
                    </button>
                    {status === "needRating" && <p role="alert" className="text-sm font-semibold text-orange-dark">{t("reviews.ratingRequired")}</p>}
                    {status === "sent" && <p role="status" className="text-sm font-semibold text-leaf-dark">{t("reviews.thanks")}</p>}
                </form>
            </section>
        </>
    );
}