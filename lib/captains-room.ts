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
    headline: "Fairways, gross pars, and the emotional range of a parking curb.",
    mission: "Be the dependable ball that lets an aggressive partner breathe. Make the other team beat actual golf instead of collecting free holes from our traveling circus.",
    strengths: ["Reliable gross scoring", "Calm decisions", "Partner insurance"],
    prep: ["Play two rounds with a committed tee target on every hole. 'Somewhere over there' is not a target.", "Own one stock 30–70 yard wedge flight that does not require divine intervention.", "Finish every practice with ten straight 4-footers. Restart if one lip-out causes a congressional hearing."],
    formats: { Fourball: "Post the first useful score so your partner can swing like he has no dependents.", Shamble: "Secure position before anybody begins manufacturing a disaster.", Scramble: "Own the safe first ball and the putt everyone suddenly becomes allergic to.", Singles: "Make pars boring and let the opponent slowly lose his mind." },
    note: "You are the seatbelt. Nobody celebrates a seatbelt until the cart is airborne and Kane is still holding a breakfast burrito."
  },
  {
    id: "jordan-brodbeck", name: "Jordan Brodbeck", nickname: "Jordan", role: "The Swiss Army Brewer",
    headline: "Useful everywhere, dangerous when opened, and somehow carrying three shots nobody knew we needed.",
    mission: "Bring complete mid-cap golf to every format, stabilize a high-stroke partner, and own a meaningful Singles match without turning every recovery shot into an episode of MythBusters.",
    strengths: ["Format flexibility", "Balanced scoring", "Singles value"],
    prep: ["Split practice between driver, wedges, and putting. Yes, all three. Revolutionary.", "Play one nine-hole match against your handicap and keep score like the IRS is watching.", "Build one reliable recovery shot for when the golf ball explores private property."],
    formats: { Fourball: "Steady when needed; aggressive only when somebody else has already located planet Earth.", Shamble: "Turn good drives into green-light approaches, not philosophical debates.", Scramble: "Fill the skill gap your partner does not cover. There will be several.", Singles: "Stay patient. Versatility wins after the other guy runs out of ideas and adjectives." },
    note: "Solve problems before the rest of us realize they are problems. Then pretend it was obvious so morale remains intact."
  },
  {
    id: "nick-sprowls", name: "Nick Sprowls", nickname: "Sprowls", role: "The Sleeping Giant",
    headline: "The good golf is in there. Unfortunately, it sometimes has the same business hours as the DMV.",
    mission: "Find the lower-differential gear already proven in your history and turn your event number into relentless net pressure. No hunting for a new swing between breakfast and the first tee.",
    strengths: ["High ceiling", "Net scoring upside", "Momentum golf"],
    prep: ["Track only fairways, penalties, and three-putts. We do not need a 14-column autopsy.", "Choose one driver shape and commit to it. Both directions is not versatility.", "Lag putt from 30, 45, and 60 feet until the second putt stops requiring a hostage negotiator."],
    formats: { Fourball: "Stay alive early; the hot stretch will come if you do not declare the round dead on hole three.", Shamble: "Use the best drive and play boring golf into enormous greens. Boring is sexy when it earns points.", Scramble: "Swing freely after a ball is secured. Before that, please locate the continent.", Singles: "Do not chase. Your strokes are already making the other guy uncomfortable." },
    note: "Vintage Nick needs a target, a breath, and somebody to confiscate the mid-round swing theory."
  },
  {
    id: "jack-groot", name: "Jack Groot", nickname: "Groot", role: "The Passport",
    headline: "Destination-course experience with a strict ban on sightseeing swings.",
    mission: "Use experience on unfamiliar courses to stay patient when firm turf, wind, and giant sightlines start lying to everyone like a realtor describing the neighborhood.",
    strengths: ["Travel-golf experience", "Course patience", "Adaptability"],
    prep: ["Practice knockdown approaches before the wind introduces itself with violence.", "Putt from off the green until using a wedge feels appropriately embarrassing.", "Rehearse conservative targets to wide green sections, also known as the parts without criminal intent."],
    formats: { Fourball: "Keep your partner grounded when the scenery starts making him feel artistic.", Shamble: "Use width and stop forcing angles that exist only in a video game.", Scramble: "Be the course-reader and distance confirmer. One captain per yardage conversation.", Singles: "Win the patience contest while the other guy attempts to overpower geography." },
    note: "You have seen enough strange golf holes to know the answer is rarely 'swing harder' and almost never 'hood a six-iron from the native area.'"
  },
  {
    id: "sam-blonski", name: "Sam Blonski", nickname: "Sam", role: "The Net ATM",
    headline: "Steady bogeys become deeply offensive net pars.",
    mission: "Use every stroke, keep doubles off the card, and make opponents feel like they are losing to a spreadsheet with a drinking problem.",
    strengths: ["Stroke value", "Steady bogey golf", "Partner pressure"],
    prep: ["Know every stroke hole before arriving. Finding out on the next tee is charity work.", "Practice punch-outs and 20–40 yard recoveries because trees are apparently part of the itinerary.", "Train lag putting until three-putts become rare enough to deserve a documentary."],
    formats: { Fourball: "Never pick up early; your ugly bogey may already be financially superior.", Shamble: "Advance it cleanly and use your pops like they were stolen fair and square.", Scramble: "Contribute playable drives and committed first putts. We are not asking for Renaissance art.", Singles: "Bogey, net par, repeat until the opponent starts checking the handicap sheet for fraud." },
    note: "Bogey is legal tender when it comes with a stroke. Please insert opponent and withdraw point."
  },
  {
    id: "nick-kane", name: "Nick Kane", nickname: "Kane", role: "The Wild Card",
    headline: "Round volume, dangerous putting, and a relationship with driver dispersion best described as complicated.",
    mission: "Turn your enormous round count into pattern recognition, then weaponize the hot putter beside a dependable ball. Experience only helps if we stop repeating the same felony.",
    strengths: ["Course experience", "Putting upside", "Stroke value"],
    prep: ["Identify the one driver miss you will accept. 'Surprise me' is not a strategy.", "Practice 6–12 foot putts with consequence until your putter becomes a public nuisance.", "Play one round with no hero shots after a miss. This may require adult supervision."],
    formats: { Fourball: "Attack stroke holes and trust the putter. The driver has already submitted enough testimony.", Shamble: "Convert position instead of chasing perfection like it owes you money.", Scramble: "Be ready to close holes when everybody else develops temporary wrist paralysis.", Singles: "Make the opponent watch you hole putts all day while pretending this is completely normal." },
    note: "Garmin confirms you golf a lot. Garmin has declined further comment on the advice of counsel."
  },
  {
    id: "pat-morse", name: "Patrick Morse", nickname: "P-MO", role: "The Stroke-Hole Bandit",
    headline: "Ordinary bogeys. Extraordinary accounting. Driver backswing occasionally visible from space.",
    mission: "Bring the fresh low-to-mid-90s form, take every available pop, and turn competent bogey golf into match-play robbery. Short back, full through. We do not need the club visiting last Tuesday.",
    strengths: ["Recent form", "Net par creation", "Match-play value"],
    prep: ["Save your stroke allocation and know exactly where the crime is scheduled.", "Practice tee shots that finish in play using the cue: short back, full through.", "Spend half your short-game time on simple chips. The flop shot has retained separate legal counsel."],
    formats: { Fourball: "Keep playing until the hole is truly dead. A bogey with a pop is basically offshore banking.", Shamble: "Protect against the big number and let somebody else's drive remove temptation.", Scramble: "Give the team a ball before chasing speed. The backswing does not receive overtime pay.", Singles: "Treat every stroke hole like an acquisition and every double like a hostile takeover." },
    note: "A bogey with a stroke is a tax-free birdie. P-MO understands finance, even if the driver occasionally launders distance through the adjacent fairway."
  },
  {
    id: "tim-hummel", name: "Tim Hummel", nickname: "Tim", role: "The Veteran Thief",
    headline: "Calm decisions that quietly remove points from pockets while everyone else is still arguing about the wind.",
    mission: "Use Strand experience, composure, and your scoring ceiling to steal holes opponents assume belong to them. No need to announce the robbery.",
    strengths: ["Strand experience", "Match awareness", "Calm under pressure"],
    prep: ["Play one match-play round and practice protecting a lead without becoming a hostage to it.", "Rehearse a reliable tee club below driver for holes designed by people who hate joy.", "Practice six-footers with a full routine until the putter stops looking surprised."],
    formats: { Fourball: "Know when par is enough and when the opponent is bluffing with body language.", Shamble: "Choose the tee ball that creates the easiest next shot, not the best origin story.", Scramble: "Own communication and pace before four grown men hold a summit over a 106-yard shot.", Singles: "Let experience make the opponent feel rushed while you look mildly inconvenienced." },
    note: "Tim has seen this movie before. The ending usually involves somebody else asking how they lost 2-and-1 after winning the range session."
  },
  {
    id: "rhett-fahrney", name: "Rhett Fahrney", nickname: "Rhett", role: "The Undefeated Mystery",
    headline: "Championship pedigree, almost no scouting film, possibly generated by folklore.",
    mission: "Lean on winning experience, keep the assignment simple, and make limited current information work against the opponent. Be mysterious, not rusty.",
    strengths: ["Winning history", "Competitive instinct", "Low scouting visibility"],
    prep: ["Establish one stock tee shot and one wedge number before tournament morning becomes the laboratory.", "Play enough golf to remove first-round rust and verify that all limbs remain operational.", "Practice getting the first putt to the hole. The cup cannot be intimidated from six feet short."],
    formats: { Fourball: "Keep it simple and let the mystery work. Do not release the director's commentary.", Shamble: "Commit to the selected ball and avoid reopening the investigation.", Scramble: "Take clear assignments and swing freely once a ball is safe.", Singles: "Compete first; diagnose later. Preferably much later, with a drink." },
    note: "Three trips, three wins, and almost no current film. Rhett is less a player profile than a weather event."
  }
];

export const TEAM_RULES = [
  ["One ball first", "Secure a playable ball before anybody auditions for a highlight reel nobody requested."],
  ["Center green pays", "Short-sided hero golf is an expensive hobby, and this trip already has lodging."],
  ["Know your pops", "Your strokes are part of the equipment. Forgetting them is like leaving the putter at the hotel, but somehow dumber."],
  ["Say the match out loud", "Confirm front, back, and overall every three holes. Beer math has an undefeated record of being confidently wrong."],
  ["No emotional carryover", "A lost hole is one hole, not a six-part documentary narrated by the person who caused it."],
  ["Eat before ugly", "Hydrate and fuel before your swing starts resembling a folding chair falling down stairs."],
  ["The flag is a suggestion", "Aim where a normal miss survives. The pin did not insult your family."],
  ["Make them finish", "A visible par changes decisions. Keep the ball alive and let the opponent manufacture his own collapse."],
  ["No parking-lot coaching", "Do not rebuild a teammate's swing between rounds because you watched one YouTube Short in the cart."],
  ["Win without apologizing", "Nobody asks whether a 1-up victory was aesthetically pleasing. Put the point on ice and keep walking."]
] as const;

export const READY_CHECK = [
  "Confirm travel and tee-time details before asking the group chat for the seventh time",
  "Save course intel to phone while sober enough to remember where it went",
  "Know stroke holes and stop discovering pops after the hole is over",
  "Pack warm and rain layers because Washington weather has no loyalty",
  "Bring sunscreen and lip balm; looking like beef jerky is not team culture",
  "Pack two gloves plus backup because moisture exists",
  "Mark golf balls clearly so every Pro V1 in the weeds is not suddenly yours",
  "Pack electrolytes and actual food, not just twelve beverages with logos",
  "Charge rangefinder and phone before both become decorative rectangles",
  "Complete final easy practice without inventing a new swing"
] as const;
