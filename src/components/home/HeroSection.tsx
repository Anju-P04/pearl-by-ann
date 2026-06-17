import Link from "next/link";
import { WHATSAPP, SOCIAL } from "@/lib/constants";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-charcoal/55" />

      {/* Content */}
      <div className="relative mx-auto max-w-5xl px-6 py-24 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">

          {/* Eyebrow */}
          <p className="mb-6 text-xs tracking-[0.35em] uppercase font-medium" style={{ color: "#D8B4A0" }}>
            New Collection
          </p>

          {/* Headline */}
          <h1
            className="font-heading text-5xl font-light leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            Ethnic Wears to{" "}
            <em className="not-italic font-semibold" style={{ color: "#D8B4A0" }}>
              Simple Chic
            </em>
          </h1>

          {/* Rose gold divider */}
          <div className="mx-auto my-8 flex items-center justify-center gap-3">
            <div className="h-px w-12 rounded-full" style={{ background: "#D8B4A0" }} />
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#D8B4A0" }} />
            <div className="h-px w-12 rounded-full" style={{ background: "#D8B4A0" }} />
          </div>

          {/* Subheading */}
          <p className="mx-auto max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Discover elegant kurtas and kurti sets crafted for the modern Indian woman — where tradition meets effortless style.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/products"
              className="group relative overflow-hidden rounded-full bg-olive px-9 py-3.5 text-sm tracking-widest uppercase font-medium text-white transition-all hover:shadow-lg hover:shadow-olive/30"
            >
              <span className="relative z-10">Explore Collection</span>
              <div className="absolute inset-0 -translate-x-full bg-olive-light transition-transform duration-300 group-hover:translate-x-0" />
            </Link>
            <a
              href={WHATSAPP.getUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-rose-gold px-9 py-3.5 text-sm tracking-widest uppercase font-medium text-rose-gold transition-all hover:bg-rose-gold hover:text-white hover:shadow-md"
            >
              Chat with Us
            </a>
          </div>

          {/* Social proof */}
          <p className="mt-10 text-xs tracking-widest text-white/40 uppercase">
            Follow us on{" "}
            <a
              href={SOCIAL.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
              style={{ color: "#D8B4A0" }}
            >
              {SOCIAL.instagram}
            </a>
          </p>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-rose-gold to-transparent opacity-40" />
    </section>
  );
}
