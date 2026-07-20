import { Fragment } from "react";
import Link from "next/link";
import { Nav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";
import { LiveVerificationDemo } from "@/components/marketing/live-verification-demo";
import { FadeUp } from "@/components/marketing/fade-up";
import { Card } from "@/components/ui/card";
import { HexField } from "@/components/illustrations/hex-field";
import { NodeLattice } from "@/components/illustrations/node-lattice";
import {
  IconManufacturer,
  IconApp,
  IconChain,
  IconVerifier,
  IconTag,
  IconGlobe,
  IconUpload,
  IconHash,
  IconChecklist,
} from "@/components/illustrations/icons";

const stats = [
  { value: "6+", label: "systems per manufacturer holding fragments of the same dossier" },
  { value: "3–5×", label: "duplicated copies of the same certificate across markets" },
  { value: "frequent", label: "version-control failures between consultants and portals" },
  { value: "weeks", label: "typical delay re-verifying evidence for a new market" },
];

const actors = [
  {
    icon: IconManufacturer,
    title: "Manufacturer",
    body: "Uploads regulatory evidence for a device or batch.",
  },
  {
    icon: IconApp,
    title: "DigiMed",
    body: "Encrypts it off-chain and computes a SHA-256 commitment.",
  },
  {
    icon: IconChain,
    title: "BSV chain",
    body: "Anchors the commitment, issuer and timestamp — never the document.",
  },
  {
    icon: IconVerifier,
    title: "Verifier",
    body: "Recomputes the hash and compares it, independently.",
  },
];

const steps = [
  { n: "01", icon: IconTag, title: "Register device / batch", body: "Manufacturer creates a passport for a device or production batch." },
  { n: "02", icon: IconGlobe, title: "Select destination markets", body: "e.g. EU and US — each pulls its own evidence checklist." },
  { n: "03", icon: IconUpload, title: "Upload to protected storage", body: "Dossiers are encrypted and access-controlled off-chain." },
  { n: "04", icon: IconHash, title: "Hash anchored to BSV", body: "SHA-256 fingerprint and metadata recorded on-chain." },
  { n: "05", icon: IconChecklist, title: "Completeness computed per market", body: "The engine tracks status against each market's checklist." },
  { n: "06", icon: IconVerifier, title: "Verifier recomputes & confirms", body: "An authorised party rehashes the document and checks the chain." },
];

const pillars = [
  { tag: "TECHNICAL", title: "Working hybrid architecture", body: "A functioning demo of off-chain storage anchored by on-chain BSV commitments, end to end.", output: "Output: this prototype + verification demo" },
  { tag: "ECONOMIC", title: "A sustainable service model", body: "An early “evidence as a service” cost and value model for SME manufacturers.", output: "Output: outline business model" },
  { tag: "REGULATORY", title: "A clearly-bounded role", body: "Mapped against existing MDR/FDA evidence requirements, without claiming to replace them.", output: "Output: scope & boundary analysis" },
];

const priorArt = [
  { project: "Boston Scientific / IBM", focus: "Supply chain", tracks: "Products, shipments" },
  { project: "MediLedger / Chronicled", focus: "Drug traceability", tracks: "Product ownership, orders" },
  { project: "Academic prototypes", focus: "Traceability concepts", tracks: "Varies, mostly product-centric" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white px-6 pb-20 pt-16 sm:px-10 sm:pb-24 sm:pt-24">
        <div className="pointer-events-none absolute inset-0 bg-grid bg-[length:36px_36px] opacity-[0.04]" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <FadeUp>
            <span className="mb-6 inline-block rounded-full border border-line bg-teal-50 px-3.5 py-1.5 font-mono text-xs font-semibold tracking-wide text-teal-700">
              PROOF OF CONCEPT · BSV BLOCKCHAIN
            </span>
            <h1 className="mb-5 max-w-[11.5ch] text-[40px] font-semibold leading-[1.08] tracking-tight sm:text-[56px]">
              Regulatory evidence you can prove — without exposing it.
            </h1>
            <p className="mb-8 max-w-[52ch] text-[17px] leading-relaxed text-muted">
              Confidential dossiers stay off-chain, encrypted and access-controlled. Only a
              cryptographic fingerprint — hash, issuer, device, timestamp — is anchored to the
              BSV blockchain, so any authorised party can verify without ever seeing the document.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <a
                href="#live-verification"
                className="rounded-lg bg-teal-600 px-6 py-3.5 text-[15px] font-semibold text-white no-underline hover:bg-teal-700"
              >
                See the verification demo
              </a>
              <Link
                href="/about"
                className="rounded-lg border-[1.5px] border-line px-6 py-3.5 text-[15px] font-semibold text-ink no-underline hover:border-teal-600"
              >
                Read the architecture
              </Link>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-teal-50 p-7 shadow-card">
              <div className="flex items-center gap-3 rounded-lg border border-line bg-white px-4 py-3">
                <div className="h-7 w-7 flex-shrink-0 rounded-md border-[1.5px] border-ink bg-white" />
                <div>
                  <div className="text-[13px] font-semibold">Dossier</div>
                  <div className="text-[11px] text-muted">confidential PDF, off-chain</div>
                </div>
              </div>
              <div className="self-center font-mono text-[13px] text-teal-600">↓ SHA-256</div>
              <div className="flex items-center gap-3 rounded-lg border border-teal-200 bg-white px-4 py-3">
                <div className="h-7 w-7 flex-shrink-0 rounded-md border-[1.5px] border-teal-600 bg-teal-100" />
                <div>
                  <div className="font-mono text-[13px] font-semibold">a3f9c2…8e41d0</div>
                  <div className="text-[11px] text-muted">document commitment</div>
                </div>
              </div>
              <div className="self-center font-mono text-[13px] text-teal-600">↓ anchor</div>
              <div className="flex items-center gap-3 rounded-lg bg-teal-700 px-4 py-3">
                <div className="h-7 w-7 flex-shrink-0 rounded-md bg-teal-600" />
                <div>
                  <div className="text-[13px] font-semibold text-white">BSV transaction</div>
                  <div className="text-[11px] text-teal-200">txid recorded, timestamped</div>
                </div>
              </div>
              <div className="self-center font-mono text-[13px] text-teal-600">↓ verify</div>
              <div className="flex items-center gap-3 rounded-lg border-[1.5px] border-teal-600 bg-white px-4 py-3">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 border-teal-600 text-sm text-teal-600">
                  ✓
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-teal-700">Verified seal</div>
                  <div className="text-[11px] text-muted">hash match confirmed</div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Problem stats */}
      <section className="relative overflow-hidden bg-ink px-6 py-20 sm:px-10 sm:py-24">
        <HexField className="text-teal-600" opacity={0.07} />
        <NodeLattice className="pointer-events-none absolute -right-16 -top-10 h-[420px] w-[420px] opacity-30 lg:opacity-40" />
        <div className="relative mx-auto max-w-5xl">
          <h2 className="mb-10 max-w-[20ch] text-2xl font-semibold tracking-tight text-white sm:text-[32px]">
            Regulatory evidence is scattered — and slow to re-verify.
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-sm"
              >
                <div className="mb-2.5 font-mono text-[11px] text-teal-200">
                  ILLUSTRATIVE · UNVERIFIED
                </div>
                <div className="mb-1.5 text-[30px] font-semibold text-white">{s.value}</div>
                <div className="text-sm leading-relaxed text-white/75">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency vs privacy */}
      <section className="bg-teal-50 px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-[28px] font-semibold tracking-tight sm:text-[30px]">
            Transparency and privacy pull in opposite directions.
          </h2>
          <div className="mb-9 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card className="p-8">
              <div className="mb-3 font-mono text-xs font-semibold text-muted">FULL TRANSPARENCY</div>
              <div className="mb-2.5 text-lg font-semibold">A public dossier</div>
              <p className="text-[15px] leading-relaxed text-muted">
                Publishing raw certificates and test reports openly makes verification trivial —
                but exposes trade secrets, personal data and competitive detail. That&rsquo;s a
                breach, not a feature.
              </p>
            </Card>
            <Card className="p-8">
              <div className="mb-3 font-mono text-xs font-semibold text-muted">FULL PRIVACY</div>
              <div className="mb-2.5 text-lg font-semibold">A private ledger</div>
              <p className="text-[15px] leading-relaxed text-muted">
                Keeping every record internal protects confidentiality — but leaves no independent
                way for a regulator or partner to confirm anything without trusting the
                manufacturer outright. That&rsquo;s a silo.
              </p>
            </Card>
          </div>
          <p className="mx-auto max-w-[34ch] text-center text-xl font-semibold tracking-tight text-teal-700 sm:text-[22px]">
            &ldquo;A public dossier is a breach. A private ledger is a silo. DigiMed anchors proof,
            not paperwork.&rdquo;
          </p>
        </div>
      </section>

      {/* Two layers */}
      <section className="bg-white px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-[28px] font-semibold tracking-tight sm:text-[30px]">
            Two layers, one system
          </h2>
          <p className="mb-12 text-center text-base text-muted">
            The hybrid architecture that keeps evidence private and proof public.
          </p>
          <div className="grid grid-cols-1 items-stretch gap-7 lg:grid-cols-[1fr_auto_1fr]">
            <Card className="p-7">
              <div className="mb-5 flex items-center gap-2.5">
                <div className="relative h-6 w-6 rounded border-2 border-ink" />
                <div className="text-base font-bold">Off-chain application layer</div>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  "Confidential PDFs (encrypted at rest)",
                  "Access control & permissioning",
                  "Market-specific evidence checklists",
                  "Completeness calculation engine",
                ].map((item) => (
                  <div key={item} className="rounded-lg border border-line px-3.5 py-3 text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </Card>
            <div className="flex flex-row items-center justify-center gap-2 py-2 lg:flex-col lg:px-1">
              <div className="h-px w-10 bg-teal-600 lg:h-[40%] lg:w-px" />
              <div className="whitespace-nowrap font-mono text-[11px] font-semibold text-teal-600 lg:[writing-mode:vertical-rl]">
                SHA-256 HASH →
              </div>
              <div className="h-px w-10 bg-teal-600 lg:h-[40%] lg:w-px" />
            </div>
            <div className="rounded-xl border border-teal-700 bg-teal-50 p-7">
              <div className="mb-5 flex items-center gap-2.5">
                <div className="flex gap-0.5">
                  <div className="h-5 w-3 rounded-[3px] border-2 border-teal-700" />
                  <div className="-ml-1 h-5 w-3 rounded-[3px] border-2 border-teal-700" />
                </div>
                <div className="text-base font-bold text-teal-700">BSV evidence layer</div>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  "SHA-256 document commitment",
                  "Issuer identity",
                  "Device / batch ID",
                  "Evidence type & destination market",
                  "Timestamp",
                  "Lifecycle events (submitted/reviewed/verified/expired/revoked)",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-teal-200 bg-white px-3.5 py-3 font-mono text-[13px]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-7 text-center text-sm text-muted">
            No confidential dossier ever touches the public chain — only the minimal cryptographic
            evidence above does.
          </p>
        </div>
      </section>

      {/* Who's involved */}
      <section className="bg-white px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-[28px] font-semibold tracking-tight sm:text-[30px]">
            Four parties, one proof
          </h2>
          <p className="mb-14 text-center text-base text-muted">
            Nobody has to trust anybody else&rsquo;s word — only the math.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-start">
            {actors.map((actor, i) => (
              <Fragment key={actor.title}>
                <div className="flex flex-1 flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 text-teal-700">
                    <actor.icon className="h-9 w-9" />
                  </div>
                  <div className="mb-1.5 text-[15px] font-semibold">{actor.title}</div>
                  <p className="max-w-[22ch] text-[13px] leading-relaxed text-muted">{actor.body}</p>
                </div>
                {i < actors.length - 1 && (
                  <div className="flex items-center justify-center py-2 text-teal-300 sm:py-0 sm:pt-8">
                    <span className="hidden text-xl sm:inline">→</span>
                    <span className="text-xl sm:hidden">↓</span>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-teal-50 px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-[28px] font-semibold tracking-tight sm:text-[30px]">
            How it works
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => (
              <Card key={step.n} className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="font-mono text-[22px] font-bold text-teal-200">{step.n}</div>
                </div>
                <div className="mb-2 text-base font-semibold">{step.title}</div>
                <p className="text-sm leading-relaxed text-muted">{step.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Live verification */}
      <section id="live-verification" className="relative overflow-hidden bg-ink px-6 py-20 sm:px-10 sm:py-24">
        <HexField className="text-teal-600" opacity={0.05} />
        <div className="relative mx-auto max-w-3xl">
          <h2 className="mb-2 text-center text-[28px] font-semibold tracking-tight text-white sm:text-[30px]">
            Live verification
          </h2>
          <p className="mb-10 text-center text-base text-teal-200">
            Pick a sample document and watch the check run end to end — the hash is computed for
            real, in your browser.
          </p>
          <LiveVerificationDemo />
        </div>
      </section>

      {/* Three pillars */}
      <section className="bg-white px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-[28px] font-semibold tracking-tight sm:text-[30px]">
            Three pillars of the proof of concept
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {pillars.map((p) => (
              <Card key={p.tag} className="p-8">
                <div className="mb-3.5 font-mono text-xs font-semibold text-teal-600">{p.tag}</div>
                <div className="mb-2.5 text-lg font-semibold">{p.title}</div>
                <p className="mb-4 text-sm leading-relaxed text-muted">{p.body}</p>
                <div className="text-[13px] font-semibold text-teal-700">{p.output}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Prior art */}
      <section className="bg-white px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 text-center text-[28px] font-semibold tracking-tight sm:text-[30px]">
            Where this sits relative to prior work
          </h2>
          <p className="mx-auto mb-10 max-w-[60ch] text-center text-[15px] text-muted">
            Existing blockchain supply-chain work traces products and orders. DigiMed manages
            reusable, privacy-aware regulatory evidence across jurisdictions instead.
          </p>
          <div className="overflow-hidden rounded-2xl border border-line shadow-card">
            <div className="grid grid-cols-3 gap-2 bg-teal-50 px-5 py-3.5 font-mono text-xs font-semibold text-muted">
              <div>PROJECT</div>
              <div>FOCUS</div>
              <div>WHAT IT TRACKS</div>
            </div>
            {priorArt.map((row) => (
              <div
                key={row.project}
                className="grid grid-cols-3 gap-2 border-t border-line px-5 py-4 text-sm"
              >
                <div className="font-semibold">{row.project}</div>
                <div className="text-muted">{row.focus}</div>
                <div className="text-muted">{row.tracks}</div>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-2 border-t border-line bg-teal-50 px-5 py-4 text-sm">
              <div className="font-bold text-teal-700">DigiMed</div>
              <div className="font-semibold text-teal-700">Regulatory evidence</div>
              <div className="font-semibold text-teal-700">
                Reusable, privacy-aware evidence across markets
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
