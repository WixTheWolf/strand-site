"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type AppHeaderProps = {
  title: string;
  extraLink?: { href: string; label: string };
};

const APP_NAV = [
  { label: "My Strand", shortLabel: "Home", href: "/my-strand", icon: "S" },
  { label: "Live", shortLabel: "Live", href: "/live", icon: "●" },
  { label: "Course Intel", shortLabel: "Courses", href: "/courses", icon: "◇" },
  { label: "Players", shortLabel: "Players", href: "/#players", icon: "○" },
  { label: "Draft Lab", shortLabel: "Draft", href: "/draft", icon: "◆" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/my-strand") return pathname === href;
  const route = href.split("#")[0];
  return route !== "/" && pathname.startsWith(route);
}

export default function AppHeader({ title, extraLink }: AppHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/8 bg-[#f7f5f0]/94 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between gap-5 px-5 md:px-8">
          <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
            <div className="label text-[9px] text-black/40">Gamble Sands 2026</div>
            <div className="text-lg font-medium tracking-[-0.045em]">{title}</div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Tournament navigation">
            {APP_NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                    active
                      ? "bg-[#183d33] text-white"
                      : "text-black/48 hover:bg-white hover:text-black"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 sm:flex">
            {extraLink ? (
              <Link
                href={extraLink.href}
                className="rounded-full border border-black/12 bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition hover:border-black/35"
              >
                {extraLink.label}
              </Link>
            ) : null}
            <Link
              href="/"
              className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-black/40 hover:text-black md:block"
            >
              Main site
            </Link>
          </div>

          <button
            type="button"
            className="rounded-full border border-black/10 bg-white px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] lg:hidden"
            aria-expanded={open}
            aria-controls="app-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        <div
          id="app-menu"
          className={`grid overflow-hidden border-t bg-[#f7f5f0] transition-[grid-template-rows] duration-300 lg:hidden ${
            open ? "grid-rows-[1fr] border-black/8" : "grid-rows-[0fr] border-transparent"
          }`}
        >
          <nav className="min-h-0 overflow-hidden" aria-label="Mobile tournament menu">
            <div className="grid grid-cols-2 gap-2 px-5 py-4 sm:grid-cols-3">
              {APP_NAV.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-xl border px-4 py-3 text-xs font-semibold ${
                      active
                        ? "border-[#183d33] bg-[#183d33] text-white"
                        : "border-black/8 bg-white text-black/65"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-black/8 bg-white px-4 py-3 text-xs font-semibold text-black/65"
              >
                Main site
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <nav
        className="app-mobile-nav fixed inset-x-0 bottom-0 z-50 grid h-[72px] grid-cols-5 border-t border-black/10 bg-white/96 px-1 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-12px_30px_rgba(17,17,17,0.08)] backdrop-blur-xl lg:hidden"
        aria-label="Quick tournament navigation"
      >
        {APP_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[8px] font-semibold uppercase tracking-[0.09em] ${
                active ? "bg-[#183d33] text-white" : "text-black/45"
              }`}
            >
              <span className="text-sm leading-none" aria-hidden>{item.icon}</span>
              <span className="truncate">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
