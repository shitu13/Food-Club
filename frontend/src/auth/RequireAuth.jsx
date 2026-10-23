import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

// `redirectTo`: send people without the right role to another page instead of showing the "No access" screen.
export default function RequireAuth({ roles, redirectTo }) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center bg-tint font-bold text-navy">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    if (redirectTo) return <Navigate to={redirectTo} replace />;
    return (
      <div className="flex min-h-screen items-center justify-center bg-tint px-4">
        <div className="max-w-md rounded-3xl border-4 border-gold bg-white p-8 text-center">
          <h1 className="text-2xl font-extrabold">No access yet</h1>
          <p className="mt-3 text-navy-dark/75">
            Your account ({user.email}) does not have access to the dashboard yet. Please contact the super admin.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={logout} className="rounded-full bg-orange px-5 py-2 font-bold text-white hover:bg-orange-dark">
              Log out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
