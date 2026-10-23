export const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getSkip = (page, limit) => (page - 1) * limit;

export const paginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

// { name: { en: "x" } } -> { "name.en": "x" } so a partial update never wipes sibling fields.
export function flattenObject(value, prefix = "", result = {}) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child) && !(child instanceof Date)) {
      flattenObject(child, path, result);
    } else {
      result[path] = child;
    }
  }
  return result;
}
