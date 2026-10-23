export const restaurant = {
  name: "Food Club",
  phones: ["+880 1712-858654", "+880 1403-426242"],
  email: "contact@foodclub.org",
  mapQuery: "49MQ+8JM, Dhaka - Rangpur Hwy, Gobindogonj",
  mapEmbedUrl: "",
};

export const hourRows = [
  ["hours.weekdays", "hours.weekdaysTime"],
  ["hours.friday", "hours.fridayTime"],
];

export const toTel = (phone) => `tel:${phone.replace(/[^\d+]/g, "")}`;

// `dynamic: true` means the dropdown entries come from the menu items the super admin creates.
export const navItems = [
  { labelKey: "nav.menu", path: "/menu", dynamic: true },
  {
    labelKey: "nav.reservations",
    path: "/reservations",
    children: [
      { labelKey: "nav.bookTable", path: "/reservations/book-a-table" },
      { labelKey: "nav.orderOnline", path: "/reservations/order-online" },
      { labelKey: "nav.privateEvents", path: "/reservations/private-events" },
    ],
  },
  {
    labelKey: "nav.about",
    path: "/about",
    children: [
      { labelKey: "nav.ourStory", path: "/about/our-story" },
      { labelKey: "nav.reviews", path: "/about/reviews" },
    ],
  },
  { labelKey: "nav.contact", path: "/contact" },
];

export const legalLinks = [
  { labelKey: "nav.terms", path: "/terms" },
  { labelKey: "nav.privacy", path: "/privacy" },
  { labelKey: "nav.accessibility", path: "/accessibility" },
];

export const pageRoutes = [
  ...navItems.flatMap((item) => (item.children ? item.children : [item])),
  ...legalLinks,
].filter((item) => item.path !== "/");
