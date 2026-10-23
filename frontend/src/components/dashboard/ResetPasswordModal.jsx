import { useState } from "react";
import { getFieldErrors } from "../../services/apiError";
import { resetManagerPassword } from "../../services/user.service";
import { validatePassword } from "../../utils/password";
import Modal from "./Modal";
import PasswordField from "./PasswordField";
import { buttonPrimary, buttonSecondary } from "./styles";

export default function ResetPasswordModal({ manager, onClose, onDone }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const problem = validatePassword(password);
    setError(problem);
    setFormError("");
    if (problem) return;

    setSaving(true);
    try {
      await resetManagerPassword(manager.id, password);
      onDone(`Password reset for ${manager.name}. Share the new password with them.`);
    } catch (requestError) {
      setError(getFieldErrors(requestError).password ?? "");
      setFormError(requestError.message);
      setSaving(false);
    }
  };

  return (
    <Modal title="Reset password" onClose={onClose} widthClass="max-w-md">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <p className="text-navy-dark/80">
          Set a new password for <strong>{manager.name}</strong>. Any session they have open will be logged out.
        </p>
        <PasswordField id="reset-password" label="New password" value={password} onChange={setPassword} error={error} />

        {formError && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={buttonSecondary}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className={buttonPrimary}>
            {saving ? "Saving..." : "Reset password"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
