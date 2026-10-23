import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { navItems, restaurant } from "../../data/navigation";
import { useLanguage } from "../../i18n/useLanguage";
import { useMenuSections } from "../../menu/useMenuSections";
import { pickLang } from "../../utils/localize";
import LanguageSwitcher from "../common/LanguageSwitcher";
import logo from "../../assets/logo.jpg";

const topLink = ({ isActive }) =>
  `whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold transition-colors ${
    isActive ? "bg-tint text-orange-dark" : "text-navy hover:bg-tint"
  }`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { t, lang } = useLanguage();
  const { sections } = useMenuSections();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // The Menu dropdown is filled with the menu items the super admin has created.
  const items = useMemo(
    () =>
      navItems.map((item) => {
        const children = item.dynamic
          ? sections.map((section) => ({ path: `/menu/${section.slug}`, label: pickLang(section.name, lang) }))
          : item.children;
        return { ...item, children };
      }),
    [sections, lang]
  );

  const labelOf = (entry) => entry.label ?? t(entry.labelKey);
  const hasChildren = (item) => Boolean(item.children?.length);

  return (
    <header className="sticky top-0 z-50 border-b-4 border-gold bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <Link to="/" className="flex items-center gap-2" aria-label={restaurant.name}>
          <img src={logo} alt="" className="h-14 w-14 rounded-full" />
          <span className="font-display text-2xl font-extrabold leading-none text-navy">
            Food <span className="text-leaf">Club</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {items.map((item) =>
            hasChildren(item) ? (
              <div key={item.path} className="group relative">
                <Link
                  to={item.path}
                  aria-haspopup="true"
                  className={`${topLink({ isActive: pathname.startsWith(item.path) })} flex items-center gap-1`}
                >
                  {t(item.labelKey)}
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M5 7l5 6 5-6H5z" />
                  </svg>
                </Link>
                <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="min-w-64 rounded-2xl border-2 border-gold bg-white p-2 shadow-lg">
                    {item.children.map((child) => (
                      <li key={child.path}>
                        <NavLink
                          to={child.path}
                          className={({ isActive }) =>
                            `block rounded-xl px-4 py-2 text-sm font-semibold ${
                              isActive ? "bg-leaf text-white" : "text-navy hover:bg-tint hover:text-orange-dark"
                            }`
                          }
                        >
                          {labelOf(child)}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <NavLink key={item.path} to={item.path} end={!item.dynamic} className={topLink}>
                {t(item.labelKey)}
              </NavLink>
            )
          )}
          <LanguageSwitcher className="ml-2" />
          <Link
            to="/login"
            className="ml-2 whitespace-nowrap rounded-full bg-navy px-5 py-2 text-sm font-bold text-white hover:bg-navy-dark"
          >
            {t("nav.staffLogin")}
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            className="rounded-full p-2 text-navy hover:bg-tint"
            aria-expanded={open}
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
            onClick={() => setOpen((value) => !value)}
          >
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="max-h-[75vh] overflow-y-auto border-t border-gold/40 bg-white px-4 pb-6 lg:hidden" aria-label="Mobile">
          <ul className="space-y-1 pt-3">
            {items.map((item) => (
              <li key={item.path}>
                {hasChildren(item) ? (
                  <details>
                    <summary className="cursor-pointer list-none rounded-xl px-3 py-3 font-bold text-navy hover:bg-tint">
                      {t(item.labelKey)}
                    </summary>
                    <ul className="ml-4 border-l-2 border-leaf pl-3">
                      {item.dynamic && (
                        <li>
                          <Link to={item.path} className="block rounded-xl px-3 py-2 font-semibold text-navy/80 hover:bg-tint">
                            {t("menu.allMenus")}
                          </Link>
                        </li>
                      )}
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <Link to={child.path} className="block rounded-xl px-3 py-2 font-semibold text-navy/80 hover:bg-tint">
                            {labelOf(child)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link to={item.path} className="block rounded-xl px-3 py-3 font-bold text-navy hover:bg-tint">
                    {t(item.labelKey)}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <Link to="/login" className="mt-4 block rounded-full bg-navy px-5 py-3 text-center font-bold text-white">
            {t("nav.staffLogin")}
          </Link>
        </nav>
      )}
    </header>
  );
}
