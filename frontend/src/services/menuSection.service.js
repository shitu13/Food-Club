import apiClient, { cleanParams } from "./apiClient";

// Menu items are the entries under "Menu" in the navbar, e.g. "Dine-In" or "Drinks & Cocktails".
export async function listMenuSections(params) {
  const { data } = await apiClient.get("/menu-sections", { params: cleanParams(params) });
  return data.data.menuSections;
}

export async function createMenuSection(payload) {
  const { data } = await apiClient.post("/menu-sections", payload);
  return data.data.menuSection;
}

export async function updateMenuSection(id, payload) {
  const { data } = await apiClient.patch(`/menu-sections/${id}`, payload);
  return data.data.menuSection;
}

export async function deleteMenuSection(id) {
  await apiClient.delete(`/menu-sections/${id}`);
}
