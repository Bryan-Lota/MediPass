/** Tileable low-opacity hex-grid texture. Decorative only. */
export function HexField({ className, opacity = 0.08 }: { className?: string; opacity?: number }) {
  const id = "hex-field-pattern";
  return (
    <svg
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <pattern id={id} width="44" height="76" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
          <path
            d="M22 0 L44 12.7 L44 38 L22 50.7 L0 38 L0 12.7 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M22 50.7 L44 63.3 L44 88.7 L22 101.3 L0 88.7 L0 63.3 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  );
}
