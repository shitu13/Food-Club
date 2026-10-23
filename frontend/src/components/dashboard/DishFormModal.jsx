import { useState } from "react";
import { Link } from "react-router-dom";
import { createDish, updateDish } from "../../services/dish.service";
import { getFieldErrors } from "../../services/apiError";
import { DISH_CATEGORIES } from "../../utils/constants";
import Field from "./Field";
import Modal from "./Modal";
import { buttonPrimary, buttonSecondary, inputClass } from "./styles";

const emptyForm = {
  nameEn: "",
  nameBn: "",
  descEn: "",
  descBn: "",
  price: "",
  category: "main",
  sections: [],
  image: "",
  isAvailable: true,
};

const toForm = (dish, sections) =>
  dish
    ? {
        nameEn: dish.name.en,
        nameBn: dish.name.bn ?? "",
        descEn: dish.description?.en ?? "",
        descBn: dish.description?.bn ?? "",
        price: String(dish.price),
        category: dish.category,
        sections: [...dish.sections],
        image: dish.image ?? "",
        isAvailable: dish.isAvailable,
      }
    : { ...emptyForm, sections: sections.length === 1 ? [sections[0].id] : [] };

// `sections` are the menu items the super admin created, loaded by the Dishes page.
export default function DishFormModal({ dish, sections, onClose, onSaved }) {
  const isEdit = Boolean(dish);
  const [form, setForm] = useState(() => toForm(dish, sections));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSection = (id) =>
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.includes(id) ? prev.sections.filter((item) => item !== id) : [...prev.sections, id],
    }));

  const validate = () => {
    const next = {};
    if (form.nameEn.trim().length < 2) next["name.en"] = "Enter the dish name in English.";
    if (form.price === "" || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      next.price = "Enter a price of 0 or more.";
    }
    if (form.sections.length === 0) next.sections = "Select at least one menu item.";
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
      price: Number(form.price),
      category: form.category,
      sections: form.sections,
      image: form.image.trim(),
      isAvailable: form.isAvailable,
    };

    setSaving(true);
    try {
      const saved = isEdit ? await updateDish(dish.id, payload) : await createDish(payload);
      onSaved(saved, isEdit ? "updated" : "created");
    } catch (error) {
      setErrors(getFieldErrors(error));
      setFormError(error.message);
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit dish" : "Add a dish"} onClose={onClose} widthClass="max-w-2xl">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name (English)" htmlFor="dish-name-en" error={errors["name.en"]}>
            <input id="dish-name-en" value={form.nameEn} onChange={(e) => setValue("nameEn", e.target.value)} maxLength={100} className={inputClass} />
          </Field>
          <Field label="Name (Bangla)" htmlFor="dish-name-bn" error={errors["name.bn"]}>
            <input id="dish-name-bn" lang="bn" value={form.nameBn} onChange={(e) => setValue("nameBn", e.target.value)} maxLength={100} className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Description (English)" htmlFor="dish-desc-en" error={errors["description.en"]}>
            <textarea id="dish-desc-en" rows={3} value={form.descEn} onChange={(e) => setValue("descEn", e.target.value)} maxLength={500} className={inputClass} />
          </Field>
          <Field label="Description (Bangla)" htmlFor="dish-desc-bn" error={errors["description.bn"]}>
            <textarea id="dish-desc-bn" lang="bn" rows={3} value={form.descBn} onChange={(e) => setValue("descBn", e.target.value)} maxLength={500} className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price (৳)" htmlFor="dish-price" error={errors.price}>
            <input id="dish-price" type="number" inputMode="decimal" min="0" step="0.01" value={form.price} onChange={(e) => setValue("price", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Category" htmlFor="dish-category" error={errors.category}>
            <select id="dish-category" value={form.category} onChange={(e) => setValue("category", e.target.value)} className={inputClass}>
              {DISH_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <fieldset>
          <legend className="text-sm font-bold text-navy">Show under these menu items</legend>
          {sections.length === 0 ? (
            <p className="mt-2 rounded-xl bg-tint px-3 py-3 text-sm text-navy-dark/80">
              There are no menu items yet.{" "}
              <Link to="/dashboard/menu-items" className="font-bold text-orange-dark underline">
                Add a menu item first
              </Link>
              , then come back to add this dish.
            </p>
          ) : (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {sections.map((section) => (
                <label key={section.id} className="flex items-center gap-2 rounded-xl border-2 border-navy/15 px-3 py-2 font-semibold has-checked:border-leaf has-checked:bg-leaf/10">
                  <input type="checkbox" checked={form.sections.includes(section.id)} onChange={() => toggleSection(section.id)} className="h-4 w-4 accent-leaf" />
                  <span>
                    {section.name.en}
                    {!section.isActive && <span className="ml-1 text-xs font-bold text-navy/50">(hidden)</span>}
                  </span>
                </label>
              ))}
            </div>
          )}
          {errors.sections && (
            <p role="alert" className="mt-1 text-sm font-semibold text-red-700">
              {errors.sections}
            </p>
          )}
        </fieldset>

        <Field label="Photo link (optional)" htmlFor="dish-image" error={errors.image} hint="Paste a link that starts with https://">
          <input id="dish-image" type="url" value={form.image} onChange={(e) => setValue("image", e.target.value)} placeholder="https://" className={inputClass} />
        </Field>

        <label className="flex items-center gap-2 font-semibold text-navy">
          <input type="checkbox" checked={form.isAvailable} onChange={(e) => setValue("isAvailable", e.target.checked)} className="h-4 w-4 accent-leaf" />
          Available to order right now
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
            {saving ? "Saving..." : isEdit ? "Save changes" : "Add dish"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
