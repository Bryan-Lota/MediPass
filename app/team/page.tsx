import type { Metadata } from "next";
import { Nav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";
import { AvatarGlyph } from "@/components/illustrations/avatar-glyph";
import { NodeLattice } from "@/components/illustrations/node-lattice";

export const metadata: Metadata = {
  title: "Team — DigiMedPass",
  description: "The five people behind the DigiMedPass proof of concept.",
};

const team = [
  { name: "Bryan", role: "Leads architecture and BSV integration." },
  { name: "Sian", role: "Maps MDR/FDA requirements to evidence checklists." },
  { name: "Sana", role: "Sketches the evidence-as-a-service cost model." },
  { name: "Pirnavan", role: "Owns the site, demo flow and visual system." },
  { name: "Yuxuan", role: "Builds the anchoring pipeline and demo backend." },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <section className="px-6 pb-6 pt-20 sm:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-6 inline-block rounded-full border border-line bg-teal-50 px-3.5 py-1.5 font-mono text-xs font-semibold tracking-wide text-teal-700">
            THE TEAM
          </span>
          <h1 className="mb-4 text-[28px] font-semibold tracking-tight sm:text-[40px]">
            Five people, one proof of concept.
          </h1>
          <p className="text-base leading-relaxed text-muted">
            Photos below are placeholders — everything else is the real team behind DigiMed.
          </p>
        </div>
      </section>

      <section className="px-6 pb-8 pt-12 sm:px-10">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <div key={member.name} className="text-center">
              <AvatarGlyph name={member.name} className="mx-auto mb-4 h-24 w-24" />
              <div className="text-base font-semibold">{member.name}</div>
              <p className="mx-auto mt-2.5 mb-3 max-w-[26ch] text-[13px] leading-relaxed text-muted">
                {member.role}
              </p>
              <div className="flex justify-center gap-3 text-xs font-semibold text-teal-700">
                <a href="#">LinkedIn</a>
                <a href="#">GitHub</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#152626] px-6 py-24 sm:px-10">
        <NodeLattice className="pointer-events-none absolute inset-0 h-full w-full opacity-30" />
        <div className="relative mx-auto max-w-xl text-center">
          <p className="text-2xl font-semibold tracking-tight text-white">
            Five people. One proof of concept.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
