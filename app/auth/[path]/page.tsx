import "@neondatabase/auth-ui/css";
import { AuthView } from "@neondatabase/auth-ui";
import { authViewPaths } from "@neondatabase/auth-ui/server";
import { BrandMark, Wordmark } from "@/app/components/shell/brand";

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
      <BrandMark className="pointer-events-none absolute left-1/2 top-1/2 h-[min(90vw,56rem)] w-[min(90vw,56rem)] -translate-x-1/2 -translate-y-1/2 stroke-brand-forest opacity-5" />
      <div className="flex flex-col gap-8 w-full max-w-sm">
        <div className="text-center items-center justify-center">
          <Wordmark className="text-4xl" />
        </div>
        <AuthView path={path} />
      </div>
    </div>
  );
}
