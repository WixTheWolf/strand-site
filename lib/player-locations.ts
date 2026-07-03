export interface MapPoint {
  id: string;
  label: string;
  city: string;
  lat: number;
  lng: number;
  kind: "player" | "tournament" | "origin";
}

export const GAMBLE_SANDS: MapPoint = {
  id: "gamble-sands",
  label: "Gamble Sands 2026",
  city: "Brewster, WA",
  lat: 48.098,
  lng: -119.762,
  kind: "tournament",
};

/** Home-base coordinates — uses actual residence, not stale TheGrint location */
export const PLAYER_LOCATIONS: Record<string, Omit<MapPoint, "id" | "kind">> = {
  "andrew-mager": { label: "Andrew Mager", city: "Southern California", lat: 34.05, lng: -118.25 },
  "brett-comfort": { label: "Brett Comfort", city: "La Mirada, CA", lat: 33.917, lng: -118.012 },
  "brian-kerns": { label: "Brian Kerns", city: "Colorado", lat: 39.739, lng: -104.99 },
  "fred-geisinger": { label: "Fred Geisinger", city: "Encinitas, CA", lat: 33.037, lng: -117.292 },
  "jack-groot": { label: "Jack Groot", city: "Palatine, IL", lat: 42.11, lng: -88.034 },
  "jason-olson": { label: "Jason Olson", city: "Van Nuys, CA", lat: 34.189, lng: -118.448 },
  "jordan-brodbeck": { label: "Jordan Brodbeck", city: "Manhattan Beach, CA", lat: 33.885, lng: -118.411 },
  "justin-uribe": { label: "Justin Uribe", city: "Los Angeles, CA", lat: 34.052, lng: -118.244 },
  "kevin-gordon": { label: "Kevin Gordon", city: "San Francisco Bay Area, CA", lat: 37.804, lng: -122.271 },
  "matt-onorato": { label: "Matt Onorato", city: "Charlotte, NC", lat: 35.227, lng: -80.843 },
  "matt-schroeder": { label: "Matt Schroeder", city: "Redondo Beach, CA", lat: 33.849, lng: -118.388 },
  "matt-wixted": { label: "Matt Wixted", city: "Anaheim, CA", lat: 33.836, lng: -117.889 },
  "nick-kane": { label: "Nick Kane", city: "Hermosa Beach, CA", lat: 33.862, lng: -118.4 },
  "nick-sprowls": { label: "Nick Sprowls", city: "Hermosa Beach, CA", lat: 33.864, lng: -118.402 },
  "pat-morse": { label: "Pat Morse", city: "Redondo Beach, CA", lat: 33.847, lng: -118.386 },
  "rhett-fahrney": { label: "Rhett Fahrney", city: "La Quinta, CA", lat: 33.663, lng: -116.31 },
  "ryan-darcy": { label: "Ryan Darcy", city: "Manhattan Beach, CA", lat: 33.883, lng: -118.409 },
  "sam-blonski": { label: "Sam Blonski", city: "Plymouth, MI", lat: 42.371, lng: -83.47 },
  "shaun-eipper": { label: "Shaun Eipper", city: "Redondo Beach, CA", lat: 33.848, lng: -118.39 },
  "tim-hummel": { label: "Tim Hummel", city: "Hawthorne, CA", lat: 33.916, lng: -118.352 },
};

/** Hometown / roots markers when different from current home */
export const PLAYER_ORIGINS: Record<string, Omit<MapPoint, "id" | "kind">> = {
  "brian-kerns": { label: "Brian Kerns", city: "Illinois (roots)", lat: 41.878, lng: -87.63 },
};

export function projectToSvg(
  lat: number,
  lng: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  width: number,
  height: number,
  padding = 36,
) {
  const x = padding + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (width - padding * 2);
  const y = padding + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * (height - padding * 2);
  return { x, y };
}

export const MAP_BOUNDS = {
  minLat: 33.5,
  maxLat: 49.5,
  minLng: -125,
  maxLng: -78,
};