import Link from "next/link";
import { BRAND, WHATSAPP } from "@/lib/constants";

export const metadata = { title: "About — Pearl by Ann" };

const pillars = [
  {
    title: "Our Story",
    body: "Pearl by Ann was born from a simple love of beautiful ethnic wear. Founded by Ann, the brand set out to make elegant kurtas accessible to every woman — pieces that feel as good as they look, whether worn to a festival or a casual afternoon out.",
  },
  {
    title: "Ethnic Wears to Simple Chic",
    body: "Our philosophy bridges the gap between traditional craft and modern simplicity. Every design starts with an ethnic soul — a block print, an embroidery motif, a classic silhouette — and is refined into something effortlessly wearable every day.",
  },
  {
    title: "Our Mission",
    body: "To dress women in clothing that honours Indian textile traditions while fitting naturally into contemporary life. We believe you shouldn't have to choose between heritage and comfort.",
  },
  {
    title: "Quality Promise",
    body: "We source only premium fabrics — breathable cottons, pure linens, soft handlooms — and work closely with skilled artisans to ensure every stitch, print, and finish meets our standard. Each piece is checked before it reaches you.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero */}
      <div className="bg-cream py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">
          Our Story
        </p>
        <h1 className="mt-3 font-heading text-4xl font-bold text-olive sm:text-5xl">
          {BRAND.name}
        </h1>
        <p className="mt-4 text-base text-charcoal/70 sm:text-lg">
          {BRAND.tagline}
        </p>
        <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-olive via-gold to-olive" />
      </div>

      {/* Pillars */}
      <div className="mx-auto max-w-4xl space-y-12 px-6 py-16 lg:px-8">
        {pillars.map((p) => (
          <div key={p.title} className="flex gap-6">
            <div className="mt-1 h-8 w-1 flex-shrink-0 rounded-full bg-gold" />
            <div>
              <h2 className="font-heading text-xl font-bold text-olive sm:text-2xl">
                {p.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-500 sm:text-base">
                {p.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div className="bg-olive py-14 text-center">
        <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          Shop the Collection
        </h2>
        <p className="mt-3 text-sm text-white/70">
          Browse our kurtas and short kurtas, and order directly on WhatsApp.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/products"
            className="rounded-full bg-gold px-8 py-3 text-sm font-medium text-white transition-all hover:bg-gold-light hover:shadow-lg"
          >
            View Products
          </Link>
          <a
            href={WHATSAPP.getUrl(`Hi ${BRAND.name}, I'd love to learn more about your collection.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border-2 border-white/40 px-8 py-3 text-sm font-medium text-white transition-all hover:border-white hover:bg-white/10"
          >
            Chat with Us
          </a>
        </div>
      </div>
    </div>
  );
}
