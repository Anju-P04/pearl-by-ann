"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { BRAND, NAV_LINKS, WHATSAPP } from "@/lib/constants";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-cream shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.jpeg"
            alt={BRAND.name}
            width={44}
            height={44}
            className="rounded-full object-cover shadow-sm transition-transform group-hover:scale-105"
            priority
          />
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-base font-semibold tracking-wide text-olive" style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "1.1rem" }}>
              {BRAND.name}
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "#D8B4A0" }}>
              {BRAND.tagline}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm tracking-wide transition-colors pb-0.5 ${
                pathname === link.href
                  ? "text-olive font-medium after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-olive"
                  : "text-charcoal/70 hover:text-olive after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-rose-gold after:transition-all hover:after:w-full"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={WHATSAPP.getUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-olive bg-transparent px-5 py-2 text-xs tracking-widest uppercase font-medium text-olive transition-all hover:bg-olive hover:text-white hover:shadow-md"
          >
            Order Now
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <span className={`block h-px w-6 bg-charcoal transition-all duration-300 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-px w-6 bg-charcoal transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block h-px w-6 bg-charcoal transition-all duration-300 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div id="mobile-menu" className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-screen" : "max-h-0"}`}>
        <div className="border-t border-cream bg-white px-6 py-6 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2.5 text-sm tracking-wide transition-colors ${
                pathname === link.href ? "text-olive font-medium" : "text-charcoal/70 hover:text-olive"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3">
            <a
              href={WHATSAPP.getUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="block rounded-full border border-olive px-5 py-2.5 text-center text-xs tracking-widest uppercase font-medium text-olive transition-all hover:bg-olive hover:text-white"
            >
              Order Now
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
