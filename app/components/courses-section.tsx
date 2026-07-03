"use client";

import Image from "next/image";
import { GAMBLE_SANDS_FACTS, STRAND_COURSES } from "@/lib/courses";

export default function CoursesSection() {
  return (
    <section id="courses" className="border-y border-[#14352a]/10 bg-white/60">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#14352a]/60">Destination</div>
            <h2 className="mt-2 font-serif text-4xl">Gamble Sands & the Columbia Basin</h2>
            <p className="mt-3 max-w-3xl text-[#14352a]/75">
              From Best New Course in 2014 to three David McLay Kidd designs on sandy soil — this is the
              most immersive onsite golf weekend the Strand has ever booked.
            </p>
          </div>
          <div className="rounded-2xl border border-[#14352a]/10 bg-white px-4 py-3 text-sm text-[#14352a]/70 shadow-sm">
            Brewster, WA • August 20–23, 2026
          </div>
        </div>

        <div className="mb-10 rounded-[2rem] border border-[#14352a]/10 bg-[#14352a] p-6 text-white shadow-sm md:p-8">
          <div className="text-xs uppercase tracking-[0.22em] text-white/60">Resort facts</div>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-white/85 md:grid-cols-2">
            {GAMBLE_SANDS_FACTS.map((fact) => (
              <li key={fact}>• {fact}</li>
            ))}
          </ul>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {STRAND_COURSES.map((course) => (
            <article
              key={course.id}
              className="overflow-hidden rounded-[2rem] border border-[#14352a]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <div className="text-xs uppercase tracking-[0.18em] text-[#14352a]/50">{course.architect}</div>
                <h3 className="mt-1 font-serif text-2xl">{course.name}</h3>
                <p className="mt-2 text-sm text-[#14352a]/70">{course.tagline}</p>
                <div className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-[#c45c26]">
                  {course.playedIn}
                </div>
                <ul className="mt-4 space-y-2 text-sm text-[#14352a]/75">
                  {course.facts.map((fact) => (
                    <li key={fact}>• {fact}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
