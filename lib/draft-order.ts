/**
 * Official 2026 captain draft order.
 *
 * J-BONE won the first pick. The draft is linear/alternating—not a snake:
 * J-BONE owns every odd pick and WIX owns every even pick.
 */
export const OFFICIAL_WIX_PICKS_FIRST = false;
export const DRAFT_ORDER_VERSION = 4;
export const CAPTAIN_INTEL_STORAGE_KEY = "strand-2026-captain-intel-v1";

export type OfficialDraftSide = "mine" | "opponent";

export function officialDraftSide(pickNumber: number): OfficialDraftSide {
  return pickNumber % 2 === 0 ? "mine" : "opponent";
}

export function wixOwnsPick(pickNumber: number): boolean {
  return officialDraftSide(pickNumber) === "mine";
}

export function officialPickLabel(pickNumber: number): string {
  return wixOwnsPick(pickNumber) ? "WIX" : "J-BONE";
}

export const WIX_PICK_NUMBERS = [2, 4, 6, 8, 10, 12, 14, 16, 18] as const;
export const JBONE_PICK_NUMBERS = [1, 3, 5, 7, 9, 11, 13, 15, 17] as const;
