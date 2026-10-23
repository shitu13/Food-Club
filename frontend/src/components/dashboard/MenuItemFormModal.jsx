import { useState } from "react";
import { createMenuSection, updateMenuSection } from "../../services/menuSection.service";
import { getFieldErrors } from "../../services/apiError";
import Field from "./Field";
import Modal from "./Modal";
import { buttonPrimary, buttonSecondary, inputClass } from "./styles";

const emptyForm = { nameEn: "", nameBn: "", descEn: "", descBn: "", position: "", isActive: true };

const toForm = (item) =>
  item
    ? {
        nameEn: item.name.en,
        nameBn: item.name.bn ?? "",
        descEn: item.description?.en ?? "",
        descBn: item.description?.bn ?? "",
        position: String(item.position ?? ""),
        isActive: item.isActive,
      }
    : emptyForm;

// Adds or edits one entry of the website's Menu dropdown (for example "Dine-In").
export default function MenuItemFormModal({ item, onClose, onSaved }) {
  const isEdit = Boolean(item);
  const [form, setForm] = useState(() => toForm(item));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next = {};
    if (form.nameEn.trim().length < 2) next["name.en"] = "Enter the name in English.";
    if (form.position !== "" && (!Number.isInteger(Number(form.position)) || Number(form.position) < 0)) {
      next.position = "Enter a whole number, 0 or more.";
    }
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const clientErrors = validate();
    setErrors(clientErrors);
    setFormError("");
    if (Object.keys(clientErrors).length > 0) return;

    const payload = {
      name: { en: form.nameEn.trim(), bn: form.nameBn.trim() },
      description: { en: form.descEn.trim(), bn: form.descBn.trim() },
      isActive: form.isActive,
    };
    // Left empty, a new item is placed at the end by the server.
    if (form.position !== "") payload.position = Number(form.position);

    setSaving(true);
    try {
      const saved = isEdit ? await updateMenuSection(item.id, payload) : await createMenuSection(payload);
      onSaved(saved, isEdit ? "updated" : "created");
    } catch (error) {
      setErrors(getFieldErrors(error));
      setFormError(error.message);
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit menu item" : "Add a menu item"} onClose={onClose} widthClass="max-w-2xl">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name (English)" htmlFor="item-name-en" error={errors["name.en"]} hint="Shown under Menu, for example Dine-In.">
            <input id="item-name-en" value={form.nameEn} onChange={(e) => setValue("nameEn", e.target.value)} maxLength={60} className={inputClass} />
          </Field>
          <Field label="Name (Bangla)" htmlFor="item-name-bn" error={errors["name.bn"]}>
            <input id="item-name-bn" lang="bn" value={form.nameBn} onChange={(e) => setValue("nameBn", e.target.value)} maxLength={60} className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Short description (English)" htmlFor="item-desc-en" error={errors["description.en"]}>
            <textarea id="item-desc-en" rows={2} value={form.descEn} onChange={(e) => setValue("descEn", e.target.value)} maxLength={200} className={inputClass} />
          </Field>
          <Field label="Short description (Bangla)" htmlFor="item-desc-bn" error={errors["description.bn"]}>
            <textarea id="item-desc-bn" lang="bn" rows={2} value={form.descBn} onChange={(e) => setValue("descBn", e.target.value)} maxLength={200} className={inputClass} />
          </Field>
        </div>

        <Field label="Display order" htmlFor="item-position" error={errors.position} hint="Smaller numbers come first. Leave empty to add it at the end.">
          <input id="item-position" type="number" inputMode="numeric" min="0" step="1" value={form.position} onChange={(e) => setValue("position", e.target.value)} className={inputClass} />
        </Field>

        <label className="flex items-center gap-2 font-semibold text-navy">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setValue("isActive", e.target.checked)} className="h-4 w-4 accent-leaf" />
          Show on the website
        </label>

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
            {saving ? "Saving..." : isEdit ? "Save changes" : "Add menu item"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
