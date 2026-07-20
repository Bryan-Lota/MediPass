import type { Metadata } from "next";
import { Nav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";
import { Card } from "@/components/ui/card";
import { HashChainRibbon } from "@/components/illustrations/hash-chain-ribbon";
import { GlobeCircuit } from "@/components/illustrations/globe-circuit";

export const metadata: Metadata = {
  title: "About — DigiMedPass",
  description: "The architecture, BSV rationale, and honest boundaries of the DigiMedPass proof of concept.",
};

const physicalChain = [
  "Manufacture device / batch",
  "Package & sterilise",
  "Freight across border",
  "Customs & market entry",
  "Distribution to provider",
];

const evidenceChain = [
  "QMS certificate issued",
  "Test & sterilisation reports hashed",
  "Declaration of conformity anchored",
  "Market checklist re-verified",
  "Audit trail available to distributor",
];

const bsvReasons = [
  { title: "Transaction-based anchoring", body: "Each evidence event is a discrete, timestamped transaction — a natural fit for lifecycle events." },
  { title: "Simple hash verification", body: "Recomputing and comparing a SHA-256 commitment is cheap and requires no special tooling." },
  { title: "Signatures & issuer identity", body: "Cryptographic signing ties each record to a verifiable issuer." },
  { title: "SPV proofs", body: "Lightweight proof of inclusion suits verifiers who don't run a full node." },
  { title: "Existing supply-chain patterns", body: "Prior work (Boston Scientific/IBM, MediLedger) established similar anchoring patterns to build on." },
];

const outOfScope = [
  "Replacing regulators, notified bodies, or authorised representatives",
  "Issuing any legal declaration of compliance",
  "Confidential document storage or encryption on-chain",
  "Automated legal or regulatory decision-making",
  "A production-grade, audited implementation (this is a one-week PoC)",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <section className="bg-white px-6 pb-16 pt-20 sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-6 inline-block rounded-full border border-line bg-teal-50 px-3.5 py-1.5 font-mono text-xs font-semibold tracking-wide text-teal-700">
            ABOUT THE PROJECT
          </span>
          <h1 className="mb-5 text-[32px] font-semibold leading-tight tracking-tight sm:text-[44px]">
            A second supply chain, running parallel to the physical one.
          </h1>
          <p className="text-[17px] leading-relaxed text-muted">
            Every physical shipment of a medical device is shadowed by a paper trail of
            regulatory evidence. DigiMed makes that evidence trail independently verifiable —
            without duplicating or exposing it.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-10 sm:pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-line shadow-card sm:grid-cols-2">
            <div className="border-b border-line p-8 sm:border-b-0 sm:border-r">
              <div className="mb-4 font-mono text-[11px] font-semibold text-muted">
                PHYSICAL SUPPLY CHAIN
              </div>
              <div className="flex flex-col gap-2.5">
                {physicalChain.map((item) => (
                  <div key={item} className="rounded-lg border border-line px-3.5 py-3 text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-teal-50 p-8">
              <div className="mb-4 font-mono text-[11px] font-semibold text-teal-700">
                EVIDENCE SUPPLY CHAIN
              </div>
              <div className="flex flex-col gap-2.5">
                {evidenceChain.map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-teal-200 bg-white px-3.5 py-3 text-sm text-teal-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-5 text-center text-sm text-muted">
            Each physical step has a matching evidentiary step — DigiMed anchors the second chain,
            not the first.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#152626] px-6 py-20 sm:px-10 sm:py-24">
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
            &ldquo;The chain doesn&rsquo;t store the truth. It stores proof that the truth
            hasn&rsquo;t changed.&rdquo;
          </p>
          <HashChainRibbon className="mx-auto mt-10 h-auto w-full max-w-xl opacity-90" />
        </div>
      </section>

      <section className="bg-white px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-3 text-center text-[28px] font-semibold tracking-tight sm:text-[30px]">
            Why BSV
          </h2>
          <p className="mx-auto mb-10 max-w-[56ch] text-center text-[15px] text-muted">
            BSV&rsquo;s transaction model fits the shape of this problem well.
          </p>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {bsvReasons.map((r) => (
              <Card key={r.title} className="p-6">
                <div className="mb-2 text-[15px] font-semibold text-teal-700">{r.title}</div>
                <p className="text-sm leading-relaxed text-muted">{r.body}</p>
              </Card>
            ))}
            <div className="rounded-xl border-2 border-amber-border bg-amber-bg p-6">
              <div className="mb-2 text-[15px] font-semibold text-amber-text">Honest caveat</div>
              <p className="text-sm leading-relaxed text-[#6b5000]">
                BSV itself provides no confidential storage, encryption, or access control — those
                stay application responsibilities, handled entirely off-chain.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-teal-50 p-8 shadow-card">
            <div className="mb-3.5 font-mono text-xs font-semibold text-muted">
              EXPLICITLY OUT OF SCOPE
            </div>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
              {outOfScope.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-2 text-center text-[28px] font-semibold tracking-tight sm:text-[30px]">
            What DigiMed is
          </h2>
          <p className="mb-10 text-center text-base text-muted">
            An independently verifiable evidence layer beneath existing regulatory processes —
            nothing more.
          </p>
          <div className="rounded-xl border border-teal-700 bg-teal-50 p-8">
            <div className="mb-3 font-mono text-xs font-semibold text-teal-700">
              BUSINESS MODEL SKETCH — &ldquo;REGULATORY EVIDENCE AS A SERVICE&rdquo;
            </div>
            <p className="mb-3 text-[15px] leading-relaxed text-ink">
              Manufacturers subscribe per device family or per export market; the service hosts
              the completeness engine, checklist logic, and anchoring pipeline. Verifiers
              (regulators, notified bodies, distributors) query the chain and recompute hashes for
              free.
            </p>
            <p className="text-[13px] leading-relaxed text-muted">
              Illustrative sketch only — not a costed or validated business plan.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#152626] px-6 py-20 sm:px-10">
        <GlobeCircuit className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-30" />
        <div className="relative mx-auto max-w-xl text-center">
          <p className="text-lg font-semibold leading-snug tracking-tight text-white sm:text-xl">
            &ldquo;We&rsquo;re not asking anyone to trust us. We&rsquo;re asking them to check the
            math.&rdquo;
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
