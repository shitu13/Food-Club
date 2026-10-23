import apiClient from "./apiClient";

export async function login(email, password) {
  // A 401 here means wrong credentials, not an expired session, so skip the global logout.
  const { data } = await apiClient.post("/auth/login", { email, password }, { skipUnauthorizedHandler: true });
  return data.data; // { token, user }
}

export async function getCurrentUser() {
  const { data } = await apiClient.get("/auth/me");
  return data.data.user;
}
