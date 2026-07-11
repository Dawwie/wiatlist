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
  return authMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next|api/auth|api/lists|auth|no-access|invite|setup|manifest\\.webmanifest|sw\\.js|icons|icon\\.png|favicon\\.ico).*)",
  ],
};
