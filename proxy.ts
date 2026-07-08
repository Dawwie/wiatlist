import { auth } from "@/lib/neon-auth/server";

export default auth.middleware({ loginUrl: "/auth/sign-in" });

export const config = {
  matcher: [
    "/((?!_next|api/auth|auth|no-access|invite|setup|manifest\\.webmanifest|sw\\.js|icons|favicon\\.ico).*)",
  ],
};
