import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  /^\/invite\//,
  /^\/setup$/,
  /^\/no-access$/,
  /^\/manifest\.webmanifest$/,
  /^\/sw\.js$/,
  /^\/icons\//,
  /^\/favicon\.ico$/,
];

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (PUBLIC_PATHS.some((re) => re.test(path))) return NextResponse.next();
  if (!req.cookies.get("session")) {
    return NextResponse.redirect(new URL("/no-access", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next).*)"],
};
