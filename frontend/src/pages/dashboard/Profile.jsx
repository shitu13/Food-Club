import { useState } from "react";
import { useAuth } from "../../auth/useAuth";
import Field from "../../components/dashboard/Field";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import { buttonPrimary, buttonSecondary, inputClass } from "../../components/dashboard/styles";
import { getFieldErrors } from "../../services/apiError";
import { ROLES } from "../../utils/constants";
import { formatDateTime } from "../../utils/format";
import { validatePassword } from "../../utils/password";

const cardClass = "rounded-3xl bg-white p-6 ring-1 ring-gold/40";

function DetailsCard() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone ?? "" });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);

  const unchanged = form.name.trim() === user.name && form.phone.trim() === (user.phone ?? "");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);

    const next = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const updated = await updateProfile({ name: form.name.trim(), phone: form.phone.trim() });
      setForm({ name: updated.name, phone: updated.phone ?? "" });
      setNotice({ type: "success", text: "Your details were saved." });
    } catch (error) {
      setErrors(getFieldErrors(error));
      setNotice({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={cardClass} aria-labelledby="details-title">
      <h2 id="details-title" className="text-xl font-extrabold">
        My details
      </h2>
      <p className="mt-1 text-sm text-navy-dark/70">Your name and phone number are shown to the super admin.</p>

      <div className="mt-4">
        <Notice notice={notice} onDismiss={() => setNotice(null)} />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field label="Full name" htmlFor="profile-name" error={errors.name}>
          <input id="profile-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} maxLength={80} autoComplete="name" className={inputClass} />
        </Field>
        <Field label="Phone (optional)" htmlFor="profile-phone" error={errors.phone}>
          <input id="profile-phone" type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} maxLength={20} autoComplete="tel" className={inputClass} />
        </Field>
        <Field label="Email" htmlFor="profile-email" hint="Your email is your login. Ask the super admin if it needs to change.">
          <input id="profile-email" value={user.email} readOnly disabled className={inputClass} />
        </Field>

        <dl className="grid gap-3 rounded-2xl bg-tint px-4 py-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-bold text-navy">Role</dt>
            <dd className="text-navy-dark/80">{user.role === ROLES.SUPER_ADMIN ? "Super admin" : "Manager"}</dd>
          </div>
          <div>
            <dt className="font-bold text-navy">Last login</dt>
            <dd className="text-navy-dark/80">{formatDateTime(user.lastLoginAt)}</dd>
          </div>
        </dl>

        <div className="flex justify-end">
          <button type="submit" disabled={saving || unchanged} className={buttonPrimary}>
            {saving ? "Saving..." : "Save details"}
          </button>
        </div>
      </form>
    </section>
  );
}

function PasswordCard() {
  const { changePassword } = useAuth();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const type = visible ? "text" : "password";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);

    const next = {};
    if (!form.current) next.currentPassword = "Enter your current password.";
    const passwordProblem = validatePassword(form.next);
    if (passwordProblem) next.newPassword = passwordProblem;
    else if (form.next === form.current) next.newPassword = "Choose a password you have not used just now.";
    if (!next.newPassword && form.confirm !== form.next) next.confirm = "The two passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      await changePassword(form.current, form.next);
      setForm({ current: "", next: "", confirm: "" });
      setNotice({ type: "success", text: "Your password was changed." });
    } catch (error) {
      setErrors(getFieldErrors(error));
      setNotice({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={cardClass} aria-labelledby="password-title">
      <h2 id="password-title" className="text-xl font-extrabold">
        Change password
      </h2>
      <p className="mt-1 text-sm text-navy-dark/70">You stay logged in on this device. Any other device will be logged out.</p>

      <div className="mt-4">
        <Notice notice={notice} onDismiss={() => setNotice(null)} />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field label="Current password" htmlFor="pw-current" error={errors.currentPassword}>
          <input id="pw-current" type={type} value={form.current} onChange={(e) => setValue("current", e.target.value)} autoComplete="current-password" className={inputClass} />
        </Field>
        <Field label="New password" htmlFor="pw-new" error={errors.newPassword} hint="At least 8 characters, with a letter and a number.">
          <input id="pw-new" type={type} value={form.next} onChange={(e) => setValue("next", e.target.value)} autoComplete="new-password" className={inputClass} />
        </Field>
        <Field label="Confirm new password" htmlFor="pw-confirm" error={errors.confirm}>
          <input id="pw-confirm" type={type} value={form.confirm} onChange={(e) => setValue("confirm", e.target.value)} autoComplete="new-password" className={inputClass} />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => setVisible((current) => !current)} className={buttonSecondary}>
            {visible ? "Hide passwords" : "Show passwords"}
          </button>
          <button type="submit" disabled={saving} className={buttonPrimary}>
            {saving ? "Saving..." : "Change password"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function Profile() {
  return (
    <>
      <PageHeader title="My profile" subtitle="Update your own details and password." />
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <DetailsCard />
        <PasswordCard />
      </div>
    </>
  );
}
