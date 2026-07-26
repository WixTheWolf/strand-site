import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL("/captains-room", request.url));
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

