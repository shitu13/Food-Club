import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.jpg";
import Icon from "./Icon";

const links = [
  { to: "/dashboard", label: "Overview", icon: "overview", end: true },
  { to: "/dashboard/menu-items", label: "Menu items", icon: "list" },
  { to: "/dashboard/dishes", label: "Dishes", icon: "dishes" },
  { to: "/dashboard/managers", label: "Managers", icon: "users" },
];

export default function DashboardSidebar({ open, onClose, user, onLogout }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-navy-dark/60 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy-dark text-white transition-transform motion-reduce:transition-none lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full max-lg:invisible"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/15 px-5 py-4">
          <img src={logo} alt="" className="h-11 w-11 rounded-full" />
          <div>
            <p className="font-display text-xl font-extrabold leading-none">Food Club</p>
            <p className="text-xs text-white/70">Admin panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Dashboard">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold ${
                  isActive ? "bg-orange text-white" : "text-white/85 hover:bg-white/10"
                }`
              }
            >
              <Icon name={link.icon} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/15 px-5 py-4">
          <p className="truncate font-bold">{user.name}</p>
          <p className="truncate text-xs text-white/70">{user.email}</p>
          <p className="mt-1 text-xs font-bold text-gold">{user.role === "superadmin" ? "Super admin" : "Manager"}</p>
          <div className="mt-3 flex items-center">
            <button type="button" onClick={onLogout} className="flex items-center gap-1.5 text-sm font-semibold text-white/85 hover:text-gold">
              <Icon name="logout" className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
