"use client";

import { motion } from "framer-motion";

const arcs = [
  "M70,150 Q150,60 230,150",
  "M40,140 Q150,220 260,140",
  "M90,90 Q150,150 210,210",
];

const dots = [
  { x: 70, y: 150 },
  { x: 230, y: 150 },
  { x: 40, y: 140 },
  { x: 260, y: 140 },
  { x: 90, y: 90 },
  { x: 210, y: 210 },
];

export function GlobeCircuit({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 300"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <circle cx="150" cy="150" r="95" fill="none" stroke="#2E9E9E" strokeOpacity="0.35" strokeWidth="1.5" />
      <ellipse cx="150" cy="150" rx="95" ry="32" fill="none" stroke="#2E9E9E" strokeOpacity="0.25" strokeWidth="1" />
      <ellipse cx="150" cy="150" rx="45" ry="95" fill="none" stroke="#2E9E9E" strokeOpacity="0.25" strokeWidth="1" />
      <ellipse cx="150" cy="150" rx="95" ry="95" fill="none" stroke="#2E9E9E" strokeOpacity="0" />
      <line x1="55" y1="150" x2="245" y2="150" stroke="#2E9E9E" strokeOpacity="0.2" strokeWidth="1" />
      <line x1="150" y1="55" x2="150" y2="245" stroke="#2E9E9E" strokeOpacity="0.2" strokeWidth="1" />

      {arcs.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke="#A8DDDD"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 3.5,
            delay: i * 0.9,
            repeat: Infinity,
            repeatDelay: 1.2,
            ease: "easeInOut",
          }}
        />
      ))}

      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="3" fill="#2E9E9E" />
      ))}
    </svg>
  );
}
