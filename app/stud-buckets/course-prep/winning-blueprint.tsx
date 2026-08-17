import Link from "next/link";

const SCARECROW_LIGHTS = [
  { hole: 1, light: "GREEN", title: "Free speed", call: "Blind-ish look, huge downhill release. Find the runway and let the ground do the CrossFit." },
  { hole: 2, light: "RED", title: "Redan. Left is jail.", call: "Use the right side and feed it in. Par is a grown-man score. Stop trying to hit a magazine cover." },
  { hole: 3, light: "GREEN", title: "Par-5 tax refund", call: "Generous driving area. Get one ball alive, then go shopping for birdie." },
  { hole: 4, light: "RED", title: "Do not get cute", call: "Long downhill par 3. Use the ground option and do not miss long unless you enjoy hostage negotiations." },
  { hole: 5, light: "GREEN", title: "Permission to be stupid — conditionally", call: "Short, drivable par 4. One safe ball first. THEN release the gorillas." },
  { hole: 6, light: "GREEN", title: "Birdie without a cape", call: "Downhill par 5. Favor the sensible side, take the free roll and make five feel disappointing." },
  { hole: 7, light: "YELLOW", title: "Looks tighter than it is", call: "There is more room right than your eyeballs report. Play the hole, not the optical illusion." },
  { hole: 8, light: "RED", title: "Net par has entered the chat", call: "Legit long par 4. Two boring shots beat one heroic double. Especially with a pop." },
  { hole: 9, light: "GREEN", title: "Use the furniture", call: "Short par 3. Use the slope instead of firing directly at every flag like a labrador chasing a tennis ball." },
  { hole: 10, light: "RED", title: "The ego detector", call: "One of the toughest holes on the property. Fairway. Green-ish. Two putts. Nobody needs a documentary." },
  { hole: 11, light: "YELLOW", title: "Center is sexy now", call: "Short par 3. Middle of green. Take the par and keep your emotional support wedge in the bag." },
  { hole: 12, light: "GREEN", title: "NUCLEAR GREEN", call: "Real par-5 scoring chance. Secure one, then attack the route that shortens the second. This is where we collect rent." },
  { hole: 13, light: "YELLOW", title: "Angle > testosterone", call: "Aggressive line can improve the angle. If the match does not require it, quit auditioning for YouTube." },
  { hole: 14, light: "RED", title: "Downhill liar", call: "It runs forever into a huge contoured green. The card says opportunity; the contours say calm down, Kevin." },
  { hole: 15, light: "YELLOW", title: "Trust the landing zone", call: "Blind tee look, generous beyond the ridge. Favor the useful side and avoid the bunker that eats optimism." },
  { hole: 16, light: "RED", title: "Elevation math, not vibes", call: "Downhill par 3. Adjust the number. Middle green. Nobody gets extra points for flying it pin-high into another zip code." },
  { hole: 17, light: "YELLOW", title: "Pin decides the lane", call: "Favor the side that gives the sightline and angle. Let the pin sheet make the decision, not your last swing." },
  { hole: 18, light: "GREEN", title: "Finish with violence", call: "Drivable for plenty of guys, but right is the tax office. One ball safe left, then SEND THE OTHER ONE." },
] as const;

const FORMAT_ORDERS = [
  {
    title: "Fourball",
    badge: "80%",
    law: "STABILITY + POPS",
    copy: "Do not pair two pyromaniacs and then act surprised when the garage is on fire. One player establishes a score. The other gets permission to hunt.",
    order: "Safe ball first → score exists → dangerous man commits controlled felony.",
  },
  {
    title: "Shamble",
    badge: "75%",
    law: "ANGLE BEATS DISTANCE",
    copy: "The longest drive is not automatically the best drive. Flat lie, correct green entrance and next-shot comfort can beat 25 extra yards on a ski slope.",
    order: "Lie + angle + green entrance + comfort → distance comes fourth.",
  },
  {
    title: "2v2 Scramble",
    badge: "35/15",
    law: "EARN PERMISSION",
    copy: "One adult puts a ball on planet Earth. After that, increase aggression. Four simultaneous hero swings is not strategy; it is a missing-persons report.",
    order: "Secure → improve → attack. Do not reverse those words.",
  },
  {
    title: "Singles",
    badge: "80%",
    law: "MAKE THEM BEAT NET PAR",
    copy: "The goal is not a career round. Center green, two putts, use the pop, and make the other guy actually produce golf shots under pressure.",
    order: "No rescue ball. No emotional carryover. Lost hole = one hole, not a Netflix series.",
  },
] as const;

const PRACTICE = [
  ["Lag putting", "20–60 feet. The first job is deleting three-putts from the tournament."],
  ["4–8 footers", "Make enough of these that the opponent starts saying ‘good-good?’ from uncomfortable distances."],
  ["Putter / hybrid / 8-iron off tight turf", "Gamble and Scarecrow reward ground golf. Loft is a tool, not a personality."],
  ["Wedges inside ~120", "Know one stock number and one flighted number. This is not the week to discover twelve new trajectories."],
  ["One stock tee ball", "No swing rebuild. Find the ball that starts where you expect and ends somewhere mowed."],
] as const;

const FILM = [
  {
    title: "Every Shot at Scarecrow",
    why: "Best single watch. Study where shots LAND versus where they FINISH. That difference is the whole damn course.",
    href: "https://www.youtube.com/watch?v=4WIYsj_N5TA",
    label: "WATCH · YOUTUBE",
  },
  {
    title: "Growing Gamble — Part 7: Comparisons",
    why: "Fast way to understand why Scarecrow is not just Gamble Sands with a different logo.",
    href: "https://www.youtube.com/watch?v=7k-U2V1rps0",
    label: "WATCH · YOUTUBE",
  },
  {
    title: "PJ Koenig — Every Hole at Scarecrow",
    why: "Hole-by-hole architecture walkthrough. Great bathroom reading if your bathroom visits are apparently 40 minutes long.",
    href: "https://www.pjkoenig.com/golf-blog/2025/6/30/gamble-sands-has-fully-arrived",
    label: "READ · HOLE BY HOLE",
  },
  {
    title: "David McLay Kidd — How to Play Gamble Sands",
    why: "The architect explaining his own traps. Spoiler: your ego is featured heavily.",
    href: "https://thegolfnewsnet.com/golfgetaways/2019/01/16/talking-golfgetaways-127-david-mclay-kidd-gamble-sands-131434/",
    label: "READ / LISTEN · ARCHITECT",
  },
] as const;

function LightPill({ light }: { light: "GREEN" | "YELLOW" | "RED" }) {
  const style = light === "GREEN"
    ? "bg-emerald-700 text-white"
    : light === "YELLOW"
      ? "bg-amber-400 text-[#261900]"
      : "bg-rose-700 text-white";
  return <span className={`rounded-full px-2.5 py-1 text-[9px] font-black tracking-[0.16em] ${style}`}>{light}</span>;
}

export default function WinningBlueprint() {
  return (
    <section id="win-plan" className="bg-[#0b211c] px-4 py-10 text-white sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#efbd88]">WIX WIN PLAN · STRAND WEEK</p>
            <h2 className="mt-2 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Selective violence.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              Gamble Sands gives you room and then whispers, “You could probably carry that.” That voice is a fucking liar. We attack the holes that deserve it, bore the opponent to death everywhere else, and make our pops feel illegal.
            </p>
          </div>
          <Link href="#caddie" className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#efbd88] px-5 py-3 text-[10px] font-black uppercase tracking-[0.17em] text-[#10201b] transition hover:scale-[1.02]">
            Open live caddie ↓
          </Link>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-2">
          <article className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 sm:p-6">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">Gamble Sands</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">The invitation to score.</h3>
            <p className="mt-3 text-sm leading-6 text-white/62">Wide, firm, fast and built to use slopes. You do not need to overpower it. Pick landing spots, use the floor and make the architect watch us refuse every stupid invitation.</p>
            <div className="mt-4 rounded-2xl bg-black/20 p-4 text-sm font-semibold leading-6 text-[#f6d6b5]">Money stretch: 14–17. If you are 1-up entering 14, the opponent must be the first person to do something stupid.</div>
          </article>
          <article className="rounded-[1.7rem] border border-[#efbd88]/25 bg-[#efbd88]/[0.07] p-5 sm:p-6">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#efbd88]">Scarecrow</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Same uncle. Somebody gave him cocaine.</h3>
            <p className="mt-3 text-sm leading-6 text-white/62">Still wide, but more elevation, smaller targets, more internal contour and more blind-ish decisions. Ground control matters. Scarecrow does not demand perfect golf; it demands that you stop donating doubles.</p>
            <div className="mt-4 rounded-2xl bg-black/20 p-4 text-sm font-semibold leading-6 text-[#f6d6b5]">Memorize 2, 10 and 14 as danger holes. Circle 3, 5, 6, 12 and 18 as collection windows.</div>
          </article>
        </div>

        <div className="mt-8 rounded-[1.8rem] border border-white/10 bg-white/[0.045] p-5 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#efbd88]">Scarecrow traffic lights</p>
              <h3 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">18 holes. One job per hole.</h3>
            </div>
            <p className="max-w-md text-xs leading-5 text-white/45">Green = collect. Yellow = earn it. Red = remove the double and move along like a functioning adult.</p>
          </div>
          <div className="mt-5 grid gap-2 lg:grid-cols-2">
            {SCARECROW_LIGHTS.map((item) => (
              <details key={item.hole} className="group rounded-2xl border border-white/8 bg-black/15 open:bg-black/25">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/8 text-sm font-black">{item.hole}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><LightPill light={item.light} /><span className="text-sm font-bold">{item.title}</span></div>
                  </div>
                  <span className="text-white/30 transition group-open:rotate-45">+</span>
                </summary>
                <p className="px-4 pb-4 pl-16 text-sm leading-6 text-white/58">{item.call}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#efbd88]">Format orders</p>
          <h3 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">Different game. Different level of stupidity allowed.</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {FORMAT_ORDERS.map((item) => (
              <article key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5">
                <div className="flex items-center justify-between gap-3"><h4 className="text-xl font-bold">{item.title}</h4><span className="rounded-full bg-white/8 px-3 py-1 text-[9px] font-black tracking-[0.16em] text-white/60">{item.badge}</span></div>
                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">{item.law}</p>
                <p className="mt-2 text-sm leading-6 text-white/60">{item.copy}</p>
                <p className="mt-3 rounded-xl bg-black/20 p-3 text-xs font-bold leading-5 text-[#f6d6b5]">{item.order}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-3 lg:grid-cols-2">
          <article className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-5 sm:p-6">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#efbd88]">Rules edge</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Know the weird stuff before J-Bone learns it.</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/62">
              <li><strong className="text-white">Waste sand:</strong> the sandy areas are general-area waste areas under the resort local rules. Ground the club, rehearse the swing, move loose impediments. We are not at Augusta.</li>
              <li><strong className="text-white">Desert edge:</strong> maintained turf defines the useful playing area; desert areas are treated as red penalty areas under the local rules. Take the relief you are entitled to and quit holding up America.</li>
              <li><strong className="text-white">Fourball order:</strong> partners can play in the order the side decides. Use the first shot as information. Safe ball first is a strategy, not cowardice.</li>
              <li><strong className="text-white">Concessions:</strong> once given, they are final. Also: after your stroke is conceded, do not casually finish it to show your partner the line. That can create a rules problem. Admire your imaginary make privately.</li>
            </ul>
          </article>

          <article className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-5 sm:p-6">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#efbd88]">Cart commandments</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Three laws. Tattoo optional.</h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-black/20 p-4"><span className="text-[9px] font-black tracking-[0.17em] text-emerald-300">LAW 01</span><p className="mt-1 font-bold">The scorecard does not know how far the ball will roll.</p></div>
              <div className="rounded-2xl bg-black/20 p-4"><span className="text-[9px] font-black tracking-[0.17em] text-emerald-300">LAW 02</span><p className="mt-1 font-bold">The safe side is often designed to feed the ball toward the hole.</p></div>
              <div className="rounded-2xl bg-black/20 p-4"><span className="text-[9px] font-black tracking-[0.17em] text-emerald-300">LAW 03</span><p className="mt-1 font-bold">Your strokes are part of your equipment. Use the damn things.</p></div>
            </div>
          </article>
        </div>

        <div className="mt-8 grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
          <article className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-5 sm:p-6">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#efbd88]">Practice before wheels up</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">No swing rebuilds. We are out of time, professor.</h3>
            <div className="mt-4 divide-y divide-white/8">
              {PRACTICE.map(([title, copy]) => (
                <div key={title} className="py-3 first:pt-0"><p className="text-sm font-bold text-white">{title}</p><p className="mt-1 text-xs leading-5 text-white/48">{copy}</p></div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-[#efbd88] p-4 text-[#10201b]">
              <p className="text-[9px] font-black uppercase tracking-[0.17em]">First property session</p>
              <p className="mt-1 text-sm font-black leading-6">Answer only three things: How far is driver actually running? How fast are the greens? How much does a ball landing short release?</p>
            </div>
          </article>

          <article className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-5 sm:p-6">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#efbd88]">The underrated weapon</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Putt it from places your ego says require a wedge.</h3>
            <p className="mt-3 text-sm leading-6 text-white/60">Spend time with putter, hybrid and 8-iron from 5–25 yards off the green. These courses reward the ground. If somebody grabs 60° from a tight lie with forty feet of green, the team is authorized to conduct an intervention.</p>
            <div className="mt-5 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.07] p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.17em] text-emerald-300">Team scoring thought</p>
              <p className="mt-1 text-sm font-bold leading-6">Bogey with a stroke is not “surviving.” It is identity theft. Take the net par, shake hands and keep stealing wallets.</p>
            </div>
          </article>
        </div>

        <div className="mt-8 rounded-[1.8rem] border border-white/10 bg-white/[0.045] p-5 sm:p-7">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#efbd88]">Film room</p>
          <h3 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">Watch these. Not fourteen hours of random YouTube.</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {FILM.map((item) => (
              <a key={item.title} href={item.href} target="_blank" rel="noreferrer" className="group rounded-2xl border border-white/10 bg-black/15 p-4 transition hover:-translate-y-0.5 hover:border-[#efbd88]/35 hover:bg-black/25">
                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-300">{item.label}</span>
                <h4 className="mt-1 text-base font-bold group-hover:text-[#efbd88]">{item.title} ↗</h4>
                <p className="mt-2 text-xs leading-5 text-white/48">{item.why}</p>
              </a>
            ))}
          </div>
        </div>

        <blockquote className="mt-8 rounded-[1.8rem] bg-[#efbd88] p-6 text-[#10201b] sm:p-8">
          <p className="text-[9px] font-black uppercase tracking-[0.2em]">Captain WIX</p>
          <p className="mt-2 max-w-4xl text-2xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">“When it’s green light, attack. When it isn’t, make the boring par, collect the pop, laugh at the other idiot standing in the desert and move to the next tee.”</p>
          <p className="mt-4 text-sm font-bold">Putting. No doubles. Know your strokes. One ball safe before anybody auditions for the PGA Tour.</p>
        </blockquote>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold text-white/32">
          <a href="https://www.gamblesands.com/" target="_blank" rel="noreferrer" className="hover:text-white/70">Official Gamble Sands ↗</a>
          <a href="https://www.gamblesands.com/wp-content/uploads/2025/07/SC-Final-Proof.pdf" target="_blank" rel="noreferrer" className="hover:text-white/70">Official Scarecrow card / local rules ↗</a>
          <a href="https://www.golfdigest.com/story/best-new-public-course-2025-gamble-sands-scarecrow" target="_blank" rel="noreferrer" className="hover:text-white/70">Golf Digest architecture ↗</a>
          <a href="https://www.usga.org/content/usga/home-page/rules-hub/topics/four-ball.html" target="_blank" rel="noreferrer" className="hover:text-white/70">USGA Four-Ball rules ↗</a>
        </div>
      </div>
    </section>
  );
}
