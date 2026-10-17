import { Link } from "react-router-dom";
import { headChef, owners } from "../../data/team";
import { useLanguage } from "../../i18n/useLanguage";

const accents = ["bg-orange", "bg-leaf", "bg-navy", "bg-gold", "bg-orange-dark"];

function Avatar({ person, name, className }) {
    const initial = Array.from(name)[0];
    return person.photo ? (
        <img src={person.photo} alt={name} className={`rounded-full border-4 border-gold object-cover ${className}`} />
    ) : (
        <div
            role="img"
            aria-label={name}
            className={`flex items-center justify-center rounded-full border-4 border-gold bg-white font-display font-extrabold text-navy ${className}`}
        >
            {initial}
        </div>
    );
}

function Message({ label, children }) {
    return (
        <div>
            <p className="text-xs font-bold uppercase tracking-wide text-orange-dark">{label}</p>
            <blockquote className="mt-1 text-navy-dark/85">{children}</blockquote>
        </div>
    );
}

export default function OurStory() {
    const { lang, t } = useLanguage();
    const pick = (value) => value[lang] ?? value.en;
    const chefName = pick(headChef.name);

    return (
        <>
            <section className="bg-tint py-12">
                <div className="mx-auto max-w-7xl px-4">
                    <h1 className="text-4xl font-extrabold sm:text-5xl">{t("nav.ourStory")}</h1>
                    <p className="mt-3 max-w-2xl text-lg text-navy-dark/75">{t("story.intro")}</p>
                </div>
            </section>

            <section className="mx-auto max-w-3xl px-4 py-14">
                <h2 className="text-3xl font-extrabold">{t("story.storyTitle")}</h2>
                <p className="mt-4 text-lg leading-relaxed text-navy-dark/85">{t("story.storyP1")}</p>
                <p className="mt-4 text-lg leading-relaxed text-navy-dark/85">{t("story.storyP2")}</p>
            </section>

            <section className="border-y-4 border-gold bg-tint py-14">
                <div className="mx-auto max-w-5xl px-4">
                    <h2 className="text-3xl font-extrabold">{t("story.chefTitle")}</h2>
                    <div className="mt-8 grid items-center gap-8 md:grid-cols-[14rem_1fr]">
                        <Avatar person={headChef} name={chefName} className="mx-auto h-56 w-56 text-8xl" />
                        <div className="space-y-5">
                            <div>
                                <p className="text-2xl font-bold text-navy">{chefName}</p>
                                <p className="font-bold text-orange-dark">{t("story.roleChef")}</p>
                            </div>
                            <Message label={t("story.welcomeLabel")}>{pick(headChef.welcome)}</Message>
                            <Message label={t("story.reviewLabel")}>{pick(headChef.review)}</Message>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-14">
                <h2 className="text-3xl font-extrabold">{t("story.ownersTitle")}</h2>
                <p className="mt-2 max-w-2xl text-navy-dark/75">{t("story.ownersIntro")}</p>
                <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {owners.map((owner, index) => {
                        const name = pick(owner.name);
                        return (
                            <li key={owner.id} className="overflow-hidden rounded-3xl bg-white ring-1 ring-gold/40">
                                <div className={`h-3 ${accents[index % accents.length]}`} />
                                <div className="space-y-4 p-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar person={owner} name={name} className="h-20 w-20 shrink-0 text-3xl" />
                                        <div>
                                            <h3 className="text-xl font-bold">{name}</h3>
                                            <p className="text-sm font-bold text-orange-dark">{t("story.roleOwner")}</p>
                                        </div>
                                    </div>
                                    <Message label={t("story.welcomeLabel")}>{pick(owner.welcome)}</Message>
                                    <Message label={t("story.reviewLabel")}>{pick(owner.review)}</Message>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </section>

            <section className="bg-navy py-12 text-center">
                <h2 className="text-3xl font-extrabold !text-white">{t("story.cta")}</h2>
                <Link to="/reservations/book-a-table" className="mt-6 inline-block rounded-full bg-orange px-7 py-3 font-bold text-white hover:bg-orange-dark">
                    {t("nav.bookTable")}
                </Link>
            </section>
        </>
    );
}