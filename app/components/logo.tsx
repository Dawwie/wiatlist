import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1.5">
      <svg
        viewBox="0 0 64 64"
        className="h-7 w-7 stroke-brand-forest"
        fill="none"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M13 17 L23 47 L32 29 L41 47 L51 17" />
      </svg>
      <span className="font-display text-xl tracking-tight text-brand-ink">
        Wiatlist
      </span>
    </Link>
  );
}
