export const BRAND = {
  name: "Pearl by Ann",
  tagline: "Ethnic Wears to Simple Chic",
  description: "Discover elegant kurtas and short kurtas crafted with love. Pearl by Ann brings you ethnic wear that transitions effortlessly from traditional to contemporary.",
} as const;

export const SOCIAL = {
  instagram: "@pearlbyann_official",
  instagramUrl: "https://instagram.com/pearlbyann_official",
} as const;

export const WHATSAPP = {
  number: "+918921840772",
  message: "Hi Pearl by Ann, I'd like to know more about your products.",
  getUrl: (message?: string) => {
    const text = encodeURIComponent(message || WHATSAPP.message);
    return `https://wa.me/918921840772?text=${text}`;
  },
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;