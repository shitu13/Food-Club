import { useState } from "react";
import { generatePassword } from "../../utils/password";
import Field from "./Field";
import { buttonSecondary, inputClass } from "./styles";

export default function PasswordField({ id, label, value, onChange, error }) {
  const [visible, setVisible] = useState(false);

  return (
    <Field label={label} htmlFor={id} error={error} hint="At least 8 characters, with a letter and a number.">
      <div className="flex flex-wrap gap-2">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="new-password"
          className={`${inputClass} min-w-0 flex-1`}
        />
        <button type="button" onClick={() => setVisible((current) => !current)} className={buttonSecondary}>
          {visible ? "Hide" : "Show"}
        </button>
        <button
          type="button"
          onClick={() => {
            onChange(generatePassword());
            setVisible(true);
          }}
          className={buttonSecondary}
        >
          Generate
        </button>
      </div>
    </Field>
  );
}
