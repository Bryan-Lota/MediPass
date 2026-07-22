"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { ensureSeedUsers, registerUser, verifyUser, DEMO_ACCOUNTS } from "@/lib/users";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NodeLattice } from "@/components/illustrations/node-lattice";
import { HexField } from "@/components/illustrations/hex-field";
import { Squiggle } from "@/components/illustrations/squiggle";

function dashboardFor(role: Role) {
  return role === "regulator" ? "/regulator" : "/dashboard";
}

type Mode = "signin" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { session, ready, signIn } = useSession();

  const [usersReady, setUsersReady] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<Role>("manufacturer");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showHint, setShowHint] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    ensureSeedUsers().finally(() => setUsersReady(true));
  }, []);

  useEffect(() => {
    if (ready && session) router.replace(dashboardFor(session.role));
  }, [ready, session, router]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !usersReady) return;
    if (!email || !password) {
      setError("Enter both email and password.");
      return;
    }
    setSubmitting(true);
    setError("");
    const user = await verifyUser(email, password);
    if (!user) {
      setSubmitting(false);
      setError("Invalid email or password.");
      return;
    }
    signIn(user.email, user.role);
    router.push(dashboardFor(user.role));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !usersReady) return;
    setSubmitting(true);
    setError("");
    const result = await registerUser({ email, password, role, name, company });
    if (!result.ok) {
      setSubmitting(false);
      setError(result.error);
      return;
    }
    signIn(result.user.email, result.user.role);
    router.push(dashboardFor(result.user.role));
  }

  async function quickDemoSignIn(demoRole: Role) {
    if (submitting || !usersReady) return;
    setSubmitting(true);
    setError("");
    const creds = DEMO_ACCOUNTS[demoRole];
    const user = await verifyUser(creds.email, creds.password);
    if (!user) {
      setSubmitting(false);
      setError("Demo account isn't ready yet — try again in a moment.");
      return;
    }
    signIn(user.email, user.role);
    router.push(dashboardFor(user.role));
  }

  const tabBtn = (active: boolean) =>
    cn(
      "flex-1 rounded-full border-[1.5px] px-4 py-2.5 text-sm font-semibold transition-colors",
      active ? "border-teal-600 bg-teal-100 text-teal-700" : "border-line bg-white text-muted"
    );

  return (
    <div className="relative grid min-h-screen grid-cols-1 overflow-hidden bg-gradient-to-b from-teal-50 to-white lg:grid-cols-2">
      <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-indigo-100 opacity-60 blur-3xl lg:hidden" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-teal-100 opacity-70 blur-3xl lg:hidden" />
      <div className="relative mx-auto flex w-full max-w-[520px] flex-col justify-center px-8 py-16 sm:px-16">
        <Link href="/" className="mb-10 flex items-center gap-2.5">
          <span className="font-display text-[19px] font-semibold tracking-tight text-teal-700">MedPass</span>
        </Link>

        <h1 className="mb-2 font-display text-[30px] font-semibold tracking-tight">
          <span className="relative inline-block whitespace-nowrap">
            {mode === "signin" ? "Sign in" : "Create account"}
            <Squiggle className="absolute -bottom-1 left-0 h-[8px] w-full text-teal-500" />
          </span>
        </h1>
        <p className="mb-6 mt-2 text-[15px] text-muted">
          {mode === "signin"
            ? "Sign in with your MedPass account."
            : "Register a manufacturer or regulator account — real accounts, hashed passwords."}
        </p>

        <div className="mb-6 flex gap-2">
          <button type="button" className={tabBtn(mode === "signin")} onClick={() => { setMode("signin"); setError(""); }}>
            Sign in
          </button>
          <button type="button" className={tabBtn(mode === "register")} onClick={() => { setMode("register"); setError(""); }}>
            Create account
          </button>
        </div>

        {showHint && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-line bg-teal-50 px-3.5 py-3">
            <div className="text-[13px] text-muted">
              <div className="mb-1.5 font-semibold text-ink">Try it instantly:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => quickDemoSignIn("manufacturer")}
                  disabled={submitting || !usersReady}
                  className="rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 disabled:opacity-50"
                >
                  Sign in as demo manufacturer
                </button>
                <button
                  type="button"
                  onClick={() => quickDemoSignIn("regulator")}
                  disabled={submitting || !usersReady}
                  className="rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 disabled:opacity-50"
                >
                  Sign in as demo regulator
                </button>
              </div>
              <div className="mt-2 font-mono text-[11px]">
                {DEMO_ACCOUNTS.manufacturer.email} / {DEMO_ACCOUNTS.manufacturer.password}
              </div>
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

        {mode === "signin" ? (
          <form onSubmit={handleSignIn} className="flex flex-col gap-[18px]">
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
              <div className="rounded-xl border border-danger-border bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
                {error}
              </div>
            )}
            <Button type="submit" disabled={submitting || !usersReady} className="mt-1.5 w-full py-3.5 text-[15px]">
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-[18px]">
            <div className="flex gap-2">
              <button type="button" className={tabBtn(role === "manufacturer")} onClick={() => setRole("manufacturer")}>
                Manufacturer
              </button>
              <button type="button" className={tabBtn(role === "regulator")} onClick={() => setRole("regulator")}>
                Regulator
              </button>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold">Full name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Reyes" autoComplete="name" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold">
                {role === "regulator" ? "Regulatory body" : "Company"}
              </label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={role === "regulator" ? "EU/FDA Verifier Office" : "Acme MedTech Ltd."}
                autoComplete="organization"
              />
            </div>
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
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>
            {error && (
              <div className="rounded-xl border border-danger-border bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
                {error}
              </div>
            )}
            <Button type="submit" disabled={submitting || !usersReady} className="mt-1.5 w-full py-3.5 text-[15px]">
              {submitting ? "Creating account…" : `Create ${role} account`}
            </Button>
          </form>
        )}
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
          <div className="mb-1.5 font-display text-3xl font-semibold tracking-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,.4)]">
            MedPass
          </div>
          <div className="mt-2 text-[13px] text-teal-200 [text-shadow:0_2px_12px_rgba(0,0,0,.4)]">
            Regulatory evidence you can prove.
          </div>
        </div>
      </div>
    </div>
  );
}
