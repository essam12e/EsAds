import Image from "next/image";
import Link from "next/link";

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="logo" aria-label="أكاديمية المتجر">
      <Image src="/logo-icon.png" alt="" width={46} height={42} priority />
      <span>أكاديمية المتجر</span>
    </Link>
  );
}
