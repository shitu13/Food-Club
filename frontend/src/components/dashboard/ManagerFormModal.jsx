import { useState } from "react";
import { getFieldErrors } from "../../services/apiError";
import { createManager, updateManager } from "../../services/user.service";
import { validatePassword } from "../../utils/password";
import Field from "./Field";
import Modal from "./Modal";
import PasswordField from "./PasswordField";
import { buttonPrimary, buttonSecondary, inputClass } from "./styles";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ManagerFormModal({ manager, onClose, onSaved }) {
  const isEdit = Boolean(manager);
  const [form, setForm] = useState({
    name: manager?.name ?? "",
    email: manager?.email ?? "",
    phone: manager?.phone ?? "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Enter the manager's full name.";
    if (!isEdit) {
      if (!EMAIL_PATTERN.test(form.email.trim())) next.email = "Enter a valid email address.";
      const passwordError = validatePassword(form.password);
      if (passwordError) next.password = passwordError;
    }
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const clientErrors = validate();
    setErrors(clientErrors);
    setFormError("");
    if (Object.keys(clientErrors).length > 0) return;

    setSaving(true);
    try {
      const saved = isEdit
        ? await updateManager(manager.id, { name: form.name.trim(), phone: form.phone.trim() })
        : await createManager({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            password: form.password,
          });
      onSaved(saved, isEdit ? "updated" : "created");
    } catch (error) {
      setErrors(getFieldErrors(error));
      setFormError(error.message);
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit manager" : "Add a manager"} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field label="Full name" htmlFor="manager-name" error={errors.name}>
          <input id="manager-name" value={form.name} onChange={(e) => setValue("name", e.target.value)} maxLength={80} autoComplete="off" className={inputClass} />
        </Field>

        <Field label="Email" htmlFor="manager-email" error={errors.email} hint={isEdit ? "The email cannot be changed." : "The manager logs in with this email."}>
          <input id="manager-email" type="email" value={form.email} onChange={(e) => setValue("email", e.target.value)} disabled={isEdit} autoComplete="off" className={inputClass} />
        </Field>

        <Field label="Phone (optional)" htmlFor="manager-phone" error={errors.phone}>
          <input id="manager-phone" type="tel" value={form.phone} onChange={(e) => setValue("phone", e.target.value)} maxLength={20} className={inputClass} />
        </Field>

        {!isEdit && (
          <PasswordField id="manager-password" label="Password" value={form.password} onChange={(value) => setValue("password", value)} error={errors.password} />
        )}

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
            {saving ? "Saving..." : isEdit ? "Save changes" : "Add manager"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
