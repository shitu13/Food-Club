// Keep DISH_CATEGORIES in sync with backend/src/constants/dish.js.
export const ROLES = { SUPER_ADMIN: "superadmin", MANAGER: "manager" };

export const DISH_CATEGORIES = [
  { value: "starter", label: "Starter" },
  { value: "main", label: "Main course" },
  { value: "rice", label: "Rice & biryani" },
  { value: "fast-food", label: "Fast food" },
  { value: "dessert", label: "Dessert" },
  { value: "drink", label: "Drink" },
  { value: "side", label: "Side dish" },
];

export const labelOf = (list, value) => list.find((item) => item.value === value)?.label ?? value;
