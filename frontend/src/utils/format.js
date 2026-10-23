export const formatPrice = (value) =>
  `৳${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export const formatDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "Never";
