export interface FlightLeg {
  airline: string;
  route: string;
  times: string;
}

export interface PlayerTravel {
  playerId: string;
  arrival: FlightLeg[];
  departure: FlightLeg[];
  notes?: string;
}

export const PLAYER_TRAVEL: PlayerTravel[] = [
  {
    playerId: "fred-geisinger",
    arrival: [
      { airline: "Alaska", route: "SAN → PDX", times: "7:00 AM – 9:38 AM" },
      { airline: "Alaska", route: "PDX → GEG", times: "10:30 AM – 11:42 AM" },
    ],
    departure: [
      { airline: "Alaska", route: "GEG → PDX", times: "12:36 PM – 1:49 PM" },
      { airline: "Alaska", route: "PDX → SAN", times: "2:49 PM – 5:24 PM" },
    ],
  },
  {
    playerId: "andrew-mager",
    arrival: [
      { airline: "Alaska", route: "LAX → PDX", times: "7:00 AM – 9:25 AM" },
      { airline: "Alaska", route: "PDX → GEG", times: "10:30 AM – 11:52 AM" },
    ],
    departure: [{ airline: "Delta", route: "GEG → LAX", times: "2:45 PM – 5:38 PM" }],
  },
  {
    playerId: "jordan-brodbeck",
    arrival: [
      { airline: "Alaska", route: "LAX → PDX", times: "7:00 AM – 9:25 AM" },
      { airline: "Alaska", route: "PDX → GEG", times: "10:30 AM – 11:42 AM" },
    ],
    departure: [{ airline: "Delta", route: "GEG → LAX", times: "2:45 PM – 5:38 PM" }],
  },
  {
    playerId: "matt-schroeder",
    arrival: [
      { airline: "Alaska", route: "LAX → PDX", times: "7:00 AM – 9:25 AM" },
      { airline: "Alaska", route: "PDX → GEG", times: "10:30 AM – 11:42 AM" },
    ],
    departure: [{ airline: "Delta", route: "GEG → LAX", times: "2:45 PM – 5:38 PM" }],
  },
  {
    playerId: "justin-uribe",
    arrival: [
      { airline: "Alaska", route: "BUR → PDX", times: "7:20 AM – 9:38 AM" },
      { airline: "Alaska", route: "PDX → GEG", times: "10:30 AM – 11:42 AM" },
    ],
    departure: [
      { airline: "Southwest", route: "GEG → SJC", times: "1:00 PM – 3:15 PM" },
      { airline: "Southwest", route: "SJC → BUR", times: "4:05 PM – 5:15 PM" },
    ],
  },
  {
    playerId: "matt-wixted",
    arrival: [
      { airline: "Southwest", route: "SNA → LAS", times: "6:45 AM – 8:15 AM" },
      { airline: "Southwest", route: "LAS → GEG", times: "9:15 AM – 11:40 AM" },
    ],
    departure: [
      { airline: "Southwest", route: "GEG → SJC", times: "1:00 PM – 3:15 PM" },
      { airline: "Southwest", route: "SJC → SNA", times: "4:40 PM – 6:05 PM" },
    ],
  },
  {
    playerId: "ryan-darcy",
    arrival: [
      { airline: "Alaska", route: "LAX → PDX", times: "7:00 AM – 9:25 AM" },
      { airline: "Alaska", route: "PDX → GEG", times: "10:30 AM – 11:42 AM" },
    ],
    departure: [
      { airline: "Alaska", route: "GEG → PDX", times: "12:36 PM – 1:49 PM" },
      { airline: "Alaska", route: "PDX → LAX", times: "2:30 PM – 4:59 PM" },
    ],
  },
  {
    playerId: "nick-sprowls",
    arrival: [],
    departure: [],
    notes: "Flight details TBD",
  },
  {
    playerId: "tim-hummel",
    arrival: [],
    departure: [],
    notes: "Flight details TBD",
  },
  {
    playerId: "jason-olson",
    arrival: [
      { airline: "Alaska", route: "BUR → PDX", times: "7:20 AM – 9:38 AM" },
      { airline: "Alaska", route: "PDX → GEG", times: "10:30 AM – 11:42 AM" },
    ],
    departure: [{ airline: "Delta", route: "GEG → LAX", times: "2:45 PM – 5:38 PM" }],
  },
  {
    playerId: "brett-comfort",
    arrival: [
      { airline: "Alaska", route: "LAX → PDX", times: "7:00 AM – 9:25 AM" },
      { airline: "Alaska", route: "PDX → GEG", times: "10:30 AM – 11:42 AM" },
    ],
    departure: [
      { airline: "Delta", route: "GEG → SLC", times: "1:23 PM – 4:12 PM" },
      { airline: "Delta", route: "SLC → LAX", times: "5:19 PM – 6:16 PM" },
    ],
  },
  {
    playerId: "kevin-gordon",
    arrival: [{ airline: "United", route: "SFO → GEG", times: "8:17 AM – 10:35 AM" }],
    departure: [{ airline: "United", route: "GEG → SFO", times: "12:57 PM – 3:23 PM" }],
  },
  {
    playerId: "matt-onorato",
    arrival: [
      { airline: "American", route: "CLT → ORD", times: "8:15 AM – 9:25 AM" },
      { airline: "American", route: "ORD → GEG", times: "10:27 AM – 12:16 PM" },
    ],
    departure: [
      { airline: "American", route: "GEG → DFW", times: "12:42 PM – 6:15 PM" },
      { airline: "American", route: "DFW → CLT", times: "8:40 PM – 12:19 AM (+1)" },
    ],
  },
  {
    playerId: "sam-blonski",
    arrival: [
      { airline: "Delta", route: "DTW → SEA", times: "6:00 AM – 8:09 AM" },
      { airline: "Delta", route: "SEA → GEG", times: "9:25 AM – 10:35 AM" },
    ],
    departure: [
      { airline: "Delta", route: "GEG → MSP", times: "2:05 PM – 6:59 PM" },
      { airline: "Delta", route: "MSP → DTW", times: "7:45 PM – 10:30 PM" },
    ],
  },
  {
    playerId: "rhett-fahrney",
    arrival: [
      { airline: "Southwest", route: "SNA → LAS", times: "6:45 AM – 8:15 AM" },
      { airline: "Southwest", route: "LAS → GEG", times: "9:15 AM – 11:40 AM" },
    ],
    departure: [
      { airline: "Southwest", route: "GEG → SJC", times: "1:00 PM – 3:15 PM" },
      { airline: "Southwest", route: "SJC → SNA", times: "4:40 PM – 6:05 PM" },
    ],
  },
  {
    playerId: "nick-kane",
    arrival: [
      { airline: "Alaska", route: "LAX → PDX", times: "7:00 AM – 9:25 AM" },
      { airline: "Alaska", route: "PDX → GEG", times: "10:30 AM – 11:42 AM" },
    ],
    departure: [{ airline: "Alaska", route: "GEG → LAX", times: "2:45 PM – 5:38 PM" }],
  },
  {
    playerId: "shaun-eipper",
    arrival: [
      { airline: "Delta", route: "JAX → ATL", times: "7:30 AM – 8:48 AM" },
      { airline: "Delta", route: "ATL → GEG", times: "9:44 AM – 11:24 AM" },
    ],
    departure: [
      { airline: "Delta", route: "GEG → ATL", times: "12:40 PM – 8:06 PM" },
      { airline: "Delta", route: "ATL → JAX", times: "10:52 PM – 12:04 AM (+1)" },
    ],
  },
  {
    playerId: "pat-morse",
    arrival: [
      { airline: "Alaska", route: "BUR → PDX", times: "7:20 AM – 9:38 AM" },
      { airline: "Alaska", route: "PDX → GEG", times: "10:30 AM – 11:42 AM" },
    ],
    departure: [
      { airline: "Alaska", route: "GEG → PDX", times: "12:36 PM – 1:49 PM" },
      { airline: "Alaska", route: "PDX → BUR", times: "2:50 PM – 5:10 PM" },
    ],
  },
  {
    playerId: "brian-kerns",
    arrival: [],
    departure: [],
    notes: "Flight details TBD",
  },
  {
    playerId: "jack-groot",
    arrival: [{ airline: "United", route: "ORD → GEG", times: "8:45 AM – 10:55 AM" }],
    departure: [{ airline: "United", route: "GEG → ORD", times: "11:30 AM – 5:05 PM" }],
  },
];

export function formatFlightLegs(legs: FlightLeg[]): string {
  if (!legs.length) return "TBD";
  return legs.map((leg) => `${leg.airline} ${leg.route} (${leg.times})`).join(" • ");
}

export function getTravelByPlayerId(playerId: string): PlayerTravel | undefined {
  return PLAYER_TRAVEL.find((entry) => entry.playerId === playerId);
}
