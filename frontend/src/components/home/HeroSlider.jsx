import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { slides } from "../../data/slides";
import { useLanguage } from "../../i18n/useLanguage";

const INTERVAL_MS = 5500;
const SWIPE_PX = 50;

const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Arrow({ direction }) {
    return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
        </svg>
    );
}

export default function HeroSlider() {
    const { lang, t } = useLanguage();
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(() => !prefersReducedMotion());
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [failed, setFailed] = useState({});
    const touchX = useRef(null);

    const total = slides.length;
    const go = (target) => setIndex((target + total) % total);
    const running = playing && !hovered && !focused;

    useEffect(() => {
        if (!running) return undefined;
        const timer = setInterval(() => setIndex((current) => (current + 1) % total), INTERVAL_MS);
        return () => clearInterval(timer);
    }, [running, index, total]);

    const handleKeyDown = (event) => {
        if (event.key === "ArrowLeft") go(index - 1);
        if (event.key === "ArrowRight") go(index + 1);
    };

    const handleTouchEnd = (event) => {
        if (touchX.current === null) return;
        const distance = event.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(distance) >= SWIPE_PX) go(distance > 0 ? index - 1 : index + 1);
    };

    const roundButton =
        "flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-navy shadow hover:bg-white";

    return (
        <section
            aria-roledescription="carousel"
            aria-label={t("slider.label")}
            className="relative h-[30rem] w-full overflow-hidden bg-navy-dark sm:h-[34rem] lg:h-[38rem]"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            onTouchStart={(event) => { touchX.current = event.touches[0].clientX; }}
            onTouchEnd={handleTouchEnd}
        >
            <div aria-live={running ? "off" : "polite"} className="h-full">
                {slides.map((slide, i) => {
                    const active = i === index;
                    return (
                        <div
                            key={slide.id}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`${i + 1} / ${total}`}
                            inert={!active}
                            className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${active ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            <div className={`absolute inset-0 bg-linear-to-br ${slide.fallback}`} />
                            {!failed[slide.id] && (
                                <img
                                    src={slide.image}
                                    alt=""
                                    loading={i === 0 ? "eager" : "lazy"}
                                    onError={() => setFailed((prev) => ({ ...prev, [slide.id]: true }))}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-navy-dark/85 via-navy-dark/35 to-transparent" />

                            <div className="absolute inset-x-0 bottom-0">
                                <div className="mx-auto max-w-7xl px-4 pb-24 sm:pb-28">
                                    <h2 className="max-w-2xl text-4xl font-extrabold leading-tight !text-white sm:text-6xl">
                                        {slide.title[lang] ?? slide.title.en}
                                    </h2>
                                    <p className="mt-3 max-w-xl text-lg text-white/90 sm:text-xl">
                                        {slide.text[lang] ?? slide.text.en}
                                    </p>
                                    <Link
                                        to={slide.cta.to}
                                        className="mt-6 inline-block rounded-full bg-orange px-7 py-3 font-bold text-white hover:bg-orange-dark"
                                    >
                                        {t(slide.cta.labelKey)}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label={t("slider.prev")}
                className={`${roundButton} absolute left-3 top-1/2 -translate-y-1/2 sm:left-6`}
            >
                <Arrow direction="left" />
            </button>
            <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label={t("slider.next")}
                className={`${roundButton} absolute right-3 top-1/2 -translate-y-1/2 sm:right-6`}
            >
                <Arrow direction="right" />
            </button>

            <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3 px-4">
                <button
                    type="button"
                    onClick={() => setPlaying((value) => !value)}
                    aria-label={playing ? t("slider.pause") : t("slider.play")}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy hover:bg-white"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        {playing ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : <path d="M7 4l13 8-13 8z" />}
                    </svg>
                </button>
                <div className="flex items-center">
                    {slides.map((slide, i) => (
                        <button
                            key={slide.id}
                            type="button"
                            onClick={() => go(i)}
                            aria-label={`${t("slider.goTo")} ${i + 1}`}
                            aria-current={i === index}
                            className="group p-1.5"
                        >
                            <span
                                className={`block h-3 rounded-full transition-all motion-reduce:transition-none ${i === index ? "w-8 bg-gold" : "w-3 bg-white/70 group-hover:bg-white"
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}