"use client";

import { motion } from "framer-motion";

interface Node {
  x: number;
  y: number;
  r: number;
}

const nodes: Node[] = [
  { x: 60, y: 70, r: 4 },
  { x: 160, y: 40, r: 3 },
  { x: 250, y: 90, r: 5 },
  { x: 340, y: 55, r: 3 },
  { x: 100, y: 170, r: 3 },
  { x: 210, y: 190, r: 6 },
  { x: 310, y: 160, r: 3 },
  { x: 40, y: 260, r: 3 },
  { x: 150, y: 290, r: 4 },
  { x: 260, y: 280, r: 3 },
  { x: 360, y: 250, r: 5 },
  { x: 190, y: 350, r: 3 },
  { x: 300, y: 370, r: 4 },
];

const edges: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [1, 4],
  [2, 5],
  [3, 6],
  [4, 5],
  [5, 6],
  [4, 7],
  [5, 8],
  [6, 9],
  [6, 10],
  [7, 8],
  [8, 9],
  [9, 10],
  [8, 11],
  [9, 12],
  [11, 12],
];

/** Traveling "confirmation" packets along a few edges, evoking transaction propagation. */
const packets: { edge: [number, number]; duration: number; delay: number }[] = [
  { edge: [0, 2], duration: 3.2, delay: 0 },
  { edge: [4, 6], duration: 2.6, delay: 0.6 },
  { edge: [8, 10], duration: 3.6, delay: 1.4 },
  { edge: [5, 11], duration: 2.8, delay: 2.1 },
];

export function NodeLattice({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      {edges.map(([a, b], i) => {
        const na = nodes[a]!;
        const nb = nodes[b]!;
        return (
          <line
            key={i}
            x1={na.x}
            y1={na.y}
            x2={nb.x}
            y2={nb.y}
            stroke="#2E9E9E"
            strokeWidth="1"
            strokeOpacity="0.35"
          />
        );
      })}

      {packets.map((p, i) => {
        const na = nodes[p.edge[0]]!;
        const nb = nodes[p.edge[1]]!;
        return (
          <motion.circle
            key={i}
            r="2.5"
            fill="#A8DDDD"
            initial={{ cx: na.x, cy: na.y, opacity: 0 }}
            animate={{
              cx: [na.x, nb.x, na.x],
              cy: [na.y, nb.y, na.y],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {nodes.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill="#2E9E9E"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2.4 + (i % 4) * 0.4,
            delay: (i % 5) * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}
