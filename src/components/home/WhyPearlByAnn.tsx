import Image from "next/image";

const pillars = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    title: "Carefully Curated Collections",
    body: "Every piece is handpicked to ensure it meets our standards of beauty and craft. We bring you only what we'd wear ourselves.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
    title: "Premium Fabrics",
    body: "From soft Mul Chanderi to breathable Cotton and flowing Crushed Chiffon — we source fabrics that feel as good as they look.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: "Comfortable Everyday Elegance",
    body: "Designed to transition seamlessly from morning errands to evening occasions — looking effortless is always in style.",
  },
];

export default function WhyPearlByAnn() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs tracking-[0.3em] uppercase font-medium" style={{ color: "#D8B4A0" }}>
            Our Promise
          </p>
          <h2
            className="mt-3 font-heading text-3xl font-light text-olive sm:text-4xl"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            Why Pearl by Ann
          </h2>
          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-8 rounded-full" style={{ background: "#D8B4A0" }} />
            <div className="h-1 w-1 rounded-full" style={{ background: "#D8B4A0" }} />
            <div className="h-px w-8 rounded-full" style={{ background: "#D8B4A0" }} />
          </div>
        </div>

        {/* Triptych */}
        <div className="mt-14 grid gap-6 sm:grid-cols-3 sm:items-stretch">

          {/* Left pillar */}
          <div className="group flex flex-col items-center rounded-2xl border border-cream bg-cream/40 p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-rose-gold/30 hover:shadow-lg hover:shadow-rose-gold/10">
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-300 group-hover:bg-olive group-hover:text-white"
              style={{ background: "#F8F4EE", color: "#D8B4A0" }}
            >
              {pillars[0].icon}
            </div>
            <h3
              className="font-heading text-lg font-semibold text-olive"
              style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "1.2rem" }}
            >
              {pillars[0].title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-charcoal/55">
              {pillars[0].body}
            </p>
          </div>

          {/* Center — Logo card (elevated) */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-olive px-8 py-10 text-center shadow-xl shadow-olive/20 sm:-mt-4 sm:mb-0 -order-1 sm:order-none">
            <div className="mb-6 overflow-hidden rounded-full border-4 shadow-lg" style={{ borderColor: "#D8B4A0" }}>
              <Image
                src="/logo.jpeg"
                alt="Pearl by Ann"
                width={100}
                height={100}
                className="h-24 w-24 object-cover"
              />
            </div>
            <h3
              className="font-heading text-2xl font-semibold"
              style={{ fontFamily: "var(--font-cormorant), serif", color: "#D8B4A0" }}
            >
              Pearl by Ann
            </h3>
            <p className="mt-2 text-xs tracking-[0.2em] uppercase text-white/60">
              Ethnic Wears to Simple Chic
            </p>
            <div className="mt-5 h-px w-12 rounded-full" style={{ background: "#D8B4A0", opacity: 0.5 }} />
            <p className="mt-5 text-sm leading-relaxed text-white/70">
              Crafted with love, worn with confidence. Every kurta tells a story of tradition and elegance.
            </p>
          </div>

          {/* Right pillar */}
          <div className="group flex flex-col items-center rounded-2xl border border-cream bg-cream/40 p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-rose-gold/30 hover:shadow-lg hover:shadow-rose-gold/10">
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-300 group-hover:bg-olive group-hover:text-white"
              style={{ background: "#F8F4EE", color: "#D8B4A0" }}
            >
              {pillars[1].icon}
            </div>
            <h3
              className="font-heading text-lg font-semibold text-olive"
              style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "1.2rem" }}
            >
              {pillars[1].title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-charcoal/55">
              {pillars[1].body}
            </p>
          </div>

        </div>

        {/* Third pillar — full width below on all screens, centered */}
        <div className="mt-6 mx-auto max-w-sm">
          <div className="group flex flex-col items-center rounded-2xl border border-cream bg-cream/40 p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-rose-gold/30 hover:shadow-lg hover:shadow-rose-gold/10">
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-300 group-hover:bg-olive group-hover:text-white"
              style={{ background: "#F8F4EE", color: "#D8B4A0" }}
            >
              {pillars[2].icon}
            </div>
            <h3
              className="font-heading text-lg font-semibold text-olive"
              style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "1.2rem" }}
            >
              {pillars[2].title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-charcoal/55">
              {pillars[2].body}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
