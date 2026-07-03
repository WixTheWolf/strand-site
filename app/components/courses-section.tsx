import Image from "next/image";
import { STRAND_COURSES } from "@/lib/courses";

export default function CoursesSection() {
  const [featured, ...rest] = STRAND_COURSES;

  return (
    <section id="courses" className="divider">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
        <div className="mb-12 max-w-lg">
          <p className="label">Destination</p>
          <h2 className="section-title mt-3">Gamble Sands</h2>
          <p className="mt-4 text-sm leading-relaxed text-black/55">
            David McLay Kidd&apos;s desert links on sandy Columbia Basin soil — firm fescue fairways,
            walk-to-the-tee resort living, and three courses on property.
          </p>
        </div>

        {/* Featured course — full width */}
        <div className="relative mb-px aspect-[16/9] overflow-hidden bg-[#111] md:aspect-[21/9]">
          <Image
            src={featured.image}
            alt={featured.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
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
                alt={course.name}
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
      </div>
    </section>
  );
}
