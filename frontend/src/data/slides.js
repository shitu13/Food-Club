// 7 homepage slides. Put the photos in public/slides/ (slide-1.jpg ... slide-7.jpg).
// Recommended: 1920x900 px, JPG or WebP, under 300 KB each, with the food in the centre.
// While a photo is missing, the slide shows its `fallback` colour instead.

export const slides = [
    {
        id: "welcome",
        image: "/slides/slide-1.jpg",
        fallback: "from-navy to-navy-dark",
        title: { en: "Good food, good mood", bn: "ভালো খাবার, ভালো মেজাজ" },
        text: {
            en: "Welcome to Food Club. Bring your family and friends.",
            bn: "ফুড ক্লাবে স্বাগতম। পরিবার ও বন্ধুদের নিয়ে আসুন।",
        },
        cta: { to: "/reservations/book-a-table", labelKey: "home.book" },
    },
    {
        id: "dine-in",
        image: "/slides/slide-2.jpg",
        fallback: "from-orange-dark to-navy-dark",
        title: { en: "Dine with us", bn: "আমাদের সঙ্গে খান" },
        text: {
            en: "Freshly cooked plates, served at your table.",
            bn: "টাটকা রান্না, পরিবেশন আপনার টেবিলে।",
        },
        cta: { to: "/menu/dine-in", labelKey: "home.seeMenu" },
    },
    {
        id: "delivery",
        image: "/slides/slide-3.jpg",
        fallback: "from-leaf-dark to-navy-dark",
        title: { en: "Order in, enjoy at home", bn: "অর্ডার করুন, বাসায় উপভোগ করুন" },
        text: {
            en: "Takeout and delivery, packed fresh.",
            bn: "টেকআউট ও ডেলিভারি, টাটকা প্যাক করা।",
        },
        cta: { to: "/reservations/order-online", labelKey: "home.order" },
    },
    {
        id: "drinks",
        image: "/slides/slide-4.jpg",
        fallback: "from-navy to-leaf-dark",
        title: { en: "Drinks & cocktails", bn: "ড্রিংকস ও ককটেল" },
        text: {
            en: "Cool drinks and fresh specials for every table.",
            bn: "প্রতিটি টেবিলের জন্য ঠান্ডা পানীয় আর সতেজ আয়োজন।",
        },
        cta: { to: "/menu/drinks-cocktails", labelKey: "home.seeMenu" },
    },
    {
        id: "events",
        image: "/slides/slide-5.jpg",
        fallback: "from-gold to-orange-dark",
        title: { en: "Private events", bn: "প্রাইভেট ইভেন্ট" },
        text: {
            en: "Birthdays, weddings and get-togethers, planned with you.",
            bn: "জন্মদিন, বিয়ে বা জমায়েত, আপনার সঙ্গে মিলে পরিকল্পনা।",
        },
        cta: { to: "/private-events", labelKey: "home.events.cta" },
    },
    {
        id: "catering",
        image: "/slides/slide-6.jpg",
        fallback: "from-orange to-navy",
        title: { en: "Catering", bn: "ক্যাটারিং" },
        text: {
            en: "Big-table menus for big occasions.",
            bn: "বড় আয়োজনের জন্য বড় টেবিলের মেনু।",
        },
        cta: { to: "/menu/catering-events", labelKey: "home.seeMenu" },
    },
    {
        id: "gift",
        image: "/slides/slide-7.jpg",
        fallback: "from-leaf to-navy-dark",
        title: { en: "Gift cards", bn: "গিফট কার্ড" },
        text: {
            en: "Give the gift of a good meal.",
            bn: "উপহার দিন একটি ভালো খাবার।",
        },
        cta: { to: "/gift-cards", labelKey: "home.gift.cta" },
    },
];