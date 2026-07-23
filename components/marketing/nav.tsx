"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session";
import { LogoMark } from "@/components/illustrations/logo-mark";

const links = [
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
];

export function Nav() {
  const pathname = usePathname();
  const { session, ready } = useSession();

  const dashboardHref = session?.role === "regulator" ? "/regulator" : "/dashboard";

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-white/90 px-6 py-4 backdrop-blur-md sm:px-10">
      <Link href="/" className="flex items-center gap-2.5">
        <LogoMark className="h-8 w-8" />
        <span className="font-display text-xl font-semibold tracking-tight text-teal-700">MedPass</span>
      </Link>
      <div className="flex items-center gap-4 sm:gap-7">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "hidden text-[15px] font-medium text-ink no-underline hover:text-teal-700 sm:inline",
              pathname === link.href && "font-semibold text-teal-700"
            )}
          >
            {link.label}
          </Link>
        ))}
        {ready && session ? (
          <Link
            href={dashboardHref}
            className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-teal-700"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-teal-700"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
