export const ROLES = Object.freeze({
  SUPER_ADMIN: "superadmin",
  MANAGER: "manager",
});

export const ROLE_VALUES = Object.values(ROLES);

// Every role that belongs to the restaurant's own staff.
export const STAFF_ROLES = ROLE_VALUES;
