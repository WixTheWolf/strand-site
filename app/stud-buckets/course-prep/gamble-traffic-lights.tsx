import Link from "next/link";

const GAMBLE_LIGHTS = [
  {
    hole: 1,
    light: "YELLOW",
    title: "Learn the damn rollout",
    call: "Wide opener. Pick a window, expect the ball to run like it owes somebody money, and accept the longer approach if it means grass.",
    format: "First match hole of the trip: boring tee ball > emotional archaeology in the desert.",
  },
  {
    hole: 2,
    light: "GREEN",
    title: "Choose your crime",
    call: "Right plateau is the adult route. Center-bunker line catches speed toward the green. Decide before you swing instead of changing religions over the ball.",
    format: "Partner safe right? Second ball gets permission to chase the green.",
  },
  {
    hole: 3,
    light: "RED",
    title: "Par 5 disguised as a hostage situation",
    call: "The green rejects near-misses. If you cannot actually finish on the surface in two, lay up to a full wedge and make a boring five.",
    format: "Three-shot par beats the heroic six that starts with ‘I thought I could get there.’",
  },
  {
    hole: 4,
    light: "GREEN",
    title: "Use the floor",
    call: "Front is open and the green falls away. Low iron, hybrid or even putter can be live. The sky is not mandatory.",
    format: "Show them the runner first. Make the other side decide whether they also own that shot.",
  },
  {
    hole: 5,
    light: "RED",
    title: "This is not where we get famous",
    call: "Play left for the clean angle. Long or right runs away fast. Center turf and a sane approach is the entire assignment.",
    format: "Par is pressure. Short-side hero golf is just volunteering for extra work.",
  },
  {
    hole: 6,
    light: "YELLOW",
    title: "Gravity is your caddie",
    call: "Ride the big right bank and let the slope feed the ball. Stop aiming directly at flags like the contour map personally offended you.",
    format: "Use the free slope unless the match actually requires a flag hunt.",
  },
  {
    hole: 7,
    light: "GREEN",
    title: "Grass first, violence second",
    call: "Ignore the seductive inside carry. Put the tee ball in grass, then attack this par 5 with the second shot.",
    format: "Safe drive keeps birdie alive. Desert drive keeps the beverage cart entertained.",
  },
  {
    hole: 8,
    light: "GREEN",
    title: "One right. One goes.",
    call: "Right is the safe route with a pitch. Direct is the birdie route using firm turf. This hole is why partner formats were invented.",
    format: "First ball finds the right side. Once that exists, release the lunatic.",
  },
  {
    hole: 9,
    light: "RED",
    title: "Par steals something here",
    call: "Tee it to the wide-left side short of the pinch. The uphill approach plays longer than your ego wants to admit.",
    format: "Make four or net four and walk away like you just shoplifted a television.",
  },
  {
    hole: 10,
    light: "YELLOW",
    title: "Center beats cute",
    call: "Carry the sand and hit the body of the green. The putting surface is already enough defense; do not manufacture another problem.",
    format: "Two-putt par is a perfectly legal way to ruin somebody’s morning.",
  },
  {
    hole: 11,
    light: "YELLOW",
    title: "Pick a lane before the waggle festival",
    call: "Wide left is safe. The tighter gap leaves wedge. Choose the lane before the swing and commit to the one you actually own.",
    format: "Press only if the match needs it. ‘I was feeling it’ is not match status.",
  },
  {
    hole: 12,
    light: "GREEN",
    title: "Aim right, feed left, collect rent",
    call: "If attacking, aim right of the green and let the slope feed the ball left. Use the architecture instead of fighting it.",
    format: "Safe ball first. Then green light. This is a real collection hole.",
  },
  {
    hole: 13,
    light: "GREEN",
    title: "Punchbowl payday",
    call: "Use the clubhouse line, cover the blind ridge and let the punchbowl do free labor. If the carry is not yours, lay up to a full number.",
    format: "Partner safe? Chase it. No safety net? Stop pretending you are on a highlight reel.",
  },
  {
    hole: 14,
    light: "YELLOW",
    title: "The beginning of the grown-man stretch",
    call: "Right is wide and easy. Left is harder but owns the better angle. Let the match decide how much risk you purchase.",
    format: "If we are 1-up, make THEM prove the left carry first.",
  },
  {
    hole: 15,
    light: "RED",
    title: "Start the gauntlet without setting yourself on fire",
    call: "Pick one tee-shot shape and aim at center turf. This hole does not need creativity; it needs your ball to remain employed.",
    format: "Ahead in the match? Hand the drama to the other team and watch what happens.",
  },
  {
    hole: 16,
    light: "RED",
    title: "Green first. Therapy later.",
    call: "Play to the body of the green. A back pin needs the full carry. Missing in the wrong place creates the exact recovery contest we are trying to avoid.",
    format: "Center green and two putts is not cowardice. It is point collection.",
  },
  {
    hole: 17,
    light: "RED",
    title: "The diagonal-sand ego exam",
    call: "Decide how much sand you can honestly cross, then favor grass. Deep sand can turn one brave thought into two additional golf swings.",
    format: "Take double off the table. Kidd literally designed this hole to see who lies to himself.",
  },
  {
    hole: 18,
    light: "GREEN",
    title: "Find the speed slot and finish the job",
    call: "Swing away. The speed slot can add yards, but the whole fairway works. Find grass, use the run and finish with committed golf.",
    format: "One safe ball. One chasing speed. If the match needs the hole, this is where we spend the ammunition.",
  },
] as const;

type Light = (typeof GAMBLE_LIGHTS)[number]["light"];

function LightPill({ light }: { light: Light }) {
  const style =
    light === "GREEN"
      ? "bg-emerald-700 text-white"
      : light === "YELLOW"
        ? "bg-amber-400 text-[#261900]"
        : "bg-rose-700 text-white";

  return (
    <span className={`rounded-full px-2.5 py-1 text-[9px] font-black tracking-[0.16em] ${style}`}>
      {light}
    </span>
  );
}

export default function GambleTrafficLights() {
  const green = GAMBLE_LIGHTS.filter((hole) => hole.light === "GREEN").length;
  const yellow = GAMBLE_LIGHTS.filter((hole) => hole.light === "YELLOW").length;
  const red = GAMBLE_LIGHTS.filter((hole) => hole.light === "RED").length;

  return (
    <section id="gamble-18" className="bg-[#102a23] px-4 py-10 text-white sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#efbd88]">Gamble Sands · all 18 rated</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">The original gets traffic lights too.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">
              GREEN means collect. YELLOW means use the architecture. RED means stop trying to become a story somebody tells at dinner.
            </p>
          </div>
          <Link
            href="#caddie"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#efbd88] px-5 py-3 text-[10px] font-black uppercase tracking-[0.17em] text-[#10201b] transition hover:scale-[1.02]"
          >
            Open live caddie ↓
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-lg">
          <div className="rounded-2xl bg-emerald-700/25 p-3"><div className="text-2xl font-black">{green}</div><div className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-300">Green</div></div>
          <div className="rounded-2xl bg-amber-400/12 p-3"><div className="text-2xl font-black">{yellow}</div><div className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-amber-300">Yellow</div></div>
          <div className="rounded-2xl bg-rose-700/20 p-3"><div className="text-2xl font-black">{red}</div><div className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-rose-300">Red</div></div>
        </div>

        <div className="mt-6 grid gap-2 lg:grid-cols-2">
          {GAMBLE_LIGHTS.map((item) => (
            <details key={item.hole} className="group rounded-2xl border border-white/8 bg-black/15 open:bg-black/25">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/8 text-sm font-black">{item.hole}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <LightPill light={item.light} />
                    <span className="text-sm font-bold">{item.title}</span>
                  </div>
                </div>
                <span className="text-white/30 transition group-open:rotate-45">+</span>
              </summary>
              <div className="space-y-2 px-4 pb-4 pl-16">
                <p className="text-sm leading-6 text-white/62">{item.call}</p>
                <p className="rounded-xl bg-white/[0.055] px-3 py-2 text-xs font-semibold leading-5 text-[#f6d6b5]">
                  <span className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-300">Match call · </span>
                  {item.format}
                </p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-[#efbd88]/20 bg-[#efbd88]/[0.07] p-5">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#efbd88]">WIX memory trick</p>
          <p className="mt-2 text-sm font-bold leading-6 text-white/85">
            ATTACK 2, 4, 7, 8, 12, 13, 18. Respect 3, 5, 9, 15, 16, 17. Everything else: use the slope, make par, and keep J-Bone waiting for the mistake that never arrives.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold text-white/34">
          <a href="https://www.gamblesands.com/gamble-sands/" target="_blank" rel="noreferrer" className="hover:text-white/70">Official Gamble Sands overview ↗</a>
          <a href="https://www.gamblesands.com/wp-content/uploads/2025/07/GS-Scorecard.pdf" target="_blank" rel="noreferrer" className="hover:text-white/70">Official scorecard ↗</a>
          <a href="https://thegolfnewsnet.com/golfgetaways/2019/01/16/talking-golfgetaways-127-david-mclay-kidd-gamble-sands-131434/" target="_blank" rel="noreferrer" className="hover:text-white/70">David McLay Kidd playing lesson ↗</a>
        </div>
      </div>
    </section>
  );
}
