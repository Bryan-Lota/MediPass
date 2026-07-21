import type { SVGProps } from "react";

/** A hand-drawn-feel underline accent — used beneath an emphasized headline phrase. */
export function Squiggle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={7}
      strokeLinecap="round"
      aria-hidden="true"
      preserveAspectRatio="none"
      {...props}
    >
      <path d="M2 9C34 2 74 2 100 7c26 5 66 5 98-2" />
    </svg>
  );
}
