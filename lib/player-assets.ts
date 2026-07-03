/** Player headshots sourced from strandinvitational.life/players */
export const PLAYER_PHOTOS: Record<string, string> = {
  "andrew-mager": "/players/drew.jpg",
  "brett-comfort": "/players/brett.jpg",
  "brian-kerns": "/players/kerns-cartoon.png",
  "fred-geisinger": "/players/fred.jpg",
  "jack-groot": "/players/jack.jpg",
  "jason-olson": "/players/jason.jpg",
  "jordan-brodbeck": "/players/gord.jpg",
  "justin-uribe": "/players/j-bone.jpg",
  "kevin-gordon": "/players/kev.jpg",
  "matt-onorato": "/players/matty-o.jpg",
  "matt-schroeder": "/players/tony-schroe.jpg",
  "matt-wixted": "/players/wix.jpg",
  "nick-kane": "/players/kane.jpg",
  "nick-sprowls": "/players/nick.jpg",
  "pat-morse": "/players/p-mo.jpg",
  "rhett-fahrney": "/players/rhett.jpg",
  "ryan-darcy": "/players/darcy.jpg",
  "sam-blonski": "/players/blonski.jpg",
  "shaun-eipper": "/players/shaun.jpg",
  "tim-hummel": "/players/hummel.jpg",
};

export function getPlayerPhoto(playerId: string): string | null {
  return PLAYER_PHOTOS[playerId] ?? null;
}
