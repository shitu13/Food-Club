import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function MainLayout() {
  const { pathname, state } = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // While a saved session is being checked, show nothing from the public site, so it never flashes.
  if (loading) {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center bg-tint font-bold text-navy">
        Loading...
      </div>
    );
  }

  // Logged-in staff only see the dashboard. Log out to see the public website.
  // Right after logging in, the login page sends people back to the page they first asked for.
  if (user) {
    return <Navigate to={pathname === "/login" ? (state?.from ?? "/dashboard") : "/dashboard"} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
