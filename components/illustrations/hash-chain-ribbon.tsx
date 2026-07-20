"use client";

import { motion } from "framer-motion";

const hashes = ["a3f9c2…", "8e41d0…", "5bf3fb…", "77c6f5…", "dd0bdd…", "eae504…"];

export function HashChainRibbon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 900 200"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <line x1="20" y1="100" x2="880" y2="100" stroke="#2E9E9E" strokeOpacity="0.3" strokeWidth="1.5" />
      {hashes.map((h, i) => {
        const x = 60 + i * 155;
        const y = i % 2 === 0 ? 100 : 100;
        return (
          <g key={h}>
            <motion.rect
              x={x - 55}
              y={y - 26}
              width="110"
              height="52"
              rx="8"
              fill="#152626"
              stroke="#2E9E9E"
              initial={{ strokeOpacity: 0.25 }}
              animate={{ strokeOpacity: [0.25, 0.6, 0.25] }}
              transition={{ duration: 3, delay: i * 0.35, repeat: Infinity, ease: "easeInOut" }}
              strokeWidth="1.5"
            />
            <text
              x={x}
              y={y - 4}
              textAnchor="middle"
              fill="#A8DDDD"
              fontSize="11"
              fontFamily="var(--font-mono), monospace"
            >
              {h}
            </text>
            <text x={x} y={y + 14} textAnchor="middle" fill="#5A6B6B" fontSize="9">
              block {i + 1}
            </text>
            {i < hashes.length - 1 && (
              <circle cx={x + 77} cy={y} r="3" fill="#2E9E9E" fillOpacity="0.7" />
            )}
          </g>
        );
      })}
    </svg>
  );
}
