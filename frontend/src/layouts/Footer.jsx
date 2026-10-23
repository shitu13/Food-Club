// import { Link } from "react-router-dom";
// import { hourRows, legalLinks, navItems, restaurant, toTel } from "../../data/navigation";
// import { useLanguage } from "../../i18n/useLanguage";
// import logo from "../../assets/logo.jpg";

// const linkClass = "text-white/80 hover:text-gold";
// export default function Footer() {
//     const { t } = useLanguage();
//     const menu = navItems.find((item) => item.labelKey === "nav.menu");
//     const quick = navItems.filter((item) => !item.children && item.path !== "/");

//     return (
//         <footer className="border-t-4 border-gold bg-navy-dark text-white">
//             <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
//                 <div>
//                     <img src={logo} alt={restaurant.name} className="h-24 w-24 rounded-full" />
//                     <p className="mt-4 font-display text-xl font-bold text-gold">{t("tagline")}</p>
//                     <p className="mt-2 text-sm text-white/80">{t("address")}</p>
//                 </div>

//                 <div>
//                     <h3 className="font-display text-lg !text-gold">{t("footer.menu")}</h3>
//                     <ul className="mt-3 space-y-2 text-sm">
//                         {menu.children.map((item) => (
//                             <li key={item.path}>
//                                 <Link to={item.path} className={linkClass}>{t(item.labelKey)}</Link>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>

//                 <div>
//                     <h3 className="font-display text-lg !text-gold">{t("footer.explore")}</h3>
//                     <ul className="mt-3 space-y-2 text-sm">
//                         <li><Link to="/reservations/book-a-table" className={linkClass}>{t("nav.bookTable")}</Link></li>
//                         <li><Link to="/reservations/order-online" className={linkClass}>{t("nav.orderOnline")}</Link></li>
//                         {quick.map((item) => (
//                             <li key={item.path}>
//                                 <Link to={item.path} className={linkClass}>{t(item.labelKey)}</Link>
//                             </li>
//                         ))}
//                         <li><Link to="/about/our-story" className={linkClass}>{t("nav.ourStory")}</Link></li>
//                     </ul>
//                 </div>

//                 <div>
//                     <h3 className="font-display text-lg !text-gold">{t("footer.hours")}</h3>
//                     <ul className="mt-3 space-y-2 text-sm text-white/80">
//                         {hourRows.map(([dayKey, timeKey]) => (
//                             <li key={dayKey}>
//                                 <span className="font-bold text-white">{t(dayKey)}</span>
//                                 <br />
//                                 {t(timeKey)}
//                             </li>
//                         ))}
//                         {restaurant.phones.map((phone, index) => (
//                             <li key={phone} className={index === 0 ? "pt-2" : ""}>
//                                 <a href={toTel(phone)} className="hover:text-gold">{phone}</a>
//                             </li>
//                         ))}
//                         <li>
//                             <a href={`mailto:${restaurant.email}`} className="hover:text-gold">{restaurant.email}</a>
//                         </li>
//                     </ul>
//                 </div>
//             </div>

//             <div className="border-t border-white/15">
//                 <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
//                     <p>© {new Date().getFullYear()} {t("footer.rights")}</p>
//                     <ul className="flex flex-wrap gap-x-5 gap-y-1">
//                         {legalLinks.map((item) => (
//                             <li key={item.path}>
//                                 <Link to={item.path} className="hover:text-gold">{t(item.labelKey)}</Link>
//                             </li>
//                         ))}
//                         <li><Link to="/login" className="hover:text-gold">{t("nav.staffLogin")}</Link></li>
//                     </ul>
//                 </div>
//             </div>
//         </footer>
//     );
// }


import { Link } from "react-router-dom";
import { hourRows, legalLinks, navItems, restaurant, toTel } from "../../data/navigation";
import { useLanguage } from "../../i18n/useLanguage";
import logo from "../../assets/logo.jpg";

const linkClass = "text-white/80 hover:text-gold";
export default function Footer() {
    const { t } = useLanguage();
    const menu = navItems.find((item) => item.labelKey === "nav.menu");
    const quick = navItems.filter((item) => !item.children && item.path !== "/");

    return (
        <footer className="border-t-4 border-gold bg-navy-dark text-white">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <img src={logo} alt={restaurant.name} className="h-24 w-24 rounded-full" />
                    <p className="mt-4 font-display text-xl font-bold text-gold">{t("tagline")}</p>
                    <p className="mt-2 text-sm text-white/80">{t("address")}</p>
                </div>

                <div>
                    <h3 className="font-display text-lg !text-gold">{t("footer.menu")}</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                        {menu.children.map((item) => (
                            <li key={item.path}>
                                <Link to={item.path} className={linkClass}>{t(item.labelKey)}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="font-display text-lg !text-gold">{t("footer.explore")}</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                        <li><Link to="/reservations/book-a-table" className={linkClass}>{t("nav.bookTable")}</Link></li>
                        <li><Link to="/reservations/order-online" className={linkClass}>{t("nav.orderOnline")}</Link></li>
                        {quick.map((item) => (
                            <li key={item.path}>
                                <Link to={item.path} className={linkClass}>{t(item.labelKey)}</Link>
                            </li>
                        ))}
                        <li><Link to="/about/our-story" className={linkClass}>{t("nav.ourStory")}</Link></li>
                        <li><Link to="/about/reviews" className={linkClass}>{t("nav.reviews")}</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-display text-lg !text-gold">{t("footer.hours")}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-white/80">
                        {hourRows.map(([dayKey, timeKey]) => (
                            <li key={dayKey}>
                                <span className="font-bold text-white">{t(dayKey)}</span>
                                <br />
                                {t(timeKey)}
                            </li>
                        ))}
                        {restaurant.phones.map((phone, index) => (
                            <li key={phone} className={index === 0 ? "pt-2" : ""}>
                                <a href={toTel(phone)} className="hover:text-gold">{phone}</a>
                            </li>
                        ))}
                        <li>
                            <a href={`mailto:${restaurant.email}`} className="hover:text-gold">{restaurant.email}</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/15">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} {t("footer.rights")}</p>
                    <ul className="flex flex-wrap gap-x-5 gap-y-1">
                        {legalLinks.map((item) => (
                            <li key={item.path}>
                                <Link to={item.path} className="hover:text-gold">{t(item.labelKey)}</Link>
                            </li>
                        ))}
                        <li><Link to="/login" className="hover:text-gold">{t("nav.staffLogin")}</Link></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}