// Mirrors the backend rule: at least 8 characters with a letter and a number.
export function validatePassword(value) {
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(value)) return "Password must contain at least one letter.";
  if (!/\d/.test(value)) return "Password must contain at least one number.";
  return "";
}

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export function generatePassword(length = 12) {
  const values = new Uint32Array(length);
  let password = "";
  do {
    crypto.getRandomValues(values);
    password = Array.from(values, (value) => CHARSET[value % CHARSET.length]).join("");
  } while (validatePassword(password));
  return password;
}
