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

export const navItems = [
    {
        labelKey: "nav.menu",
        path: "/menu",
        children: [
            { labelKey: "nav.dineIn", path: "/menu/dine-in" },
            { labelKey: "nav.takeout", path: "/menu/takeout-delivery" },
            { labelKey: "nav.drinks", path: "/menu/drinks-cocktails" },
            { labelKey: "nav.catering", path: "/menu/catering-events" },
        ],
    },
    {
        labelKey: "nav.reservations",
        path: "/reservations",
        children: [
            { labelKey: "nav.bookTable", path: "/reservations/book-a-table" },
            { labelKey: "nav.orderOnline", path: "/reservations/order-online" },
        ],
    },
    { labelKey: "nav.privateEvents", path: "/private-events" },
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