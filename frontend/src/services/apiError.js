import axios from "axios";

export class ApiError extends Error {
  constructor(message, status = 0, errors = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

// Turns any axios failure into one predictable shape for the UI.
export function toApiError(error) {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    if (error.response) {
      const { status, data } = error.response;
      return new ApiError(data?.message ?? "Something went wrong. Please try again.", status, data?.errors ?? []);
    }
    if (error.code === "ECONNABORTED") {
      return new ApiError("The server took too long to respond. It may be waking up, so please try again.");
    }
    return new ApiError("Cannot reach the server. Check your connection and try again.");
  }

  return new ApiError(error?.message ?? "Something went wrong. Please try again.");
}

// { "name.en": "message" } so each form field can show its own error.
export function getFieldErrors(error) {
  const fields = {};
  for (const { field, message } of error?.errors ?? []) {
    if (field && !(field in fields)) fields[field] = message;
  }
  return fields;
}
