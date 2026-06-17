"use client";

import { useState } from "react";
import { BRAND, WHATSAPP, SOCIAL } from "@/lib/constants";

const WA_ICON = (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", message: "" });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hello ${BRAND.name},\n\nMy name is ${form.name}.\n\n${form.message}`;
    window.open(WHATSAPP.getUrl(text), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Page Header */}
      <div className="bg-cream py-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">
          Get in Touch
        </p>
        <h1 className="mt-3 font-heading text-4xl font-bold text-olive sm:text-5xl">
          Contact Us
        </h1>
        <p className="mt-4 text-sm text-gray-500 sm:text-base">
          We'd love to hear from you. Reach us on WhatsApp or Instagram.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">

          {/* Left — Business Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-xl font-bold text-olive">
                Business Information
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {BRAND.description}
              </p>
            </div>

            {/* WhatsApp */}
            <div className="rounded-xl border border-cream bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                  {WA_ICON}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    WhatsApp
                  </p>
                  <p className="mt-1 text-base font-semibold text-charcoal">
                    {WHATSAPP.number}
                  </p>
                  <a
                    href={WHATSAPP.getUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
                  >
                    {WA_ICON}
                    Message Us
                  </a>
                </div>
              </div>
            </div>

            {/* Instagram */}
            <div className="rounded-xl border border-cream bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Instagram
                  </p>
                  <p className="mt-1 text-base font-semibold text-charcoal">
                    {SOCIAL.instagram}
                  </p>
                  <a
                    href={SOCIAL.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-5 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
                  >
                    Follow Us
                  </a>
                </div>
              </div>
            </div>

            {/* Hours note */}
            <p className="text-xs text-gray-400">
              We typically respond within a few hours on WhatsApp during business hours.
            </p>
          </div>

          {/* Right — Contact Form */}
          <div className="rounded-xl border border-cream bg-white p-8 shadow-sm">
            <h2 className="font-heading text-xl font-bold text-olive">
              Send a Message
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Fill in the form below — it will open WhatsApp with your message pre-filled.
            </p>

            <form onSubmit={handleSend} className="mt-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-cream bg-warm-white px-4 py-3 text-sm text-charcoal placeholder-gray-300 focus:border-olive focus:outline-none focus:ring-1 focus:ring-olive"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="I'm interested in the Emerald Embroidered Kurta in size M..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full resize-none rounded-lg border border-cream bg-warm-white px-4 py-3 text-sm text-charcoal placeholder-gray-300 focus:border-olive focus:outline-none focus:ring-1 focus:ring-olive"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-olive px-8 py-3.5 text-sm font-medium text-white transition-all hover:bg-olive-light hover:shadow-lg"
              >
                {WA_ICON}
                Send via WhatsApp
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
