// "Dine-In Menu!" -> "dine-in-menu". Only ASCII letters and digits are kept, so slugs are safe in URLs.
export function slugify(text) {
  const slug = String(text)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "menu-item";
}
