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

        {/* Dining — full menus, editorial (no stand-in photos) */}
        <div id="dining" className="mt-16 space-y-px">
          {STRAND_DINING.map((spot, i) => (
            <Reveal key={spot.id} delay={i * 110}>
            <article className="group relative overflow-hidden bg-[#14352a] p-7 text-white md:p-12">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-6 -top-14 select-none text-[14rem] font-medium leading-none text-white/[0.045] transition duration-500 group-hover:text-white/[0.08]"
              >
                {spot.name.charAt(0)}
              </div>

              <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="label text-white/40">{spot.kind}</p>
                  <h3 className="mt-2 text-2xl font-medium md:text-3xl">{spot.name}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">{spot.tagline}</p>
                </div>
                <div className="shrink-0 text-left md:text-right">
                  <p className="font-mono text-xs text-white/70">{spot.hours}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#c4b59a]">{spot.when}</p>
                </div>
              </div>

              {/* Full menu */}
              <div className="relative mt-9 grid gap-9 border-t border-white/12 pt-8 md:grid-cols-3 md:gap-10">
                {spot.menu.map((section) => (
                  <div key={section.title}>
                    <h4 className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#c4b59a]">
                      {section.title}
                      <span className="h-px flex-1 bg-white/10" aria-hidden />
                    </h4>
                    <ul className="mt-4 space-y-3.5">
                      {section.items.map((item) => (
                        <li key={item.name}>
                          <div className="text-sm font-medium text-white/90">{item.name}</div>
                          {item.note && (
                            <div className="mt-0.5 text-xs italic leading-snug text-white/45">{item.note}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="relative mt-9 flex flex-wrap gap-x-8 gap-y-2 border-t border-white/12 pt-5">
                {spot.facts.map((fact) => (
                  <span key={fact} className="text-xs text-white/45">
                    {fact}
                  </span>
                ))}
              </div>
            </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
