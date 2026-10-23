import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "../../components/dashboard/ConfirmDialog";
import Icon from "../../components/dashboard/Icon";
import MenuItemFormModal from "../../components/dashboard/MenuItemFormModal";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import { buttonPrimary, rowAction, rowActionDanger, tdClass, thClass } from "../../components/dashboard/styles";
import { useMenuSections } from "../../menu/useMenuSections";
import { deleteMenuSection, listMenuSections, updateMenuSection } from "../../services/menuSection.service";

export default function MenuItems() {
  const { refresh: refreshWebsiteMenu } = useMenuSections();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    listMenuSections()
      .then((list) => {
        if (cancelled) return;
        setItems(list);
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
  }, [reloadKey]);

  // Reload this table and the website's navbar after every change.
  const reload = () => {
    setReloadKey((key) => key + 1);
    refreshWebsiteMenu();
  };

  const handleSaved = (item, mode) => {
    setModal(null);
    setNotice({ type: "success", text: `"${item.name.en}" was ${mode === "created" ? "added to the Menu" : "updated"}.` });
    reload();
  };

  const toggleVisible = async (item) => {
    setBusyId(item.id);
    try {
      const updated = await updateMenuSection(item.id, { isActive: !item.isActive });
      setItems((list) => list.map((entry) => (entry.id === item.id ? { ...entry, ...updated, dishCount: entry.dishCount } : entry)));
      setNotice({ type: "success", text: `"${updated.name.en}" is now ${updated.isActive ? "shown on" : "hidden from"} the website.` });
      refreshWebsiteMenu();
    } catch (requestError) {
      setNotice({ type: "error", text: requestError.message });
    } finally {
      setBusyId("");
    }
  };

  const askDelete = (item) => {
    if (item.dishCount > 0) {
      setNotice({
        type: "error",
        text: `"${item.name.en}" still has ${item.dishCount} ${item.dishCount === 1 ? "dish" : "dishes"}. Move or delete them first, or hide the item instead.`,
      });
      return;
    }
    setToDelete(item);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteMenuSection(toDelete.id);
      setNotice({ type: "success", text: `"${toDelete.name.en}" was deleted.` });
      reload();
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
        title="Menu items"
        subtitle="These are the entries under Menu on the website, such as Dine-In or Drinks & Cocktails."
        action={
          <button type="button" onClick={() => setModal({ mode: "create" })} className={buttonPrimary}>
            <Icon name="plus" className="h-4 w-4" />
            Add menu item
          </button>
        }
      />

      <Notice notice={notice} onDismiss={() => setNotice(null)} />

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
                <th className={thClass}>Order</th>
                <th className={thClass}>Menu item</th>
                <th className={thClass}>Page address</th>
                <th className={thClass}>Dishes</th>
                <th className={thClass}>On website</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/20">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className={`${tdClass} font-bold`}>{item.position}</td>
                  <td className={tdClass}>
                    <p className="font-bold text-navy">{item.name.en}</p>
                    {item.name.bn && (
                      <p lang="bn" className="text-navy-dark/70">
                        {item.name.bn}
                      </p>
                    )}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-navy-dark/70`}>/menu/{item.slug}</td>
                  <td className={tdClass}>
                    <Link to="/dashboard/dishes" className="font-bold text-navy hover:text-orange-dark">
                      {item.dishCount}
                    </Link>
                  </td>
                  <td className={tdClass}>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.isActive}
                      aria-label={`${item.name.en} is ${item.isActive ? "shown on" : "hidden from"} the website`}
                      disabled={busyId === item.id}
                      onClick={() => toggleVisible(item)}
                      className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${item.isActive ? "bg-leaf" : "bg-navy/25"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${item.isActive ? "left-5.5" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className={tdClass}>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setModal({ mode: "edit", item })} className={rowAction}>
                        Edit
                      </button>
                      <button type="button" onClick={() => askDelete(item)} className={rowActionDanger}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && items.length === 0 && !error && (
          <div className="px-4 py-12 text-center">
            <p className="text-lg font-bold text-navy">No menu items yet</p>
            <p className="mt-1 text-navy-dark/70">Add your first one, for example Dine-In. It will appear under Menu on the website.</p>
          </div>
        )}
        {loading && items.length === 0 && (
          <p role="status" className="px-4 py-12 text-center text-navy-dark/70">
            Loading menu items...
          </p>
        )}
      </div>

      {modal && (
        <MenuItemFormModal item={modal.mode === "edit" ? modal.item : null} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete this menu item?"
          message={`"${toDelete.name.en}" will be removed from the Menu on the website. This cannot be undone.`}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
