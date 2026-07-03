"use client";

import Link from "next/link";
import { useState } from "react";

const NAV = [
  { label: "Trip", href: "#trip" },
  { label: "Schedule", href: "#schedule" },
  { label: "Players", href: "#players" },
  { label: "Draft", href: "/draft" },
  { label: "Archive", href: "#history" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-[#f7f5f0]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-8">
        <Link href="#home" className="group">
          <div className="label text-[10px] text-black/45">Gamble Sands 2026</div>
          <div className="text-lg font-medium tracking-[-0.04em] md:text-xl">Strand</div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) =>
            item.href.startsWith("/") ? (
              <Link key={item.label} href={item.href} className="label text-black/70 transition hover:text-black">
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className="label text-black/70 transition hover:text-black">
                {item.label}
              </a>
            ),
          )}
        </nav>

        <button
          type="button"
          className="label md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="border-t border-black/5 bg-[#f7f5f0] px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
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
          </nav>
        </div>
      )}
    </header>
  );
}
