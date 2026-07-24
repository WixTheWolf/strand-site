export type CaptainPlayer = {
  id: string;
  name: string;
  nickname: string;
  role: string;
  headline: string;
  mission: string;
  strengths: string[];
  prep: string[];
  formats: Record<"Fourball" | "Shamble" | "Scramble" | "Singles", string>;
  note: string;
};

export const CAPTAIN_PLAYERS: CaptainPlayer[] = [
  {
    id: "andrew-mager", name: "Andrew Mager", nickname: "Mager", role: "The Adult in the Room",
    headline: "Fairways, gross pars, and emotional stability.",
    mission: "Be the dependable ball that lets an aggressive partner breathe. Make the other team beat real golf instead of collecting donated holes.",
    strengths: ["Reliable gross scoring", "Calm decisions", "Partner insurance"],
    prep: ["Play two rounds with a committed tee target on every hole.", "Own one stock 30–70 yard wedge flight.", "Finish each practice with ten straight 4-footers."],
    formats: { Fourball: "Post the first useful score and free your partner up.", Shamble: "Secure position before attacking.", Scramble: "Own the safe first ball and the pressure putt.", Singles: "Make pars boring and force impatience." },
    note: "You are the seatbelt. Nobody celebrates it until the cart starts rolling downhill."
  },
  {
    id: "jordan-brodbeck", name: "Jordan Brodbeck", nickname: "Jordan", role: "The Swiss Army Bucket",
    headline: "Useful everywhere. Dangerous when the match gets weird.",
    mission: "Bring complete mid-cap golf to every format, stabilize a high-stroke partner, and own a meaningful Singles match.",
    strengths: ["Format flexibility", "Balanced scoring", "Singles value"],
    prep: ["Split practice between driver, wedges, and putting.", "Play one nine-hole match against your handicap.", "Build one reliable recovery shot."],
    formats: { Fourball: "Steady when needed; aggressive when covered.", Shamble: "Turn good drives into green-light approaches.", Scramble: "Fill the skill gap your partner does not cover.", Singles: "Stay patient; versatility wins over 18." },
    note: "Solve problems before the rest of us realize they are problems."
  },
  {
    id: "nick-sprowls", name: "Nick Sprowls", nickname: "Sprowls", role: "The Sleeping Giant",
    headline: "The good golf is already in there. Wake it up on purpose.",
    mission: "Find the lower-differential gear already proven in your history and turn your event number into relentless net pressure.",
    strengths: ["High ceiling", "Net scoring upside", "Momentum golf"],
    prep: ["Track only fairways, penalties, and three-putts.", "Choose one driver shape and commit to it.", "Lag putt from 30, 45, and 60 feet."],
    formats: { Fourball: "Stay alive early; your hot stretch will come.", Shamble: "Use the best drive and play boring golf into huge greens.", Scramble: "Swing freely after a ball is secured.", Singles: "Do not chase; let your strokes apply pressure." },
    note: "Vintage Nick needs a target, a breath, and permission to go."
  },
  {
    id: "jack-groot", name: "Jack Groot", nickname: "Groot", role: "The Passport",
    headline: "Destination-course patience with zero sightseeing swings.",
    mission: "Use experience on unfamiliar courses to stay patient when firm turf, wind, and massive sightlines start lying to everyone.",
    strengths: ["Travel-golf experience", "Course patience", "Adaptability"],
    prep: ["Practice knockdown approaches.", "Putt from off the green.", "Rehearse conservative targets to wide green sections."],
    formats: { Fourball: "Keep your partner grounded when visuals get dramatic.", Shamble: "Use width and avoid forcing angles.", Scramble: "Be the course-reader and distance confirmer.", Singles: "Win the patience contest." },
    note: "You have seen enough strange golf to know the answer is rarely swing harder."
  },
  {
    id: "sam-blonski", name: "Sam Blonski", nickname: "Sam", role: "The Net ATM",
    headline: "Steady bogeys become deeply annoying net pars.",
    mission: "Use every stroke, keep doubles off the card, and make opponents feel like they are losing to basic arithmetic.",
    strengths: ["Stroke value", "Steady bogey golf", "Partner pressure"],
    prep: ["Know every stroke hole before arriving.", "Practice punch-outs and 20–40 yard recoveries.", "Train lag putting to eliminate three-putts."],
    formats: { Fourball: "Never pick up early; bogey may already win.", Shamble: "Advance it cleanly and use your pops.", Scramble: "Contribute playable drives and committed first putts.", Singles: "Bogey, net par, repeat." },
    note: "Bogey is legal tender when it comes with a stroke."
  },
  {
    id: "nick-kane", name: "Nick Kane", nickname: "Kane", role: "The Wild Card",
    headline: "Volume, experience, and a putter capable of theft.",
    mission: "Turn your enormous round volume into pattern recognition, then weaponize your hot-putter upside beside a dependable ball.",
    strengths: ["Course experience", "Putting upside", "Stroke value"],
    prep: ["Identify the one driver miss you will accept.", "Practice 6–12 foot putts with consequence.", "Play one round with no hero shots after a miss."],
    formats: { Fourball: "Attack stroke holes and trust the putter.", Shamble: "Convert position instead of chasing perfection.", Scramble: "Be ready to close holes.", Singles: "Make the opponent watch you hole putts all day." },
    note: "The round count is evidence. Now turn it into points."
  },
  {
    id: "pat-morse", name: "Patrick Morse", nickname: "P-MO", role: "The Stroke-Hole Bandit",
    headline: "Ordinary bogeys. Extraordinary accounting.",
    mission: "Bring the fresh low-to-mid-90s form, take every available pop, and turn competent bogey golf into match-play robbery.",
    strengths: ["Recent form", "Net par creation", "Match-play value"],
    prep: ["Save your stroke allocation.", "Practice tee shots that finish in play.", "Spend half your short-game time on simple chips."],
    formats: { Fourball: "Keep playing until the hole is truly dead.", Shamble: "Protect against the big number.", Scramble: "Give the team a ball before chasing speed.", Singles: "Treat every stroke hole like an acquisition." },
    note: "A bogey with a stroke is basically a tax-free birdie."
  },
  {
    id: "tim-hummel", name: "Tim Hummel", nickname: "Tim", role: "The Veteran Thief",
    headline: "Calm decisions that quietly remove points from pockets.",
    mission: "Use Strand experience, composure, and your proven scoring ceiling to steal holes opponents assume belong to them.",
    strengths: ["Strand experience", "Match awareness", "Calm under pressure"],
    prep: ["Play one match-play round.", "Rehearse a reliable tee club below driver.", "Practice six-footers with a full routine."],
    formats: { Fourball: "Know when par is enough.", Shamble: "Choose the tee ball that creates the easiest next shot.", Scramble: "Own communication and pace.", Singles: "Let experience make the opponent feel rushed." },
    note: "You have seen this movie. Somebody else usually asks how they lost 2-and-1."
  },
  {
    id: "rhett-fahrney", name: "Rhett Fahrney", nickname: "Rhett", role: "The Undefeated Mystery",
    headline: "Championship pedigree with almost no scouting film.",
    mission: "Lean on winning experience, keep the assignment simple, and make limited current information work against the opponent.",
    strengths: ["Winning history", "Competitive instinct", "Low scouting visibility"],
    prep: ["Establish one stock tee shot and wedge number.", "Play enough golf to remove first-round rust.", "Practice getting the first putt to the hole."],
    formats: { Fourball: "Keep it simple and let the mystery work.", Shamble: "Commit to the selected ball.", Scramble: "Take clear assignments and swing freely.", Singles: "Compete first; diagnose later." },
    note: "Three trips, three wins, and almost no film. That is useful."
  }
];

export const TEAM_RULES = [
  ["One ball first", "Secure a playable ball before anybody auditions for a highlight reel."],
  ["Center green pays", "Short-sided hero golf is an expensive hobby."],
  ["Know your pops", "Your strokes are part of the equipment. Use them."],
  ["Say the match out loud", "Confirm front, back, and overall every three holes."],
  ["No emotional carryover", "A lost hole is one hole, not a documentary series."],
  ["Eat before ugly", "Hydrate and fuel before your swing starts folding."],
] as const;

export const READY_CHECK = [
  "Confirm travel and tee-time details", "Save course intel to phone", "Know stroke holes", "Pack warm and rain layers", "Bring sunscreen and lip balm", "Pack two gloves plus backup", "Mark golf balls clearly", "Pack electrolytes and food", "Charge rangefinder and phone", "Complete final easy practice"
] as const;
