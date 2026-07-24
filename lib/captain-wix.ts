import "server-only";

import type { CaptainPlayer } from "./captains-room";

export const CAPTAIN_WIX_PROFILE: CaptainPlayer = {
  id: "matt-wixted",
  name: "Matt Wixted",
  nickname: "WIX",
  role: "The Playing Captain",
  headline: "Set the temperature, play committed golf, and keep the whole team pointed forward.",
  mission: "Lead without over-managing. Know the match state, make clear pairing and strategy calls, and then give your own shot the same calm attention you expect from everybody else.",
  strengths: ["Team leadership", "Match awareness", "Competitive energy", "Calm tempo"],
  prep: [
    "Build one reliable driver shape and one fairway-finder for pressure holes.",
    "Practice 30–80 yard wedges and center-green approaches instead of chasing flags.",
    "Play one match-play round where you announce the match state every three holes and reset immediately after mistakes."
  ],
  formats: {
    Fourball: "Be the communicator. Keep one score alive, know when your partner is covered, and do not let captain duties pull you out of your own routine.",
    Shamble: "Choose the ball that creates the easiest next shot, not the most impressive drive. Keep the team moving and decisions simple.",
    Scramble: "Assign order clearly, secure a ball first, and save your aggressive swing for when the team has protection.",
    Singles: "Stop captaining for four hours. Play your target, trust your tempo, and make the opponent earn every hole."
  },
  note: "The team does not need a perfect captain. It needs a steady one. Your best leadership move may be hitting the next fairway and shutting up for thirty seconds."
};
