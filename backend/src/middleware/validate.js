import ApiError from "../utils/ApiError.js";

/**
 * validate({ params, query, body }) parses each part with its zod schema.
 * The cleaned values are available as req.validated.params / .query / .body.
 * Unknown fields are stripped, which also blocks mass assignment (e.g. a "role" in the body).
 */
export const validate = (schemas) => (req, _res, next) => {
  const validated = {};
  const errors = [];
  const seen = new Set();

  for (const part of ["params", "query", "body"]) {
    if (!schemas[part]) continue;
    const result = schemas[part].safeParse(req[part] ?? {});
    if (result.success) {
      validated[part] = result.data;
    } else {
      for (const issue of result.error.issues) {
        const field = issue.path.join(".") || part;
        if (seen.has(field)) continue; // show one message per field
        seen.add(field);
        errors.push({ field, message: issue.message });
      }
    }
  }

  if (errors.length > 0) return next(ApiError.validation(errors));

  req.validated = validated;
  return next();
};
