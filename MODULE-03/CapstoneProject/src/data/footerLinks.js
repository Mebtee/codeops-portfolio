
export const BRAND_NAME = 'Mesob House';
export const PHONE = '+251 911 234 567';
export const PHONE_HREF = 'tel:+251911234567';
export const ADDRESS = 'Bole Medhanialem, Addis Ababa';
export const HOURS = [
  'Tuesday – Sunday: 11:30 AM – 11:00 PM',
  'Monday: Reserved for private banquets',
];

export const FOOTER_BRAND = {
  title: 'Mesob House',
  tagline: [
    'Sharing traditions from the Ethiopian',
    'highlands — one Gursha at a time.',
  ],
  note: 'Traditional Coffee Ceremony daily at 4:00 PM',
};

// Column 1 of the footer is the brand block; these supply columns 2-4.
export const FOOTER_COLUMNS = [
  {
    title: 'Hospitality Hours',
    items: [
      { text: 'Tuesday – Sunday: 11:30 AM – 11:00 PM' },
      { text: 'Monday: Reserved for private banquets' },
      { text: 'Jebena Buna & Fresh Roasting All Evening', highlight: true },
    ],
  },
  {
    title: 'Guest Account & Traditions',
    items: [
      { text: 'Sign In to Mesob Rewards', href: '/login' },
      { text: 'Create Member Profile', href: '/signup' },
      { text: 'Vegan Fasting (Bayenetu / Tsom)' },
      { text: 'House Tej (Pure Honey Wine)' },
    ],
  },
  {
    title: 'Addis Location',
    items: [
      { text: `${ADDRESS} & Express Delivery across town.` },
      { text: PHONE, href: PHONE_HREF, emphasis: true },
    ],
    showSocialIcons: true,
  },
];

export const FOOTER_LEGAL_LINKS = [
  { text: 'Gursha Hospitality', href: '/' },
  { text: 'Privacy Policy', href: '/' },
  { text: 'Terms of Table', href: '/' },
];

export const FOOTER_COPYRIGHT =
  '© 2025 Mesob House Habesha Dining. Authentic Ethiopian & Eritrean Heritage.';
