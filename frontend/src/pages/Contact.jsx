import { hourRows, restaurant, toTel } from "../data/navigation";
import { useLanguage } from "../i18n/useLanguage";

const icons = {
    pin: <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
    phone: <path d="M5 4h4l2 5-2.5 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
    mail: <path d="M3 6h18v12H3zM3 7l9 6 9-6" />,
    clock: <path d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />,
};

function InfoBlock({ icon, color, title, children }) {
    return (
        <div className="flex gap-4">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white ${color}`}>
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {icons[icon]}
                </svg>
            </span>
            <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <div className="mt-1 space-y-1 text-navy-dark/80">{children}</div>
            </div>
        </div>
    );
}

export default function Contact() {
    const { lang, t } = useLanguage();
    const query = encodeURIComponent(restaurant.mapQuery);
    const mapSrc =
        restaurant.mapEmbedUrl ||
        `https://www.google.com/maps?q=${query}&hl=${lang}&z=16&output=embed`;
    const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

    return (
        <>
            <section className="bg-tint py-12">
                <div className="mx-auto max-w-7xl px-4">
                    <h1 className="text-4xl font-extrabold sm:text-5xl">{t("nav.contact")}</h1>
                    <p className="mt-3 max-w-2xl text-lg text-navy-dark/75">{t("contact.intro")}</p>
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-2">
                <div className="space-y-8">
                    <InfoBlock icon="pin" color="bg-orange" title={t("contact.addressTitle")}>
                        <p>{t("address")}</p>
                        <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block pt-1 font-bold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:text-orange-dark"
                        >
                            {t("contact.directions")}
                        </a>
                    </InfoBlock>

                    <InfoBlock icon="phone" color="bg-leaf" title={t("contact.phoneTitle")}>
                        {restaurant.phones.map((phone) => (
                            <p key={phone}>
                                <a href={toTel(phone)} className="font-semibold hover:text-orange-dark">{phone}</a>
                            </p>
                        ))}
                    </InfoBlock>

                    <InfoBlock icon="mail" color="bg-navy" title={t("contact.emailTitle")}>
                        <p>
                            <a href={`mailto:${restaurant.email}`} className="font-semibold hover:text-orange-dark">{restaurant.email}</a>
                        </p>
                    </InfoBlock>

                    <InfoBlock icon="clock" color="bg-gold" title={t("contact.hoursTitle")}>
                        <ul className="space-y-2">
                            {hourRows.map(([dayKey, timeKey]) => (
                                <li key={dayKey}>
                                    <span className="font-bold text-navy">{t(dayKey)}</span>
                                    <br />
                                    {t(timeKey)}
                                </li>
                            ))}
                        </ul>
                    </InfoBlock>
                </div>

                <div className="overflow-hidden rounded-3xl border-4 border-gold shadow-sm">
                    <iframe
                        title={t("contact.mapTitle")}
                        src={mapSrc}
                        className="h-96 w-full lg:h-full lg:min-h-[32rem]"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                    />
                </div>
            </section>
        </>
    );
}