import apiClient from "./apiClient";

export async function getStats() {
  const { data } = await apiClient.get("/stats");
  return data.data; // { dishes, menuSections, managers }, each { total, available | active }
}
