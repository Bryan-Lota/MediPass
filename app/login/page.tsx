"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { demoCredentials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NodeLattice } from "@/components/illustrations/node-lattice";
import { HexField } from "@/components/illustrations/hex-field";

function dashboardFor(role: Role) {
  return role === "regulator" ? "/regulator" : "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const { session, ready, signIn } = useSession();

  const [role, setRole] = useState<Role>("manufacturer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showHint, setShowHint] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && session) router.replace(dashboardFor(session.role));
  }, [ready, session, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!email || !password) {
      setError("Enter both email and password.");
      return;
    }
    setSubmitting(true);
    setError("");
    setTimeout(() => {
      if (email === demoCredentials.email && password === demoCredentials.password) {
        signIn(email, role);
        router.push(dashboardFor(role));
      } else {
        setSubmitting(false);
        setError("Invalid credentials. Try the demo login above.");
      }
    }, 500);
  }

  const roleBtn = (active: boolean) =>
    cn(
      "flex-1 rounded-lg border-[1.5px] px-4 py-2.5 text-sm font-semibold transition-colors",
      active ? "border-teal-600 bg-teal-100 text-teal-700" : "border-line bg-white text-muted"
    );

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="mx-auto flex w-full max-w-[520px] flex-col justify-center px-8 py-16 sm:px-16">
        <Link href="/" className="mb-12 flex items-center gap-2.5">
          <span className="text-[19px] font-bold tracking-tight text-teal-700">DigiMed</span>
        </Link>

        <h1 className="mb-2 text-[28px] font-semibold tracking-tight">Sign in</h1>
        <p className="mb-6 text-[15px] text-muted">
          Choose your role, then sign in to your dashboard.
        </p>

        <div className="mb-6 flex gap-2">
          <button type="button" className={roleBtn(role === "manufacturer")} onClick={() => setRole("manufacturer")}>
            Manufacturer
          </button>
          <button type="button" className={roleBtn(role === "regulator")} onClick={() => setRole("regulator")}>
            Regulator
          </button>
        </div>

        {showHint && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-line bg-teal-50 px-3.5 py-3">
            <div className="text-[13px] text-muted">
              Demo credentials:{" "}
              <span className="font-mono text-teal-700">{demoCredentials.email}</span> /{" "}
              <span className="font-mono text-teal-700">{demoCredentials.password}</span> — works
              for either role
            </div>
            <button
              type="button"
              onClick={() => setShowHint(false)}
              className="flex-shrink-0 border-none bg-transparent text-base leading-none text-muted"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className="rounded-lg border border-danger-border bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
              {error}
            </div>
          )}
          <Button type="submit" disabled={submitting} className="mt-1.5 w-full py-3.5 text-[15px]">
            {submitting ? "Signing in…" : `Sign in as ${role === "regulator" ? "Regulator" : "Manufacturer"}`}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted">
          No account yet?{" "}
          <Link href="/login" className="font-semibold">
            Sign up
          </Link>{" "}
          (mocked — same demo credentials apply).
        </p>
      </div>

      <div className="relative hidden items-center justify-center overflow-hidden bg-ink lg:flex">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(14,26,26,.9), rgba(23,107,107,.65)), radial-gradient(circle at 30% 20%, rgba(46,158,158,.35), transparent 60%)",
          }}
        />
        <HexField className="text-teal-600" opacity={0.06} />
        <NodeLattice className="absolute inset-0 h-full w-full opacity-70" />
        <div className="relative pointer-events-none text-center">
          <div className="mb-1.5 text-3xl font-bold tracking-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,.4)]">
            DigiMed
          </div>
          <div className="mt-2 text-[13px] text-teal-200 [text-shadow:0_2px_12px_rgba(0,0,0,.4)]">
            Regulatory evidence you can prove.
          </div>
        </div>
      </div>
    </div>
  );
}
