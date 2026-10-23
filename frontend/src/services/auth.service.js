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

// Name and phone only. Email, role and status are changed by the super admin.
export async function updateProfile(payload) {
  const { data } = await apiClient.patch("/auth/me", payload);
  return data.data.user;
}

// The server ends old sessions when the password changes, so it returns a fresh token.
export async function changePassword(currentPassword, newPassword) {
  const { data } = await apiClient.patch(
    "/auth/password",
    { currentPassword, newPassword },
    // A wrong current password is a form error here, not an expired session.
    { skipUnauthorizedHandler: true }
  );
  return data.data.token;
}
