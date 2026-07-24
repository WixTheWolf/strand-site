import "server-only";

import type { CaptainPlayer } from "./captains-room";

export const CAPTAIN_WIX_PROFILE: CaptainPlayer = {
  id: "matt-wixted",
  name: "Matt Wixted",
  nickname: "WIX",
  role: "The Playing Captain / Air-Traffic Controller",
  headline: "Set the temperature, play committed golf, and keep nine adult men from turning one bad hole into a constitutional crisis.",
  mission: "Lead without over-managing. Know the match state, make the hard pairing and strategy calls, then give your own shot the same calm attention you expect from everybody else. You are the captain, not the emergency broadcast system.",
  strengths: ["Team leadership", "Match awareness", "Competitive energy", "Calm tempo", "Advanced beer math supervision"],
  prep: [
    "Build one reliable driver shape and one fairway-finder for pressure holes. High-right is a miss pattern, not a team-building exercise.",
    "Practice 30–80 yard wedges and center-green approaches. The flag has not personally disrespected you.",
    "Play one match-play round where you announce the match state every three holes, reset immediately after mistakes, and resist coaching anyone who did not ask."
  ],
  formats: {
    Fourball: "Be the communicator. Keep one score alive, know when your partner is covered, and do not let captain duties turn your own pre-shot routine into an airport security line.",
    Shamble: "Choose the ball that creates the easiest next shot, not the drive with the best LinkedIn profile. Keep decisions quick and the group moving.",
    Scramble: "Assign order clearly, secure a ball first, and save the full-send swing for when the team has protection. Four captains over one putt is how civilizations collapse.",
    Singles: "Stop captaining for four hours. Nobody needs a motivational podcast from the adjacent fairway. Play your target, trust your tempo, and make the opponent earn every hole."
  },
  note: "The team does not need a perfect captain. It needs a steady one. Sometimes your strongest leadership move is hitting the fairway, shutting up for thirty seconds, and letting another grown man own his golf ball."
};