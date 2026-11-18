/**
 * Pre-draft scouting card — WIX's committed plan for the 2026 captain draft.
 *
 * Generated from the Strand Sabr board run against the live production
 * payload on draft day (327 scorecards + Garmin aggregate, 20/20 event
 * handicaps locked to the roster sheet). Static by design: the war room
 * re-ranks live, this page is the plan of record going in.
 */

export const PLAN_META = {
  model: "Strand Sabr v3.4",
  dataThrough: "2026-07-23 4:56 PM PT",
  summary:
    "J-BONE owns the odds, WIX owns the evens. The board has two elite tiers " +
    "(FRED/DREW), a deep steady middle, and real net-leverage value late — so " +
    "the winning even-pick strategy is: take the elite survivor at 2, lock the " +
    "lowest-variance mid at 4, then beat the room to P-MO's high-confidence " +
    "singles value before the market catches up.",
};

export interface PlanRound {
  pick: number;
  primary: string;
  rationale: string;
  fallbacks: string;
  context: string;
}

export const PICK_PLAN: PlanRound[] = [
  {
    pick: 2,
    primary: "FRED (7.7) — or DREW if J-BONE takes Fred",
    rationale:
      "Simple survivor rule. Fred edges Drew on the board (58.7 vs 57.9): 38 fresh rounds through July 14, " +
      "a +1.8-stroke upward trend, and Medium-High confidence, where Drew's 5.6 rests on five rounds. " +
      "Model impact: +6.6 win-probability points over a median pick — the biggest single swing of the draft.",
    fallbacks: "DREW → NICK (see trap note) → TONY SCHROE",
    context: "Whatever J-BONE opens with, one of Fred/Drew survives to you.",
  },
  {
    pick: 4,
    primary: "TONY SCHROE (13.3)",
    rationale:
      "The steadiest card in the field — five straight rounds 86-88, volatility 0.7 (next-best is 1.8). " +
      "In 3-point match play, a player who never posts the blow-up round wins segments by attrition. " +
      "Anchors fourball and singles.",
    fallbacks: "JACK (+2.6 trend, 32 rounds) → GORD (High confidence, 38 rounds)",
    context: "The 13-16 index tier (SCHROE/JACK/GORD/NICK) thins out fast here.",
  },
  {
    pick: 6,
    primary: "P-MO (24.8)",
    rationale:
      "The value pick of the draft. Nobody prices a 24.8, but he has the single best singles projection on " +
      "the board: 40 rounds (most in the field), High confidence, +2.5 upward trend, and full net-stroke " +
      "leverage that the 80% singles allowance barely trims. The model slots him here ahead of names the " +
      "room will call first.",
    fallbacks: "JACK or GORD (whoever survived 5) → D'ARCY",
    context: "Feels early to the room — that's exactly why it works. He won't reach pick 10.",
  },
  {
    pick: 8,
    primary: "D'ARCY (12.4)",
    rationale:
      "Last of the low-teens indexes. Thin data (five rounds) caps the model's confidence, but the skill tier " +
      "is real and every remaining alternative is 18+. Pairs with P-MO for the shamble's low/high spread.",
    fallbacks: "GORD/JACK leftovers → HUMMEL",
    context: "After this pick there are no single-digit-to-low-teens players left.",
  },
  {
    pick: 10,
    primary: "JASON (20.5)",
    rationale:
      "Quietly trending +2.0 with 20 rounds of history and manageable volatility. Better singles projection " +
      "than anything else left in the teens-to-low-20s band.",
    fallbacks: "HUMMEL (better index, cooling -3.1) → BLONSKI (steady but thin)",
    context: "Middle rounds are about floor, not ceiling.",
  },
  {
    pick: 12,
    primary: "SHAUN (19.5)",
    rationale:
      "Stale record (last verified round June 2024) but a fair index and no red flags. Take the index value " +
      "and give him low-pressure format slots at The Matchmaker.",
    fallbacks: "BLONSKI → KEV (7.1-stroke heater, but volatility 6.2 — coin flip)",
    context: "If KEV's heater is real he outplays this slot; if not, Shaun's floor is safer.",
  },
  {
    pick: 14,
    primary: "MATTY O. (25, plays capped)",
    rationale:
      "The cap costs him 3.0 net strokes a round, which is why he falls this far — but at pick 14 the " +
      "discount is fully priced. Hide him in the scramble (his forfeited strokes only count 15% there) and " +
      "fourball, keep him out of singles leverage spots.",
    fallbacks: "KEV → KANE",
    context: "High-confidence data (11 rounds), known quantity, just capped.",
  },
  {
    pick: 16,
    primary: "KANE (22.5)",
    rationale:
      "Garmin aggregate (+27 avg over 18, last 10) squares with the 22.5 sheet index, so the number is " +
      "honest even without scorecards. Straight index value this late.",
    fallbacks: "KERNS → RHETT",
    context: "Everything from here is roster fill — take the honest indexes.",
  },
  {
    pick: 18,
    primary: "KERNS (18.5)",
    rationale:
      "Best index left on the board at the last pick, plus the one scouted skill that matters in team " +
      "formats: a reliable driver. That plays in shamble and scramble even with zero posted scores.",
    fallbacks: "RHETT (24.5, zero data) — the only other card left",
    context: "An 18.5 at pick 18 is found money regardless of sample size.",
  },
];

export interface PlayerRead {
  nickname: string;
  index: string;
  tier: "take-now" | "target" | "value" | "late" | "avoid";
  headline: string;
  capsule: string;
}

export const PLAYER_READS: PlayerRead[] = [
  {
    nickname: "FRED",
    index: "7.7",
    tier: "take-now",
    headline: "Board #1 — elite index, deep fresh sample",
    capsule:
      "38 rounds through July 14, +1.8 upward trend, weighted form 11.2. The rare combination of elite index " +
      "and real evidence. Best fourball anchor in the field. Take him the second he's available.",
  },
  {
    nickname: "DREW",
    index: "5.6",
    tier: "take-now",
    headline: "Best raw golfer, thinnest elite sample",
    capsule:
      "Lowest index in the field and low variance in the five rounds we have (vol 1.8) — but it is only five " +
      "rounds, so confidence is Low. Still a top-two pick on skill alone; scratch-tier gross game travels to " +
      "any format.",
  },
  {
    nickname: "NICK",
    index: "16.9",
    tier: "target",
    headline: "Model darling with a 20-month blind spot",
    capsule:
      "The board loves him (57.6, third overall): his 16.9 event index sits ~2 strokes above his old posted " +
      "form, a big projected net edge. The catch — his last verified round is November 2024. If J-BONE takes " +
      "him early, don't chase; the edge rests entirely on stale data.",
  },
  {
    nickname: "TONY SCHROE",
    index: "13.3",
    tier: "target",
    headline: "The metronome",
    capsule:
      "86-87-87-86-88 in his last five — volatility 0.7, by far the steadiest card in the draft. Match play " +
      "pays consistency; he never hands your opponent a segment. Priority target at pick 4.",
  },
  {
    nickname: "JACK",
    index: "15.8",
    tier: "target",
    headline: "Trending hard in the right direction",
    capsule:
      "32 rounds, +2.6-stroke upward trend, +0.9 projected net edge — playing meaningfully better than 15.8 " +
      "right now. Great pick-4 fallback and a steal if he reaches pick 6.",
  },
  {
    nickname: "GORD",
    index: "14.4",
    tier: "target",
    headline: "High-confidence, no-surprises mid",
    capsule:
      "38 rounds, High confidence, +2.3 trend. The model's most trustworthy mid-tier read. WWGD applies: " +
      "he does the sensible thing, every hole.",
  },
  {
    nickname: "P-MO",
    index: "24.8",
    tier: "value",
    headline: "Draft's best value — singles assassin at a big number",
    capsule:
      "40 rounds (most in the field), High confidence, +2.5 upward trend, and the best singles projection on " +
      "the board once net strokes are applied. The room will let him sit because of the 24.8; the model says " +
      "take him at 6 and grin.",
  },
  {
    nickname: "D'ARCY",
    index: "12.4",
    tier: "value",
    headline: "Last low-teens card in the deck",
    capsule:
      "Only five rounds of evidence, but the skill tier is real and the index matches WIX's own. Whoever " +
      "takes him owns the final low-teens slot; everything after is 18+.",
  },
  {
    nickname: "HUMMEL",
    index: "18.8",
    tier: "value",
    headline: "Fair index, cooling form",
    capsule:
      "17 rounds but trending -3.1 and stale since April. Fine mid-round floor; don't reach. The index is " +
      "honest, the momentum isn't.",
  },
  {
    nickname: "JASON",
    index: "20.5",
    tier: "value",
    headline: "Sneaky-solid, trending up",
    capsule:
      "20 rounds, +2.0 trend, volatility under 4. The best of the low-20s band and a comfortable pick-10 " +
      "target with real singles utility.",
  },
  {
    nickname: "BLONSKI",
    index: "24.5",
    tier: "late",
    headline: "Steady in a small window",
    capsule:
      "Five rounds, volatility 1.8 — consistent when he posts. Index matches his GHIN record. Reasonable " +
      "pick 12-16 fill with shamble utility from the net side.",
  },
  {
    nickname: "SHAUN",
    index: "19.5",
    tier: "late",
    headline: "Good number, old evidence",
    capsule:
      "Last verified round June 2024 and slightly below-index form back then. The 19.5 is fair value late; " +
      "just slot him where variance hurts least.",
  },
  {
    nickname: "BRETT",
    index: "24.5",
    tier: "late",
    headline: "Known quantity, cooling",
    capsule:
      "15 rounds, High confidence, trending -2.9. The data is trustworthy and says exactly what the index " +
      "says: a 24.5 who won't surprise you in either direction.",
  },
  {
    nickname: "KEV",
    index: "19.5",
    tier: "late",
    headline: "The lottery ticket",
    capsule:
      "A +7.1-stroke heater over his last five — biggest positive trend in the field — but volatility 6.2 is " +
      "also the field's wildest. If you're behind on talent at pick 12, he's the swing; if you're ahead, pass.",
  },
  {
    nickname: "KANE",
    index: "22.5",
    tier: "late",
    headline: "Garmin says the number is honest",
    capsule:
      "No scorecards, but his Garmin last-10 aggregate (+27 over 18) squares with a 22.5. Straight index " +
      "value at pick 16 with no evidence of hidden upside or downside.",
  },
  {
    nickname: "MATTY O.",
    index: "25 (raw 28)",
    tier: "avoid",
    headline: "Cap tax: -3.0 net strokes a round",
    capsule:
      "Scores like a 28, receives 25 strokes — he gives back three per round before teeing off, and his form " +
      "is trending the wrong way. Only draftable in the last third, and only for scramble/fourball where the " +
      "forfeited strokes matter least. Never in a singles leverage spot.",
  },
  {
    nickname: "KERNS",
    index: "18.5",
    tier: "late",
    headline: "Zero scores, one scouted weapon",
    capsule:
      "No posted rounds (four reported 2026 rounds, scores unavailable), but captain-scouted as a reliable " +
      "driver — which plays directly in shamble and scramble. An 18.5 at the final pick is the board's " +
      "cheapest fair index.",
  },
  {
    nickname: "RHETT",
    index: "24.5",
    tier: "late",
    headline: "The blank card",
    capsule:
      "No rounds, no aggregate, no scouting — just the sheet number. Draft him last and let The Matchmaker " +
      "protect him.",
  },
];
