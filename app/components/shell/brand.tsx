// The "W" mark. Shared by the nav logo and the auth-page watermark so the two
// never drift apart.
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      strokeWidth={7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M13 17 L23 47 L32 29 L41 47 L51 17" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`font-display tracking-tight text-brand-ink ${className ?? ""}`}>
      Wiatlist
    </span>
  );
}
