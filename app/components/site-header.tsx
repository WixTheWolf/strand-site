"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { label: "Trip", href: "#trip" },
  { label: "Schedule", href: "#schedule" },
  { label: "Players", href: "#players" },
  { label: "The Pass", href: "#travel" },
  { label: "Draft", href: "/draft" },
  { label: "Archive", href: "#history" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scrollspy — underline the section currently in view
  useEffect(() => {
    const ids = NAV.filter((item) => item.href.startsWith("#")).map((item) => item.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
        else if (window.scrollY < 200) setActive(null);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.2, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${
        scrolled
          ? "border-black/8 bg-[#f7f5f0]/95 shadow-[0_8px_30px_rgba(17,17,17,0.06)] backdrop-blur-xl"
          : "border-transparent bg-gradient-to-b from-black/25 to-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-[1400px] items-center justify-between px-5 transition-all duration-500 md:px-8 ${
          scrolled ? "h-14" : "h-20"
        }`}
      >
        <Link href="#home" className="group">
          <div
            className={`label text-[10px] transition-colors duration-500 ${
              scrolled ? "text-black/45" : "text-white/60"
            }`}
          >
            Gamble Sands 2026
          </div>
          <div
            className={`text-lg font-medium tracking-[-0.04em] transition-colors duration-500 md:text-xl ${
              scrolled ? "text-[#111]" : "text-white"
            }`}
          >
            Strand
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => {
            const isActive = active === item.href;
            const cls = `nav-link label transition-colors duration-500 ${
              isActive ? "nav-active " : ""
            }${
              scrolled
                ? isActive
                  ? "text-black"
                  : "text-black/70 hover:text-black"
                : isActive
                  ? "text-white"
                  : "text-white/80 hover:text-white"
            }`;
            return item.href.startsWith("/") ? (
              <Link key={item.label} href={item.href} className={cls}>
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className={cls}>
                {item.label}
              </a>
            );
          })}
        </nav>

        <button
          type="button"
          className={`label transition-colors duration-500 md:hidden ${
            scrolled ? "text-[#111]" : "text-white"
          }`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <div
        className={`grid overflow-hidden border-t bg-[#f7f5f0] transition-all duration-400 md:hidden ${
          open ? "grid-rows-[1fr] border-black/5" : "grid-rows-[0fr] border-transparent"
        }`}
      >
        <nav className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-4 px-5 py-4">
            {NAV.map((item) =>
              item.href.startsWith("/") ? (
                <Link key={item.label} href={item.href} className="label" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ) : (
                <a key={item.label} href={item.href} className="label" onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              ),
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
