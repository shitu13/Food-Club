import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import PageHeader from "../../components/dashboard/PageHeader";
import { buttonPrimary, buttonSecondary } from "../../components/dashboard/styles";
import { getStats } from "../../services/stats.service";

const cards = (stats) => [
  { label: "Dishes on the menu", value: stats.dishes.total, bar: "bg-orange" },
  { label: "Available to order", value: stats.dishes.available, bar: "bg-leaf" },
  { label: "Menu items", value: stats.menuSections.total, bar: "bg-gold" },
  { label: "Visible menu items", value: stats.menuSections.active, bar: "bg-orange" },
  { label: "Managers", value: stats.managers.total, bar: "bg-navy" },
  { label: "Active managers", value: stats.managers.active, bar: "bg-leaf" },
];

export default function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageHeader title={`Welcome, ${user.name}`} subtitle="Here is a quick look at your restaurant's menu and team." />

      {error && (
        <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 ring-1 ring-red-200">
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats
          ? cards(stats).map((card) => (
              <div key={card.label} className="overflow-hidden rounded-3xl bg-white ring-1 ring-gold/40">
                <div className={`h-2 ${card.bar}`} />
                <div className="p-5">
                  <p className="font-display text-4xl font-extrabold text-navy">{card.value}</p>
                  <p className="mt-1 text-sm font-semibold text-navy-dark/70">{card.label}</p>
                </div>
              </div>
            ))
          : !error && (
              <p role="status" className="text-navy-dark/70">
                Loading numbers...
              </p>
            )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/dashboard/menu-items" className={buttonPrimary}>
          Manage menu items
        </Link>
        <Link to="/dashboard/dishes" className={buttonSecondary}>
          Manage dishes
        </Link>
        <Link to="/dashboard/managers" className={buttonSecondary}>
          Manage managers
        </Link>
      </div>
    </>
  );
}
