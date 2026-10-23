import apiClient, { cleanParams } from "./apiClient";

export async function listManagers(params) {
  const { data } = await apiClient.get("/users", { params: cleanParams(params) });
  return { managers: data.data.users, meta: data.meta };
}

export async function createManager(payload) {
  const { data } = await apiClient.post("/users", payload);
  return data.data.user;
}

export async function updateManager(id, payload) {
  const { data } = await apiClient.patch(`/users/${id}`, payload);
  return data.data.user;
}

export async function resetManagerPassword(id, password) {
  await apiClient.patch(`/users/${id}/password`, { password });
}

export async function deleteManager(id) {
  await apiClient.delete(`/users/${id}`);
}
