import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-black/8 bg-white">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <div className="label">Strand Invitational</div>
          <p className="mt-2 max-w-sm text-sm text-black/55">
            Gamble Sands · August 20–23, 2026 · Brewster, Washington
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-black/55">
          <Link href="/draft" className="hover:text-black">
            Draft Lab
          </Link>
          <a href="#history" className="hover:text-black">
            Archive
          </a>
          <a
            href="https://www.strandinvitational.life"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black"
          >
            Original site
          </a>
        </div>
      </div>
    </footer>
  );
}
