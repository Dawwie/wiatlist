import Link from "next/link";
import { BrandMark, Wordmark } from "./brand";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1.5">
      <BrandMark className="h-7 w-7 stroke-brand-forest" />
      <Wordmark className="text-xl" />
    </Link>
  );
}
