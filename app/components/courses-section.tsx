import Image from "next/image";
import { STRAND_COURSES, STRAND_DINING } from "@/lib/courses";
import Reveal from "./reveal";

export default function CoursesSection() {
  const [featured, ...rest] = STRAND_COURSES;

  return (
    <section id="courses" className="divider">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
        <Reveal className="mb-12 max-w-lg">
          <p className="label">Destination</p>
          <h2 className="section-title mt-3">Gamble Sands</h2>
          <p className="mt-4 text-sm leading-relaxed text-black/55">
            David McLay Kidd&apos;s desert links on sandy Columbia Basin soil — firm fescue fairways,
            walk-to-the-tee resort living, and three courses on property.
          </p>
        </Reveal>

        {/* Featured course — full width */}
        <div className="group relative mb-px aspect-[16/9] overflow-hidden bg-[#111] md:aspect-[21/9]">
          <Image
            src={featured.image}
            alt={`${featured.name} fairway above the Columbia River`}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.02]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <p className="label text-white/50">{featured.architect}</p>
            <h3 className="mt-2 text-2xl font-medium text-white md:text-3xl">{featured.name}</h3>
            <p className="mt-2 max-w-md text-sm text-white/70">{featured.tagline}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/45">
              {featured.playedIn}
            </p>
          </div>
        </div>

        {/* Remaining courses — grid */}
        <div className="grid gap-px bg-[#e2ddd3] md:grid-cols-2">
          {rest.map((course) => (
            <article key={course.id} className="group relative aspect-[4/3] overflow-hidden bg-[#111]">
              <Image
                src={course.image}
                alt={`${course.name} at Gamble Sands`}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                  {course.architect}
                </p>
                <h3 className="mt-1 text-lg font-medium text-white">{course.name}</h3>
                <p className="mt-1 text-xs text-white/55">{course.playedIn}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Dining — editorial, menu-style (no stand-in photos) */}
        <div className="mt-16 grid gap-px overflow-hidden bg-[#e2ddd3] md:grid-cols-2">
          {STRAND_DINING.map((spot, i) => (
            <Reveal key={spot.id} delay={i * 110} className="h-full">
            <article className="group relative h-full bg-[#14352a] p-7 text-white md:p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-10 select-none text-[10rem] font-medium leading-none text-white/[0.045] transition duration-500 group-hover:text-white/[0.08]"
              >
                {spot.name.charAt(0)}
              </div>
              <p className="label text-white/40">{spot.kind}</p>
              <h3 className="mt-2 text-2xl font-medium">{spot.name}</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/60">{spot.tagline}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {spot.menu.map((item) => (
                  <span
                    key={item}
                    className="border border-white/15 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-white/75"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <ul className="mt-6 space-y-2 text-sm text-white/55">
                {spot.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>

              <p className="mt-6 border-t border-white/10 pt-4 text-xs uppercase tracking-[0.14em] text-white/40">
                {spot.when}
              </p>
            </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
