import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "../../components/dashboard/Icon";
import PageHeader from "../../components/dashboard/PageHeader";
import { buttonSecondary, inputClass } from "../../components/dashboard/styles";
import DishTile from "../../components/payslip/DishTile";
import OrderPanel from "../../components/payslip/OrderPanel";
import SlipModal from "../../components/payslip/SlipModal";
import { MAX_QTY } from "../../components/payslip/Stepper";
import { nextSlipNumber } from "../../components/payslip/slipNumber";
import { listDishes } from "../../services/dish.service";
import { listMenuSections } from "../../services/menuSection.service";
import { calcTotals, formatPaisa } from "../../utils/money";

const emptyMeta = { orderType: "dine-in", reference: "", note: "", discount: "", vat: "" };
const MAX_PAGES = 20;

// The API returns at most 100 dishes per request, so keep asking until every page is loaded.
async function loadAllDishes() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const result = await listDishes({ page, limit: 100, isAvailable: true, sort: "name" });
    all.push(...result.dishes);
    totalPages = result.meta.totalPages;
    page += 1;
  } while (page <= totalPages && page <= MAX_PAGES);
  return all;
}

export default function PaySlip() {
  const [dishes, setDishes] = useState([]);
  const [sections, setSections] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [quantities, setQuantities] = useState({});
  const [meta, setMeta] = useState(emptyMeta);
  const [slip, setSlip] = useState(null);
  // One order number per order, shared by the kitchen slip and the customer slip.
  const [orderNumber, setOrderNumber] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const panelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    Promise.all([loadAllDishes(), listMenuSections()])
      .then(([dishList, sectionList]) => {
        if (cancelled) return;
        setDishes(dishList);
        setSections(sectionList);
        setStatus("ready");
      })
      .catch((requestError) => {
        if (cancelled) return;
        setError(requestError.message);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const dishById = useMemo(() => new Map(dishes.map((dish) => [dish.id, dish])), [dishes]);
  const sectionById = useMemo(() => new Map(sections.map((section) => [section.id, section])), [sections]);

  const setQty = useCallback((id, qty) => {
    const next = Math.min(Math.max(qty, 0), MAX_QTY);
    setQuantities((prev) => {
      const copy = { ...prev };
      if (next === 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  }, []);

  const lines = useMemo(
    () =>
      Object.entries(quantities)
        .map(([id, qty]) => ({ dish: dishById.get(id), qty }))
        .filter((entry) => entry.dish)
        .map(({ dish, qty }) => ({ id: dish.id, name: dish.name, price: dish.price, qty, sections: dish.sections })),
    [quantities, dishById]
  );

  const totals = useMemo(() => calcTotals(lines, meta.discount, meta.vat), [lines, meta.discount, meta.vat]);

  // The grid is sorted by menu item. A dish in several menu items shows under each, but is one order line.
  const groups = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matches = (dish) => !term || dish.name.en.toLowerCase().includes(term) || (dish.name.bn ?? "").toLowerCase().includes(term);

    return sections
      .map((section) => ({ section, dishes: dishes.filter((dish) => dish.sections.includes(section.id) && matches(dish)) }))
      .filter((group) => group.dishes.length > 0);
  }, [sections, dishes, search]);

  const shownGroups = sectionFilter ? groups.filter((group) => group.section.id === sectionFilter) : groups;

  const makeSlip = (kind) => {
    const number = orderNumber || nextSlipNumber();
    setOrderNumber(number);

    // Slip lines are grouped by the first menu item of each dish, in the same order as the menu.
    const order = new Map(sections.map((section, index) => [section.id, index]));
    const byGroup = new Map();
    for (const line of lines) {
      const sectionId = line.sections.find((id) => sectionById.has(id)) ?? "other";
      if (!byGroup.has(sectionId)) {
        byGroup.set(sectionId, { id: sectionId, name: sectionById.get(sectionId)?.name.en ?? "Other", lines: [] });
      }
      byGroup.get(sectionId).lines.push(line);
    }
    const slipGroups = [...byGroup.values()]
      .sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999))
      .map((group) => ({ ...group, lines: [...group.lines].sort((a, b) => a.name.en.localeCompare(b.name.en)) }));

    setSlip({
      kind,
      number,
      issuedAt: new Date(),
      orderType: meta.orderType,
      reference: meta.reference.trim(),
      note: meta.note.trim(),
      groups: slipGroups,
      totals,
    });
  };

  const startNewOrder = () => {
    setQuantities({});
    setMeta(emptyMeta);
    setOrderNumber("");
    setSlip(null);
  };

  const sectionCounts = new Map(groups.map((group) => [group.section.id, group.dishes.length]));

  return (
    <>
      <PageHeader title="Pay slip" subtitle="Pick dishes, check the total, then print the kitchen slip and the customer's pay slip." />

      {status === "error" && (
        <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 ring-1 ring-red-200">
          <span>{error}</span>
          <button type="button" onClick={() => setReloadKey((key) => key + 1)} className={buttonSecondary}>
            Try again
          </button>
        </div>
      )}

      <div className="grid items-start gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_24rem] lg:pb-0">
        <div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input type="search" aria-label="Search dishes" placeholder="Search dishes" value={search} onChange={(e) => setSearch(e.target.value)} className={inputClass} />
          </div>

          {sections.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by menu item">
              {[{ id: "", label: "All menus" }, ...groups.map((group) => ({ id: group.section.id, label: `${group.section.name.en} (${sectionCounts.get(group.section.id)})` }))].map((chip) => (
                <button
                  key={chip.id || "all"}
                  type="button"
                  aria-pressed={sectionFilter === chip.id}
                  onClick={() => setSectionFilter(chip.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold ring-2 ${sectionFilter === chip.id ? "bg-navy text-white ring-navy" : "bg-white text-navy ring-navy/20 hover:ring-navy"}`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {status === "loading" && (
            <p role="status" className="mt-8 text-navy-dark/70">
              Loading dishes...
            </p>
          )}
          {status === "ready" && dishes.length === 0 && (
            <p className="mt-8 rounded-2xl bg-white px-5 py-8 text-center text-navy-dark/70 ring-1 ring-gold/40">
              There are no available dishes yet. Add dishes on the Dishes page first.
            </p>
          )}
          {status === "ready" && dishes.length > 0 && shownGroups.length === 0 && (
            <p className="mt-8 rounded-2xl bg-white px-5 py-8 text-center text-navy-dark/70 ring-1 ring-gold/40">No dishes match your search.</p>
          )}

          {shownGroups.map(({ section, dishes: sectionDishes }) => (
            <section key={section.id} aria-labelledby={`menu-${section.id}`} className="mt-8">
              <h2 id={`menu-${section.id}`} className="text-2xl font-extrabold">
                {section.name.en}
              </h2>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {sectionDishes.map((dish) => (
                  <DishTile key={dish.id} dish={dish} qty={quantities[dish.id] ?? 0} onChange={(qty) => setQty(dish.id, qty)} />
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div ref={panelRef} className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:rounded-3xl">
          <OrderPanel
            lines={lines}
            meta={meta}
            onMetaChange={(patch) => setMeta((prev) => ({ ...prev, ...patch }))}
            totals={totals}
            onQtyChange={setQty}
            onClear={startNewOrder}
            onKitchenSlip={() => makeSlip("kitchen")}
            onCustomerSlip={() => makeSlip("customer")}
          />
        </div>
      </div>

      {/* Phones: a summary bar that jumps to the order panel. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t-4 border-gold bg-white px-4 py-3 lg:hidden">
        <p className="font-bold text-navy">
          {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"} · {formatPaisa(totals.total)}
        </p>
        <button
          type="button"
          onClick={() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="inline-flex items-center gap-2 rounded-full bg-orange px-5 py-2 font-bold text-white hover:bg-orange-dark"
        >
          <Icon name="receipt" className="h-4 w-4" />
          Review order
        </button>
      </div>

      {slip && <SlipModal slip={slip} onClose={() => setSlip(null)} />}
    </>
  );
}
