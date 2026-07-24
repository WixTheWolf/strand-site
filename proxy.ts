import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL("/stud-buckets/course-prep", request.url));
}

export const config = {
  matcher: [
    "/",
    "/courses/:path*",
    "/draft/:path*",
    "/embed/:path*",
    "/live/:path*",
    "/my-strand/:path*",
    "/stud-buckets",
  ],
};
