import { type NextRequest, NextResponse } from "next/server";

import { getSessionCookie } from "@tsuki/auth/cookies";

export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login"],
};
