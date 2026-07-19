import type { RecentRound } from "./types";

/**
 * Snapshot of each golfer's last-5 posted rounds, captured from GHIN on
 * 2026-07-19. Served as a fallback so the Draft Lab always shows recent form
 * even when GHIN rate-limits the live lookups; live data overrides it when
 * available. Refresh by re-running a successful /api/grint/players pull.
 */
export const GHIN_ROUNDS_SNAPSHOT: Record<string, RecentRound[]> = {
  "justin-uribe": [
    {"date": "2026-06", "score": 96, "differential": 23.6},
    {"date": "2026-05", "score": 95, "differential": 18.6},
    {"date": "2026-05", "score": 83, "differential": 8.6},
    {"date": "2026-04", "score": 97, "differential": 18.8},
    {"date": "2026-04", "score": 97, "differential": 22.1},
  ],
  "matt-wixted": [
    {"date": "2026-06-30", "score": 84, "course": "Arroyo Trabuco Golf Club", "differential": 13.3},
    {"date": "2026-06-19", "score": 98, "course": "Skylinks at Long Beach", "differential": 25.5},
    {"date": "2026-06-12", "score": 85, "course": "Lakewood Country Club", "differential": 13.7},
    {"date": "2026-05-22", "score": 89, "course": "Lakewood Country Club", "differential": 17.5},
    {"date": "2026-05-15", "score": 90, "course": "Skylinks at Long Beach", "differential": 18.1},
  ],
  "jack-groot": [
    {"date": "2026-06", "score": 92, "differential": 18.7},
    {"date": "2026-06", "score": 50, "differential": 12.3, "nineHole": true},
    {"date": "2026-05", "score": 96, "differential": 21.5},
    {"date": "2026-05", "score": 85, "differential": 11.2},
    {"date": "2026-03", "score": 88, "differential": 17.7},
  ],
  "nick-sprowls": [
    {"date": "2026-07", "score": 95, "differential": 22.6},
    {"date": "2026-06", "score": 97, "differential": 24.9},
    {"date": "2026-04", "score": 101, "differential": 28.3},
    {"date": "2025-11", "score": 93, "differential": 21.6},
    {"date": "2025-10", "score": 90, "differential": 18.4},
  ],
  "matt-schroeder": [
    {"date": "2026-07", "score": 88, "differential": 16.8},
    {"date": "2026-06", "score": 87, "differential": 15.3},
    {"date": "2026-06", "score": 87, "differential": 15.6},
    {"date": "2026-05", "score": 86, "differential": 14.7},
    {"date": "2026-05", "score": 88, "differential": 16.2},
  ],
  "jordan-brodbeck": [
    {"date": "2026-06", "score": 85, "differential": 13.4},
    {"date": "2026-06", "score": 92, "differential": 20.3},
    {"date": "2026-05", "score": 88, "differential": 16.5},
    {"date": "2026-04", "score": 81, "differential": 9.7},
    {"date": "2026-03", "score": 93, "differential": 20.8},
  ],
  "kevin-gordon": [
    {"date": "2026-04", "score": 43, "differential": 13.4, "nineHole": true},
    {"date": "2026-04", "score": 97, "differential": 29.7},
    {"date": "2026-02", "score": 36, "differential": 11.6, "nineHole": true},
    {"date": "2025-12", "score": 47, "differential": 8.1, "nineHole": true},
    {"date": "2025-12", "score": 59, "differential": 19.3, "nineHole": true},
  ],
  "matt-onorato": [
    {"date": "2026-04", "score": 108, "differential": 33.8},
    {"date": "2025-08", "score": 108, "differential": 31.1},
    {"date": "2025-07", "score": 110, "differential": 36.3},
    {"date": "2025-07", "score": 56, "differential": 19.2, "nineHole": true},
    {"date": "2025-06", "score": 104, "differential": 27.5},
  ],
  "jason-olson": [
    {"date": "2026-04", "score": 99, "differential": 25.7},
    {"date": "2026-03", "score": 91, "differential": 17.4},
    {"date": "2026-01", "score": 47, "differential": 10.7, "nineHole": true},
    {"date": "2026-01", "score": 45, "differential": 10.3, "nineHole": true},
    {"date": "2026-01", "score": 39, "differential": 7.6, "nineHole": true},
  ],
  "brett-comfort": [
    {"date": "2026-07", "score": 101, "differential": 28.3},
    {"date": "2025-08", "score": 103, "differential": 34},
    {"date": "2025-08", "score": 107, "differential": 30.8},
    {"date": "2025-08", "score": 107, "differential": 30},
    {"date": "2025-07", "score": 101, "differential": 29.9},
  ],
};
