import apiClient, { cleanParams } from "./apiClient";

export async function listDishes(params) {
  const { data } = await apiClient.get("/dishes", { params: cleanParams(params) });
  return { dishes: data.data.dishes, meta: data.meta };
}

export async function createDish(payload) {
  const { data } = await apiClient.post("/dishes", payload);
  return data.data.dish;
}

export async function updateDish(id, payload) {
  const { data } = await apiClient.patch(`/dishes/${id}`, payload);
  return data.data.dish;
}

export async function deleteDish(id) {
  await apiClient.delete(`/dishes/${id}`);
}
