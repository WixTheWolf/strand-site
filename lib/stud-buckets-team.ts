export interface TeammateJob {
  title: string;
  mission: string;
  lockerRoom: string;
}

export const STUD_BUCKETS_JOBS: Record<string, TeammateJob> = {
  "matt-wixted": {
    title: "The Air-Traffic Controller",
    mission: "Keep the match clear, the boys loose and the pairings sharp. Then go win your own ball.",
    lockerRoom: "Captain, caddie, accountant. The blame department opens after the round.",
  },
  "andrew-mager": {
    title: "The Adult in the Room",
    mission: "Be the gross-par anchor. Cover the attack ball and make them earn everything.",
    lockerRoom: "Every group needs one scorecard that doesn’t look like a Wi‑Fi password.",
  },
  "jordan-brodbeck": {
    title: "The Swiss Army Brewer",
    mission: "Fit anywhere. Steady the pairing and own a middle-board Singles match.",
    lockerRoom: "Useful everywhere—and probably carrying something TSA should have found.",
  },
  "nick-sprowls": {
    title: "The Sleeping Giant",
    mission: "Find the vintage gear. Turn 16.9 into net pressure all weekend.",
    lockerRoom: "If old Nick wakes up, hand him the scorecard and back away slowly.",
  },
  "jack-groot": {
    title: "The International Man of Fairway",
    mission: "Stay patient when firm turf, wind and strange sightlines get weird.",
    lockerRoom: "He knows “swing harder” is rarely the answer. Rare maturity.",
  },
  "sam-blonski": {
    title: "The Net ATM",
    mission: "Make bogey golf expensive. A stroke turns steady into infuriating.",
    lockerRoom: "Bogey plus a pop: the least glamorous birdie in golf.",
  },
  "nick-kane": {
    title: "The Garmin Workhorse",
    mission: "Bring 120 rounds of reps and hot-putter upside beside a steady ball.",
    lockerRoom: "Garmin confirms he is always golfing. His family may confirm the same.",
  },
  "pat-morse": {
    title: "The Stroke-Hole Bandit",
    mission: "Use every pop. Turn bogeys into net pars and mid-90s form into stolen holes.",
    lockerRoom: "P‑MO is here to commit legal robbery, one stroke hole at a time.",
  },
  "tim-hummel": {
    title: "The Veteran Thief",
    mission: "Stay calm. Use experience to steal holes they already counted.",
    lockerRoom: "The quietest way to get two up is letting the other team beat itself.",
  },
  "rhett-fahrney": {
    title: "The Undefeated Mystery",
    mission: "Keep it simple. Trust the three-trip, three-win DNA.",
    lockerRoom: "No current film. Three wins. Scouting report: let him cook.",
  },
};

export const STUD_BUCKETS_GOLD = [
  {
    title: "Grass before glory",
    tip: "One ball in play. Then somebody can get brave.",
  },
  {
    title: "The flag is a suggestion",
    tip: "Center green pays. Short-sided hero golf does not.",
  },
  {
    title: "Use the floor",
    tip: "Front open? Use putter, hybrid or low iron. The ground is free.",
  },
  {
    title: "Know your pops",
    tip: "Know every stroke hole before you tee off.",
  },
  {
    title: "Say the match out loud",
    tip: "Confirm front, back and overall every three holes. No beer math.",
  },
  {
    title: "Sand is waste",
    tip: "Ground the club, rehearse the swing and get on with it.",
  },
  {
    title: "Make them finish",
    tip: "A visible par changes their decisions. Keep the ball alive.",
  },
  {
    title: "Leave it there",
    tip: "A bad hole ends at the next tee.",
  },
  {
    title: "Fuel before ugly",
    tip: "Eat and drink before your swing gets weird.",
  },
  {
    title: "Pretty is optional",
    tip: "One-up is beautiful. Put the point away.",
  },
] as const;

export function teammateJob(playerId: string): TeammateJob {
  return STUD_BUCKETS_JOBS[playerId] ?? {
    title: "The Point Collector",
    mission: "Make committed decisions, keep the ball alive and force the opponent to earn every hole.",
    lockerRoom: "The job description is simple: fewer disasters, more points, better stories afterward.",
  };
}
