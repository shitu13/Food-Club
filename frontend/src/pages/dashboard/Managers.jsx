import { useEffect, useState } from "react";
import ConfirmDialog from "../../components/dashboard/ConfirmDialog";
import Icon from "../../components/dashboard/Icon";
import ManagerFormModal from "../../components/dashboard/ManagerFormModal";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import Pagination from "../../components/dashboard/Pagination";
import ResetPasswordModal from "../../components/dashboard/ResetPasswordModal";
import { buttonPrimary, inputClass, rowAction, rowActionDanger, tdClass, thClass } from "../../components/dashboard/styles";
import useDebounce from "../../hooks/useDebounce";
import { deleteManager, listManagers, updateManager } from "../../services/user.service";
import { formatDateTime } from "../../utils/format";

const PAGE_SIZE = 10;
const initialFilters = { search: "", status: "", page: 1 };

export default function Managers() {
  const [filters, setFilters] = useState(initialFilters);
  const [managers, setManagers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const debouncedSearch = useDebounce(filters.search, 350);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    listManagers({ page: filters.page, limit: PAGE_SIZE, search: debouncedSearch, isActive: filters.status })
      .then((result) => {
        if (cancelled) return;
        setManagers(result.managers);
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
  }, [filters.page, filters.status, debouncedSearch, reloadKey]);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  const reload = () => setReloadKey((key) => key + 1);

  const handleSaved = (manager, mode) => {
    setModal(null);
    setNotice({
      type: "success",
      text: mode === "created" ? `${manager.name} was added as a manager. Share their email and password with them.` : `${manager.name} was updated.`,
    });
    reload();
  };

  const toggleActive = async (manager) => {
    setBusyId(manager.id);
    try {
      const updated = await updateManager(manager.id, { isActive: !manager.isActive });
      setManagers((list) => list.map((item) => (item.id === manager.id ? updated : item)));
      setNotice({ type: "success", text: `${updated.name} was ${updated.isActive ? "activated" : "deactivated"}.` });
    } catch (requestError) {
      setNotice({ type: "error", text: requestError.message });
    } finally {
      setBusyId("");
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteManager(toDelete.id);
      setNotice({ type: "success", text: `${toDelete.name} was deleted.` });
      if (managers.length === 1 && filters.page > 1) {
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
        title="Managers"
        subtitle="Create accounts for the people who help you run the restaurant."
        action={
          <button type="button" onClick={() => setModal({ mode: "create" })} className={buttonPrimary}>
            <Icon name="plus" className="h-4 w-4" />
            Add manager
          </button>
        }
      />

      <Notice notice={notice} onDismiss={() => setNotice(null)} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <input
          type="search"
          aria-label="Search managers"
          placeholder="Search by name or email"
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          className={inputClass}
        />
        <select aria-label="Filter by status" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)} className={inputClass}>
          <option value="">Active and inactive</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
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
                <th className={thClass}>Manager</th>
                <th className={thClass}>Phone</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Last login</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/20">
              {managers.map((manager) => (
                <tr key={manager.id}>
                  <td className={tdClass}>
                    <p className="font-bold text-navy">{manager.name}</p>
                    <p className="text-navy-dark/70">{manager.email}</p>
                  </td>
                  <td className={`${tdClass} whitespace-nowrap`}>{manager.phone || "Not added"}</td>
                  <td className={tdClass}>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        manager.isActive ? "bg-leaf/15 text-leaf-dark" : "bg-navy/10 text-navy-dark/70"
                      }`}
                    >
                      {manager.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className={`${tdClass} whitespace-nowrap`}>{formatDateTime(manager.lastLoginAt)}</td>
                  <td className={tdClass}>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <button type="button" onClick={() => setModal({ mode: "edit", manager })} className={rowAction}>
                        Edit
                      </button>
                      <button type="button" onClick={() => setModal({ mode: "reset", manager })} className={rowAction}>
                        Reset password
                      </button>
                      <button type="button" disabled={busyId === manager.id} onClick={() => toggleActive(manager)} className={rowAction}>
                        {manager.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button type="button" onClick={() => setToDelete(manager)} className={rowActionDanger}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && managers.length === 0 && !error && (
          <div className="px-4 py-12 text-center">
            <p className="text-lg font-bold text-navy">No managers found</p>
            <p className="mt-1 text-navy-dark/70">Add a manager, or change the filters above.</p>
          </div>
        )}
        {loading && managers.length === 0 && (
          <p role="status" className="px-4 py-12 text-center text-navy-dark/70">
            Loading managers...
          </p>
        )}

        <Pagination meta={meta} onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))} />
      </div>

      {modal?.mode === "create" && <ManagerFormModal manager={null} onClose={() => setModal(null)} onSaved={handleSaved} />}
      {modal?.mode === "edit" && <ManagerFormModal manager={modal.manager} onClose={() => setModal(null)} onSaved={handleSaved} />}
      {modal?.mode === "reset" && (
        <ResetPasswordModal
          manager={modal.manager}
          onClose={() => setModal(null)}
          onDone={(text) => {
            setModal(null);
            setNotice({ type: "success", text });
          }}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete this manager?"
          message={`${toDelete.name} will lose access immediately and the account will be removed. This cannot be undone.`}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
