import Link from "next/link";

type DraftHeaderProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  extraLink?: { href: string; label: string };
};

export default function DraftHeader({
  title,
  backHref = "/",
  backLabel = "Main site",
  extraLink,
}: DraftHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f7f5f0]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-8">
        <Link href="/" className="group">
          <div className="label text-[10px] text-black/45">Gamble Sands 2026</div>
          <div className="text-lg font-medium tracking-[-0.04em] md:text-xl">{title}</div>
        </Link>

        <div className="flex items-center gap-4">
          {extraLink ? (
            <Link href={extraLink.href} className="label text-black/55 hover:text-black">
              {extraLink.label}
            </Link>
          ) : null}
          <Link href={backHref} className="label text-black/55 hover:text-black">
            {backLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
