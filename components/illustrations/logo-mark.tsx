/**
 * The MedPass mark — a flat, minimal badge built to match the site's own design
 * system (teal + indigo, no purple/gold), rather than a raster import. Concept:
 * a passport shield with a verification checkmark, plus a small indigo accent
 * node nodding at the on-chain anchoring — the same visual language as the
 * rest of the hand-built illustrations (hex-field, node-lattice, icons).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#176B6B" />
      <path
        d="M32 13 L47 18.5 V30 C47 40.5 41 47.5 32 51 C23 47.5 17 40.5 17 30 V18.5 Z"
        fill="#F4FAFA"
      />
      <path
        d="M24.5 30.5 L29.5 35.5 L40 24"
        stroke="#176B6B"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="49" cy="15" r="5.5" fill="#4C44D6" />
    </svg>
  );
}
