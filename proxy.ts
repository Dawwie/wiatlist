import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/neon-auth/server";

const authMiddleware = auth.middleware({ loginUrl: "/auth/sign-in" });

export default function proxy(request: NextRequest) {
  // Server Actions are same-origin POSTs already authorized by requireUser()
  // inside every action. Running the Neon Auth session refresh here too would
  // call get-session a second time in the same request, rotating the session
  // token twice and logging the user out after each mutation. Skip it — the
  // action's own requireUser() is the real gate.
  if (request.headers.get("next-action")) {
    return NextResponse.next();
  }
  // Same problem for RSC requests (router.refresh() from refresh-poller.tsx,
  // link prefetches, client-side navigations). They routinely overlap with a
  // document navigation, and each middleware pass that misses the session_data
  // cookie cache rotates the session token upstream — the request that loses
  // that race presents a consumed token and gets bounced to /auth/sign-in.
  // requireUser() on every protected page is the real gate here too.
  if (request.headers.get("rsc")) {
    return NextResponse.next();
  }
  return authMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next|api/auth|api/lists|auth|no-access|invite|setup|manifest\\.webmanifest|sw\\.js|icons|icon\\.png|favicon\\.ico).*)",
  ],
};
