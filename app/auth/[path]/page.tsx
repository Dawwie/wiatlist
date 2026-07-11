import "@neondatabase/auth-ui/css";
import { AuthView } from "@neondatabase/auth-ui";
import { authViewPaths } from "@neondatabase/auth-ui/server";

export const dynamic = "force-dynamic";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  return (
    <div className="relative flex min-h-[calc(100vh-2rem)] items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 64 64"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(90vw,56rem)] w-[min(90vw,56rem)] -translate-x-1/2 -translate-y-1/2 stroke-brand-forest opacity-5"
        fill="none"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M13 17 L23 47 L32 29 L41 47 L51 17" />
      </svg>
      <div className="flex flex-col gap-8 w-full max-w-sm">
        <div className="text-center items-center justify-center">
          <span className="font-display text-4xl tracking-tight text-brand-ink">
            Wiatlist
          </span>
        </div>
        <AuthView path={path} />
      </div>
    </div>
  );
}
