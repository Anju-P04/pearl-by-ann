import { BRAND, WHATSAPP } from "@/lib/constants";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-olive py-16 sm:py-20">
      {/* Decorative elements */}
      <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-olive-light/20 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-heading">
            Ready to Find Your Perfect Kurtas?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
            Browse our collection and order directly via WhatsApp. We're here
            to help you find the perfect fit.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={WHATSAPP.getUrl(
                `Hi ${BRAND.name}, I'd like to explore your collection and place an order.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gold px-8 py-3 text-sm font-medium text-white transition-all hover:bg-gold-light hover:shadow-lg"
            >
              Order on WhatsApp
            </a>
            <a
              href={WHATSAPP.getUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-white/40 px-8 py-3 text-sm font-medium text-white transition-all hover:border-white hover:bg-white/10"
            >
              Get in Touch
            </a>
          </div>
          <p className="mt-6 text-xs text-white/50">
            Available on WhatsApp at {WHATSAPP.number}
          </p>
        </div>
      </div>
    </section>
  );
}