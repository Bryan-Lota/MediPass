function seedFrom(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

const gradients: [string, string][] = [
  ["#2E9E9E", "#0E1A1A"],
  ["#176B6B", "#0E1A1A"],
  ["#3fb3b3", "#152626"],
  ["#2E9E9E", "#152626"],
];

/** Deterministic geometric placeholder avatar — a monogram inside a hashed ring, no photo required. */
export function AvatarGlyph({ name, className }: { name: string; className?: string }) {
  const seed = seedFrom(name);
  const [from, to] = gradients[seed % gradients.length]!;
  const gradId = `avatar-grad-${seed}`;
  const tickCount = 16;
  const rotation = seed % 360;

  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label={`${name} avatar`}>
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={from} stopOpacity="0.35" />
          <stop offset="100%" stopColor={to} stopOpacity="0.06" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill={`url(#${gradId})`} stroke="#A8DDDD" strokeWidth="2" />
      <g stroke="#2E9E9E" strokeOpacity="0.5" transform={`rotate(${rotation} 60 60)`}>
        {Array.from({ length: tickCount }).map((_, i) => {
          const angle = (i / tickCount) * 2 * Math.PI;
          const inner = 50;
          const outer = i % 4 === 0 ? 56 : 53;
          return (
            <line
              key={i}
              x1={60 + inner * Math.cos(angle)}
              y1={60 + inner * Math.sin(angle)}
              x2={60 + outer * Math.cos(angle)}
              y2={60 + outer * Math.sin(angle)}
              strokeWidth={i % 4 === 0 ? 1.5 : 1}
            />
          );
        })}
      </g>
      <text
        x="60"
        y="70"
        textAnchor="middle"
        fontSize="34"
        fontWeight="600"
        fill="#176B6B"
        fontFamily="var(--font-inter), sans-serif"
      >
        {name.charAt(0)}
      </text>
    </svg>
  );
}
