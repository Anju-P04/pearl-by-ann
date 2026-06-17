import Image from "next/image";
import { SOCIAL } from "@/lib/constants";

interface Testimonial {
  id: number;
  name: string;
  review: string;
  rating: number;
  source: "Instagram" | "WhatsApp";
  screenshotImage: string;
}

const testimonials: Testimonial[] = [
  { id: 1, name: "Customer", review: "", rating: 5, source: "Instagram", screenshotImage: "/images/reviews/1.jpeg" },
  { id: 2, name: "Customer", review: "", rating: 5, source: "Instagram", screenshotImage: "/images/reviews/2.jpeg" },
  { id: 3, name: "Customer", review: "", rating: 5, source: "Instagram", screenshotImage: "/images/reviews/3.jpeg" },
  { id: 4, name: "Customer", review: "", rating: 5, source: "Instagram", screenshotImage: "/images/reviews/4.jpeg" },
  { id: 5, name: "Customer", review: "", rating: 5, source: "WhatsApp",  screenshotImage: "/images/reviews/5.jpeg" },
  { id: 6, name: "Customer", review: "", rating: 5, source: "WhatsApp",  screenshotImage: "/images/reviews/6.jpeg" },
  { id: 7, name: "Customer", review: "", rating: 5, source: "WhatsApp",  screenshotImage: "/images/reviews/7.jpeg" },
  { id: 8, name: "Customer", review: "", rating: 5, source: "Instagram", screenshotImage: "/images/reviews/8.jpeg" },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-3.5 w-3.5"
          fill={i < count ? "#D8B4A0" : "none"}
          stroke="#D8B4A0"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ))}
    </div>
  );
}

function SourceBadge({ source }: { source: Testimonial["source"] }) {
  const isInsta = source === "Instagram";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase"
      style={{
        background: isInsta ? "#fdf2f8" : "#f0fdf4",
        color: isInsta ? "#9d174d" : "#166534",
      }}
    >
      {isInsta ? (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ) : (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      )}
      {source}
    </span>
  );
}

export default function CustomerLove() {
  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs tracking-[0.3em] uppercase font-medium" style={{ color: "#D8B4A0" }}>
            Real Reviews
          </p>
          <h2
            className="mt-3 font-heading text-3xl font-light text-olive sm:text-4xl"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            Customer Love
          </h2>
          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-8 rounded-full" style={{ background: "#D8B4A0" }} />
            <div className="h-1 w-1 rounded-full" style={{ background: "#D8B4A0" }} />
            <div className="h-px w-8 rounded-full" style={{ background: "#D8B4A0" }} />
          </div>
          <p className="mt-4 text-sm text-charcoal/50">
            Real screenshots from our happy customers.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-12 columns-2 gap-4 sm:columns-3 lg:columns-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              {/* Screenshot */}
              <div className="relative w-full">
                <Image
                  src={t.screenshotImage}
                  alt={`Customer review ${t.id}`}
                  width={400}
                  height={600}
                  className="w-full object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-3 py-2.5">
                <Stars count={t.rating} />
                <SourceBadge source={t.source} />
              </div>
            </div>
          ))}
        </div>

        {/* Follow CTA */}
        <p className="mt-10 text-center text-xs tracking-widest text-charcoal/40 uppercase">
          Share your look on{" "}
          <a
            href={SOCIAL.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-olive"
            style={{ color: "#D8B4A0" }}
          >
            {SOCIAL.instagram}
          </a>
        </p>
      </div>
    </section>
  );
}
