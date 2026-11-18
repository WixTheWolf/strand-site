import { NextResponse } from "next/server";

/**
 * Tournament-week proxy — RETIRED (pass-through).
 *
 * During the 2026 Strand, every visitor on these paths was redirected to the
 * Captain's Room teammate guide. The tournament is over and the site is
 * public again for the 2026 recap and the 2027 announcement, so the proxy
 * now passes every request through untouched. To run a locked-down week
 * again in 2027, swap the body back to
 * `NextResponse.redirect(new URL("/captains-room", request.url))`.
 */
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/courses",
    "/draft/:path*",
    "/embed/:path*",
    "/my-strand/:path*",
    "/stud-buckets",
  ],
};
