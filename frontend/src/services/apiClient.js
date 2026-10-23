import axios from "axios";
import { getToken } from "../utils/tokenStorage";
import { toApiError } from "./apiError";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/+$/, "");

const apiClient = axios.create({ baseURL, timeout: 30_000 });

let unauthorizedHandler = null;

// AuthProvider registers a function here that logs the user out when a session ends.
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

// Removes empty filter values so a request never contains "?category=".
export const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""));

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    if (apiError.status === 401 && !error.config?.skipUnauthorizedHandler) {
      unauthorizedHandler?.();
    }
    return Promise.reject(apiError);
  }
);

export default apiClient;
