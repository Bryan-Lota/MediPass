"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { getUser, updateUserProfile, type UserAccount } from "@/lib/users";
import { AvatarGlyph } from "@/components/illustrations/avatar-glyph";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function dashboardFor(role: string) {
  return role === "regulator" ? "/regulator" : "/dashboard";
}

export default function ProfilePage() {
  const router = useRouter();
  const { session, ready, signOut } = useSession();
  const [account, setAccount] = useState<UserAccount | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    const user = getUser(session.email);
    setAccount(user ?? null);
    if (user) {
      setName(user.name);
      setCompany(user.company);
    }
  }, [ready, session, router]);

  if (!ready || !session || account === undefined) {
    return <div className="min-h-screen bg-teal-50" />;
  }

  const handleSave = () => {
    if (!session) return;
    updateUserProfile(session.email, { name: name.trim(), company: company.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-teal-50">
      <nav className="flex items-center justify-between border-b border-line bg-white px-6 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="font-display text-[17px] font-semibold tracking-tight text-teal-700">MedPass</span>
        </Link>
        <Link href={dashboardFor(session.role)} className="text-sm font-semibold text-teal-700">
          ← Back to dashboard
        </Link>
      </nav>

      <div className="mx-auto flex max-w-2xl flex-col gap-5 px-6 py-10 sm:px-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Profile</h1>

        <Card className="p-7">
          <div className="mb-6 flex items-center gap-4">
            <AvatarGlyph name={name || session.email} className="h-16 w-16" />
            <div>
              <div className="text-lg font-semibold">{name || "Unnamed"}</div>
              <span className="mt-1 inline-block rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-teal-700">
                {session.role}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold">Full name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold">
                {session.role === "regulator" ? "Regulatory body" : "Company"}
              </label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold">Email</label>
              <Input value={session.email} disabled className="opacity-60" />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button size="sm" onClick={handleSave}>
              Save changes
            </Button>
            {saved && <span className="text-xs font-semibold text-teal-700">Saved.</span>}
          </div>
        </Card>

        <Card className="p-5">
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </Card>
      </div>
    </div>
  );
}
