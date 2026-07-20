import type { SVGProps } from "react";

/**
 * Small line-icon set for landing-page diagrams. All 40x40 viewBox, stroke-only,
 * currentColor — size and color are controlled entirely by the className passed in.
 */
function IconBase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export function IconManufacturer(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M7 33V16l8-5v7l8-5v20" />
      <path d="M7 33h26" />
      <path d="M23 33V13l10 6v14" />
      <path d="M12 22h2M12 27h2M19 22h2M19 27h2" />
    </IconBase>
  );
}

export function IconApp(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M20 6l11 4v9c0 8-5 13-11 15C14 32 9 27 9 19v-9l11-4z" />
      <path d="M15.5 20.5l3 3 6-6.5" />
    </IconBase>
  );
}

export function IconChain(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="6" y="14" width="14" height="9" rx="4.5" />
      <rect x="20" y="17" width="14" height="9" rx="4.5" />
    </IconBase>
  );
}

export function IconVerifier(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="17" cy="17" r="10" />
      <path d="M12.5 17.5l3 3 6-6.5" />
      <path d="M24.5 24.5L33 33" />
    </IconBase>
  );
}

export function IconTag(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M6 19.5L19.5 6H31a3 3 0 013 3v11.5L20.5 34a2 2 0 01-2.8 0L6 22.3a2 2 0 010-2.8z" />
      <circle cx="25" cy="15" r="2.2" />
    </IconBase>
  );
}

export function IconGlobe(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="20" cy="20" r="14" />
      <path d="M6 20h28M20 6c4.7 3.7 7 8.6 7 14s-2.3 10.3-7 14c-4.7-3.7-7-8.6-7-14s2.3-10.3 7-14z" />
      <path d="M9 12.5h22M9 27.5h22" />
    </IconBase>
  );
}

export function IconUpload(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M11 27a6.5 6.5 0 01-1-12.9A8 8 0 0126 11a6 6 0 013 11" />
      <path d="M20 32V18M15.5 22.5L20 18l4.5 4.5" />
    </IconBase>
  );
}

export function IconHash(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M13 8l-4 24M27 8l-4 24M8 16h24M6.5 25h24" />
    </IconBase>
  );
}

export function IconChecklist(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="9" y="7" width="20" height="27" rx="2.5" />
      <path d="M15 5.5h8a1 1 0 011 1V9h-10V6.5a1 1 0 011-1z" />
      <path d="M13.5 18l2 2 4-4.5M13.5 26l2 2 4-4.5" />
      <path d="M22 19h5M22 27h5" />
    </IconBase>
  );
}
