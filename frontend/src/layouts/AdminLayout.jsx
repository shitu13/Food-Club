import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import Icon from "../components/dashboard/Icon";
import { ROLES } from "../utils/constants";
import logo from "../assets/logo.jpg";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-tint lg:flex">
      <DashboardSidebar open={open} onClose={() => setOpen(false)} user={user} onLogout={logout} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b-4 border-gold bg-white px-4 py-2 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="rounded-full p-2 text-navy hover:bg-tint"
          >
            <Icon name="menu" className="h-6 w-6" />
          </button>
          <img src={logo} alt="" className="h-9 w-9 rounded-full" />
          <span className="font-display text-xl font-extrabold text-navy">{user.role === ROLES.SUPER_ADMIN ? "Admin panel" : "Manager panel"}</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
