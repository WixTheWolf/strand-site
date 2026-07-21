import type { GrintHandicap, RecentRound } from "./types";
import { CONSENTED_ROUNDS } from "./consented-rounds";

export const PLAYER_DATA_SNAPSHOT_CAPTURED_AT = "2026-07-21T01:57:11.994Z";

/**
 * Consent-authorized performance snapshot captured from the roster's linked
 * GHIN and TheGrint records. It contains no emails, member numbers, usernames,
 * profile IDs, or locations. Authorized live data overrides this snapshot.
 */
const BASE_PLAYER_DATA_SNAPSHOT: Record<
  string,
  { handicap: GrintHandicap | null; rounds: RecentRound[] }
> = {
  "fred-geisinger": {
    "handicap": {
      "lowest": "5.6",
      "attest": "5.0",
      "index": "7.7",
      "index_ghap": "4~6",
      "index_federation": "6~8",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": [
      {
        "date": "2026-07",
        "score": 80,
        "differential": 10
      },
      {
        "date": "2026-07",
        "score": 82,
        "differential": 11.3
      },
      {
        "date": "2026-07",
        "score": 79,
        "differential": 9.3
      },
      {
        "date": "2026-06",
        "score": 87,
        "differential": 14
      },
      {
        "date": "2026-06",
        "score": 85,
        "differential": 9.9
      }
    ]
  },
  "andrew-mager": {
    "handicap": null,
    "rounds": [
      {
        "date": "2026-07",
        "score": 77,
        "differential": 6.7
      },
      {
        "date": "2026-06",
        "score": 82,
        "differential": 9.7
      },
      {
        "date": "2026-05",
        "score": 82,
        "differential": 10.9
      },
      {
        "date": "2026-04",
        "score": 81,
        "differential": 7.1
      },
      {
        "date": "2025-12",
        "score": 36,
        "differential": 5.2,
        "nineHole": true
      }
    ]
  },
  "justin-uribe": {
    "handicap": {
      "lowest": "8.4",
      "attest": "0.0",
      "index": "8.4",
      "index_ghap": "6~8",
      "index_federation": "4~6",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": [
      {
        "date": "2026-06",
        "score": 96,
        "differential": 23.6
      },
      {
        "date": "2026-05",
        "score": 95,
        "differential": 18.6
      },
      {
        "date": "2026-05",
        "score": 83,
        "differential": 8.6
      },
      {
        "date": "2026-04",
        "score": 97,
        "differential": 18.8
      },
      {
        "date": "2026-04",
        "score": 97,
        "differential": 22.1
      }
    ]
  },
  "nick-sprowls": {
    "handicap": {
      "lowest": "12.6",
      "attest": "0.0",
      "index": "12.9",
      "index_ghap": "10~12",
      "index_federation": "14~16",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": [
      {
        "date": "2026-07",
        "score": 95,
        "differential": 22.6
      },
      {
        "date": "2026-06",
        "score": 97,
        "differential": 24.9
      },
      {
        "date": "2026-04",
        "score": 101,
        "differential": 28.3
      },
      {
        "date": "2025-11",
        "score": 93,
        "differential": 21.6
      },
      {
        "date": "2025-10",
        "score": 90,
        "differential": 18.4
      }
    ]
  },
  "matt-wixted": {
    "handicap": {
      "lowest": "12.4",
      "attest": "58.8",
      "index": "12.4",
      "index_ghap": "12~14",
      "index_federation": "14~16",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": [
      {
        "date": "2026-06-30",
        "score": 84,
        "course": "Arroyo Trabuco Golf Club",
        "differential": 13.3
      },
      {
        "date": "2026-06-19",
        "score": 98,
        "course": "Skylinks at Long Beach",
        "differential": 25.5
      },
      {
        "date": "2026-06-12",
        "score": 85,
        "course": "Lakewood Country Club",
        "differential": 13.7
      },
      {
        "date": "2026-05-22",
        "score": 89,
        "course": "Lakewood Country Club",
        "differential": 17.5
      },
      {
        "date": "2026-05-15",
        "score": 90,
        "course": "Skylinks at Long Beach",
        "differential": 18.1
      },
      {
        "date": "2026-04-03",
        "score": 85,
        "course": "Skylinks at Long Beach",
        "differential": 13.4
      },
      {
        "date": "2026-03-21",
        "score": 87,
        "course": "Skylinks at Long Beach",
        "differential": 16.2
      },
      {
        "date": "2026-01-19",
        "score": 100,
        "course": "Lakewood Country Club",
        "differential": 27.7
      },
      {
        "date": "2026-01-02",
        "score": 95,
        "course": "Lakewood Country Club",
        "differential": 23.1
      },
      {
        "date": "2025-12-19",
        "score": 89,
        "course": "Lakewood Country Club",
        "differential": 17.5
      },
      {
        "date": "2025-11-21",
        "score": 88,
        "course": "Lakewood Country Club",
        "differential": 15.6
      },
      {
        "date": "2025-10-31",
        "score": 81,
        "course": "Lakewood Country Club",
        "differential": 10
      },
      {
        "date": "2025-08-22",
        "score": 85,
        "course": "Lakewood Country Club",
        "differential": 13.7
      },
      {
        "date": "2025-08-09",
        "score": 90,
        "course": "Bayonet",
        "differential": 16.4
      },
      {
        "date": "2025-08-07",
        "score": 86,
        "course": "Pasatiempo GC",
        "differential": 12.4
      },
      {
        "date": "2025-08-01",
        "score": 85,
        "course": "Lakewood Country Club",
        "differential": 13.7
      },
      {
        "date": "2025-07-18",
        "score": 90,
        "course": "Coyote Hills Golf Course",
        "differential": 19.9
      },
      {
        "date": "2025-07-07",
        "score": 80,
        "course": "Lakewood Country Club",
        "differential": 9.1
      },
      {
        "date": "2025-06-22",
        "score": 89,
        "course": "Anaheim Hills Golf Club",
        "differential": 18.5
      },
      {
        "date": "2025-06-20",
        "score": 89,
        "course": "Arroyo Trabuco Golf Club",
        "differential": 16.5
      }
    ]
  },
  "kevin-gordon": {
    "handicap": {
      "lowest": "N/A",
      "attest": "0.0",
      "index": "19~21",
      "index_ghap": "19~21",
      "index_federation": "19~21",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": [
      {
        "date": "2026-04",
        "score": 43,
        "differential": 25.6,
        "nineHole": true
      },
      {
        "date": "2026-04",
        "score": 97,
        "differential": 29.7
      },
      {
        "date": "2026-02",
        "score": 36,
        "differential": 23.8,
        "nineHole": true
      },
      {
        "date": "2025-12",
        "score": 47,
        "differential": 20.5,
        "nineHole": true
      },
      {
        "date": "2025-12",
        "score": 59,
        "differential": 31.7,
        "nineHole": true
      }
    ]
  },
  "ryan-darcy": {
    "handicap": {
      "lowest": "N/A",
      "attest": "0.0",
      "index": "14~16",
      "index_ghap": "14~16",
      "index_federation": "14~16",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": [
      {
        "date": "2026-06",
        "score": 93,
        "differential": 21.1
      },
      {
        "date": "2026-05",
        "score": 81,
        "differential": 7.6
      },
      {
        "date": "2026-04",
        "score": 89,
        "differential": 13.2
      },
      {
        "date": "2026-04",
        "score": 84,
        "differential": 12.6
      },
      {
        "date": "2025-08",
        "score": 94,
        "differential": 19.1
      }
    ]
  },
  "matt-schroeder": {
    "handicap": {
      "lowest": "12.7",
      "attest": "35.0",
      "index": "13.3",
      "index_ghap": "~13",
      "index_federation": "~12",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": [
      {
        "date": "2026-07",
        "score": 88,
        "differential": 16.8
      },
      {
        "date": "2026-06",
        "score": 87,
        "differential": 15.3
      },
      {
        "date": "2026-06",
        "score": 87,
        "differential": 15.6
      },
      {
        "date": "2026-05",
        "score": 86,
        "differential": 14.7
      },
      {
        "date": "2026-05",
        "score": 88,
        "differential": 16.2
      }
    ]
  },
  "jordan-brodbeck": {
    "handicap": {
      "lowest": "14.4",
      "attest": "0.0",
      "index": "14.4",
      "index_ghap": "18~20",
      "index_federation": "21~23",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": [
      {
        "date": "2026-06",
        "score": 85,
        "differential": 13.4
      },
      {
        "date": "2026-06",
        "score": 92,
        "differential": 20.3
      },
      {
        "date": "2026-05",
        "score": 88,
        "differential": 16.5
      },
      {
        "date": "2026-04",
        "score": 81,
        "differential": 9.7
      },
      {
        "date": "2026-03",
        "score": 93,
        "differential": 20.8
      }
    ]
  },
  "tim-hummel": {
    "handicap": {
      "lowest": "18.8",
      "attest": "0.0",
      "index": "18.8",
      "index_ghap": "14~16",
      "index_federation": "9~11",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": [
      {
        "date": "2026-04",
        "score": 105,
        "differential": 30.8
      },
      {
        "date": "2026-03",
        "score": 98,
        "differential": 25.5
      },
      {
        "date": "2025-11",
        "score": 91,
        "differential": 18.2
      },
      {
        "date": "2025-08",
        "score": 104,
        "differential": 27.5
      },
      {
        "date": "2025-06",
        "score": 101,
        "differential": 24.8
      }
    ]
  },
  "jason-olson": {
    "handicap": {
      "lowest": "20.5",
      "attest": "0.0",
      "index": "20.5",
      "index_ghap": "20.2",
      "index_federation": "29~31",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": [
      {
        "date": "2026-04",
        "score": 99,
        "differential": 25.7
      },
      {
        "date": "2026-03",
        "score": 91,
        "differential": 17.4
      },
      {
        "date": "2026-01",
        "score": 47,
        "differential": 22.8,
        "nineHole": true
      },
      {
        "date": "2026-01",
        "score": 45,
        "differential": 22.4,
        "nineHole": true
      },
      {
        "date": "2026-01",
        "score": 39,
        "differential": 19.8,
        "nineHole": true
      }
    ]
  },
  "jack-groot": {
    "handicap": {
      "lowest": "14.3",
      "attest": "85.0",
      "index": "15.8",
      "index_ghap": "~15",
      "index_federation": "~14",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": [
      {
        "date": "2026-06",
        "score": 92,
        "differential": 18.7
      },
      {
        "date": "2026-06",
        "score": 50,
        "differential": 21.2,
        "nineHole": true
      },
      {
        "date": "2026-05",
        "score": 96,
        "differential": 21.5
      },
      {
        "date": "2026-05",
        "score": 85,
        "differential": 11.2
      },
      {
        "date": "2026-03",
        "score": 88,
        "differential": 17.7
      }
    ]
  },
  "nick-kane": {
    "handicap": {
      "lowest": "N/A",
      "attest": "40.0",
      "index": "22~24",
      "index_ghap": "21~23",
      "index_federation": "22~24",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": []
  },
  "shaun-eipper": {
    "handicap": {
      "lowest": "N/A",
      "attest": "78.9",
      "index": "19~21",
      "index_ghap": "19~21",
      "index_federation": "19~21",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": []
  },
  "matt-onorato": {
    "handicap": {
      "lowest": "N/A",
      "attest": "50.0",
      "index": "28.0",
      "index_ghap": "26~28",
      "index_federation": "23~25",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": [
      {
        "date": "2026-04",
        "score": 108,
        "differential": 33.8
      },
      {
        "date": "2025-08",
        "score": 108,
        "differential": 31.1
      },
      {
        "date": "2025-07",
        "score": 110,
        "differential": 36.3
      },
      {
        "date": "2025-07",
        "score": 56,
        "differential": 34,
        "nineHole": true
      },
      {
        "date": "2025-06",
        "score": 104,
        "differential": 27.5
      }
    ]
  },
  "brian-kerns": {
    "handicap": {
      "lowest": "N/A",
      "attest": "0.0",
      "index": "17~19",
      "index_ghap": "17~19",
      "index_federation": "17~19",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": []
  },
  "rhett-fahrney": {
    "handicap": {
      "lowest": "N/A",
      "attest": "0.0",
      "index": "24~26",
      "index_ghap": "24~26",
      "index_federation": "24~26",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": []
  },
  "sam-blonski": {
    "handicap": {
      "lowest": "N/A",
      "attest": "35.0",
      "index": "17~19",
      "index_ghap": "21~23",
      "index_federation": "17~19",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": [
      {
        "date": "2026-07",
        "score": 43,
        "differential": 23.2,
        "nineHole": true
      },
      {
        "date": "2026-07",
        "score": 103,
        "differential": 25.2
      },
      {
        "date": "2026-06",
        "score": 47,
        "differential": 24.5,
        "nineHole": true
      },
      {
        "date": "2026-06",
        "score": 92,
        "differential": 25.4
      },
      {
        "date": "2025-10",
        "score": 102,
        "differential": 29.2
      }
    ]
  },
  "pat-morse": {
    "handicap": {
      "lowest": "24.8",
      "attest": "15.0",
      "index": "24.8",
      "index_ghap": "~24",
      "index_federation": "~26",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": [
      {
        "date": "2026-07",
        "score": 95,
        "differential": 27.1
      },
      {
        "date": "2026-07",
        "score": 97,
        "differential": 25.2
      },
      {
        "date": "2026-07",
        "score": 99,
        "differential": 27.1
      },
      {
        "date": "2026-06",
        "score": 93,
        "differential": 23.7
      },
      {
        "date": "2026-05",
        "score": 46,
        "differential": 25.3,
        "nineHole": true
      }
    ]
  },
  "brett-comfort": {
    "handicap": {
      "lowest": "N/A",
      "attest": "50.0",
      "index": "24.8",
      "index_ghap": "23~25",
      "index_federation": "32~34",
      "cIndex": null,
      "teebox_handicap": null
    },
    "rounds": [
      {
        "date": "2026-07",
        "score": 101,
        "differential": 28.3
      },
      {
        "date": "2025-08",
        "score": 103,
        "differential": 34
      },
      {
        "date": "2025-08",
        "score": 107,
        "differential": 30
      },
      {
        "date": "2025-07",
        "score": 101,
        "differential": 29.9
      },
      {
        "date": "2025-05",
        "score": 103,
        "differential": 27.9
      }
    ]
  }
};

/**
 * The detailed, player-consented records supplied by the captain replace the
 * older five-round summaries. This keeps the original verified handicap
 * payloads while ensuring every downstream metric uses the richest record.
 */
export const PLAYER_DATA_SNAPSHOT: Record<
  string,
  { handicap: GrintHandicap | null; rounds: RecentRound[] }
> = Object.fromEntries(
  Object.entries(BASE_PLAYER_DATA_SNAPSHOT).map(([playerId, snapshot]) => [
    playerId,
    {
      ...snapshot,
      rounds: CONSENTED_ROUNDS[playerId] ?? snapshot.rounds,
    },
  ]),
);
