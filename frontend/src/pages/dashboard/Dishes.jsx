import { useEffect, useState } from "react";
import ConfirmDialog from "../../components/dashboard/ConfirmDialog";
import DishFormModal from "../../components/dashboard/DishFormModal";
import Icon from "../../components/dashboard/Icon";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import Pagination from "../../components/dashboard/Pagination";
import { buttonPrimary, inputClass, rowAction, rowActionDanger, tdClass, thClass } from "../../components/dashboard/styles";
import useDebounce from "../../hooks/useDebounce";
import { deleteDish, listDishes, updateDish } from "../../services/dish.service";
import { listMenuSections } from "../../services/menuSection.service";
import { DISH_CATEGORIES, labelOf } from "../../utils/constants";
import { formatPrice } from "../../utils/format";

const PAGE_SIZE = 10;
const initialFilters = { search: "", category: "", section: "", availability: "", page: 1 };

function Thumb({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-tint text-navy/40">
        <Icon name="dishes" />
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setFailed(true)} className="h-12 w-12 shrink-0 rounded-xl object-cover" />;
}

export default function Dishes() {
  const [filters, setFilters] = useState(initialFilters);
  const [dishes, setDishes] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [sections, setSections] = useState([]);

  const debouncedSearch = useDebounce(filters.search, 350);

  useEffect(() => {
    let cancelled = false;
    listMenuSections()
      .then((list) => {
        if (!cancelled) setSections(list);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    listDishes({
      page: filters.page,
      limit: PAGE_SIZE,
      search: debouncedSearch,
      category: filters.category,
      section: filters.section,
      isAvailable: filters.availability,
    })
      .then((result) => {
        if (cancelled) return;
        setDishes(result.dishes);
        setMeta(result.meta);
        setError("");
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters.page, filters.category, filters.section, filters.availability, debouncedSearch, reloadKey]);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  const reload = () => setReloadKey((key) => key + 1);

  const handleSaved = (dish, mode) => {
    setModal(null);
    setNotice({ type: "success", text: `"${dish.name.en}" was ${mode === "created" ? "added to the menu" : "updated"}.` });
    reload();
  };

  const toggleAvailability = async (dish) => {
    setBusyId(dish.id);
    try {
      const updated = await updateDish(dish.id, { isAvailable: !dish.isAvailable });
      setDishes((list) => list.map((item) => (item.id === dish.id ? updated : item)));
      setNotice({ type: "success", text: `"${updated.name.en}" is now ${updated.isAvailable ? "available" : "unavailable"}.` });
    } catch (requestError) {
      setNotice({ type: "error", text: requestError.message });
    } finally {
      setBusyId("");
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteDish(toDelete.id);
      setNotice({ type: "success", text: `"${toDelete.name.en}" was deleted.` });
      if (dishes.length === 1 && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        reload();
      }
    } catch (requestError) {
      setNotice({ type: "error", text: requestError.message });
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Dishes"
        subtitle="Add dishes and choose which menu items they appear under."
        action={
          <button type="button" onClick={() => setModal({ mode: "create" })} className={buttonPrimary}>
            <Icon name="plus" className="h-4 w-4" />
            Add dish
          </button>
        }
      />

      <Notice notice={notice} onDismiss={() => setNotice(null)} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <input
          type="search"
          aria-label="Search dishes"
          placeholder="Search by name"
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          className={inputClass}
        />
        <select aria-label="Filter by category" value={filters.category} onChange={(event) => updateFilter("category", event.target.value)} className={inputClass}>
          <option value="">All categories</option>
          {DISH_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        <select aria-label="Filter by menu item" value={filters.section} onChange={(event) => updateFilter("section", event.target.value)} className={inputClass}>
          <option value="">All menu items</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name.en}
            </option>
          ))}
        </select>
        <select aria-label="Filter by availability" value={filters.availability} onChange={(event) => updateFilter("availability", event.target.value)} className={inputClass}>
          <option value="">Available and unavailable</option>
          <option value="true">Available only</option>
          <option value="false">Unavailable only</option>
        </select>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 ring-1 ring-red-200">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-gold/40">
        <div className={`overflow-x-auto ${loading ? "opacity-60" : ""}`}>
          <table className="min-w-full">
            <thead className="border-b border-gold/40 bg-tint">
              <tr>
                <th className={thClass}>Dish</th>
                <th className={thClass}>Category</th>
                <th className={thClass}>Menu items</th>
                <th className={thClass}>Price</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/20">
              {dishes.map((dish) => (
                <tr key={dish.id}>
                  <td className={tdClass}>
                    <div className="flex items-center gap-3">
                      <Thumb key={`${dish.id}-${dish.image}`} src={dish.image} alt={dish.name.en} />
                      <div>
                        <p className="font-bold text-navy">{dish.name.en}</p>
                        {dish.name.bn && (
                          <p lang="bn" className="text-navy-dark/70">
                            {dish.name.bn}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={tdClass}>{labelOf(DISH_CATEGORIES, dish.category)}</td>
                  <td className={tdClass}>
                    <div className="flex max-w-56 flex-wrap gap-1">
                      {dish.sections.map((id) => {
                        const section = sections.find((item) => item.id === id);
                        return section ? (
                          <span key={id} className="rounded-full bg-tint px-2 py-0.5 text-xs font-bold text-navy">
                            {section.name.en}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className={`${tdClass} whitespace-nowrap font-bold`}>{formatPrice(dish.price)}</td>
                  <td className={tdClass}>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={dish.isAvailable}
                      aria-label={`${dish.name.en} is ${dish.isAvailable ? "available" : "unavailable"}`}
                      disabled={busyId === dish.id}
                      onClick={() => toggleAvailability(dish)}
                      className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${dish.isAvailable ? "bg-leaf" : "bg-navy/25"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${dish.isAvailable ? "left-5.5" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className={tdClass}>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setModal({ mode: "edit", dish })} className={rowAction}>
                        Edit
                      </button>
                      <button type="button" onClick={() => setToDelete(dish)} className={rowActionDanger}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && dishes.length === 0 && !error && (
          <div className="px-4 py-12 text-center">
            <p className="text-lg font-bold text-navy">No dishes found</p>
            <p className="mt-1 text-navy-dark/70">Add your first dish, or change the filters above.</p>
          </div>
        )}
        {loading && dishes.length === 0 && (
          <p role="status" className="px-4 py-12 text-center text-navy-dark/70">
            Loading dishes...
          </p>
        )}

        <Pagination meta={meta} onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))} />
      </div>

      {modal && (
        <DishFormModal dish={modal.mode === "edit" ? modal.dish : null} sections={sections} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete this dish?"
          message={`"${toDelete.name.en}" will be removed from the menu. This cannot be undone.`}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
