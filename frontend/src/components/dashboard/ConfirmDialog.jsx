import Modal from "./Modal";
import { buttonDanger, buttonSecondary } from "./styles";

export default function ConfirmDialog({ title, message, confirmLabel = "Delete", busy, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel} widthClass="max-w-md">
      <p className="text-navy-dark/80">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={busy} className={buttonSecondary}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className={buttonDanger}>
          {busy ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
