"use client";

import React, { useId } from "react";

/**
 * Calculates star rating (0, 0.5, 1, 1.5, 2, 2.5, 3) from a quiz percentage (0-100).
 * - 100% (Perfect) -> 3.0 Stars
 * - 50% (Half) -> 1.5 Stars
 * - Proportional with 0.5 increments for intermediate scores.
 */
export function getStarCountFromScore(score: number): number {
  if (score >= 100) return 3;
  if (score <= 0) return 0;
  const rounded = Math.round(((score / 100) * 3) * 2) / 2;
  return Math.min(2.5, Math.max(0.5, rounded));
}

// Generate 10-vertex 5-pointed star coordinates (alternating outer tips and inner notches)
function getStarVertices(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  rotationDeg = 0
): { x: number; y: number }[] {
  const rotRad = (rotationDeg * Math.PI) / 180;
  const vertices: { x: number; y: number }[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + rotRad + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? outerR : innerR;
    vertices.push({
      x: Number((cx + r * Math.cos(angle)).toFixed(2)),
      y: Number((cy + r * Math.sin(angle)).toFixed(2)),
    });
  }
  return vertices;
}

// Precomputed vertices for 3-star positions on ribbon
// Enlarged stars: center star outerR=12.0 (diameter 24), left/right outerR=9.5 (diameter 19)
// towering prominently over the ~11px arched ribbon banner.
const CENTER_VERTICES = getStarVertices(38.0, 11.5, 12.0, 4.8, 0);
const LEFT_VERTICES = getStarVertices(22.0, 16.5, 9.5, 3.8, -14);
const RIGHT_VERTICES = getStarVertices(54.0, 16.5, 9.5, 3.8, 14);

// 10 3D cartoon facet colors (luminous sparkling gold popping over orangey ribbon)
const LIT_FACET_COLORS = [
  "#fef08a", // Facet 0: top-right upper (sunny yellow)
  "#fde047", // Facet 1: right upper (radiant gold)
  "#f59e0b", // Facet 2: right lower (warm gold)
  "#f59e0b", // Facet 3: bottom-right upper (warm gold)
  "#d97706", // Facet 4: bottom-right lower (warm amber shadow)
  "#f59e0b", // Facet 5: bottom-left lower (warm gold)
  "#fbbf24", // Facet 6: bottom-left upper (vibrant rich gold)
  "#facc15", // Facet 7: left lower (warm sunny gold)
  "#fef9c3", // Facet 8: left upper (bright ivory gold highlight)
  "#ffffff", // Facet 9: top-left upper (brilliant specular highlight peak)
];

const UNLIT_FACET_COLORS = [
  "rgba(154, 52, 18, 0.45)",
  "rgba(124, 45, 18, 0.4)",
  "rgba(154, 52, 18, 0.45)",
  "rgba(67, 20, 7, 0.5)",
  "rgba(67, 20, 7, 0.55)",
  "rgba(67, 20, 7, 0.5)",
  "rgba(154, 52, 18, 0.45)",
  "rgba(124, 45, 18, 0.4)",
  "rgba(154, 52, 18, 0.45)",
  "rgba(251, 146, 60, 0.35)",
];

/**
 * Helper to render a 10-facet 3D star with cartoon beveling and shiny specular gloss.
 */
function renderFacetedStarGroup(
  cx: number,
  cy: number,
  vertices: { x: number; y: number }[],
  isLit: boolean,
  keyPrefix: string
) {
  const colors = isLit ? LIT_FACET_COLORS : UNLIT_FACET_COLORS;
  const perimeterPoints = vertices.map((v) => `${v.x},${v.y}`).join(" ");

  // Vertices: v[0] = top arm tip, v[8] = upper-left arm tip
  const v0 = vertices[0];
  const v8 = vertices[8];

  return (
    <g key={keyPrefix} className={isLit ? "drop-shadow-[0_1.5px_2px_rgba(67,20,7,0.55)]" : ""}>
      {/* Outer Casing Contour (Underneath facets to give a smooth rounded cartoon border without eating into the star facets) */}
      <polygon
        points={perimeterPoints}
        fill={isLit ? "#d97706" : "rgba(67, 20, 7, 0.4)"}
        stroke={isLit ? "#b45309" : "rgba(124, 45, 18, 0.45)"}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* 10 Triangular Facets radiating from center apex */}
      {vertices.map((v, i) => {
        const nextV = vertices[(i + 1) % 10];
        const points = `${cx},${cy} ${v.x},${v.y} ${nextV.x},${nextV.y}`;
        return <polygon key={`${keyPrefix}-f-${i}`} points={points} fill={colors[i]} />;
      })}

      {/* Crease lines from center to each vertex (bright specular glint on ridges) */}
      {vertices.map((v, i) => (
        <line
          key={`${keyPrefix}-l-${i}`}
          x1={cx}
          y1={cy}
          x2={v.x}
          y2={v.y}
          stroke={isLit ? (i % 2 === 0 ? "#ffffff" : "#ca8a04") : "rgba(124, 45, 18, 0.35)"}
          strokeWidth={isLit && i % 2 === 0 ? "0.45" : "0.35"}
          strokeOpacity={isLit ? (i % 2 === 0 ? 0.95 : 0.8) : 0.4}
        />
      ))}

      {/* Crisp Warm Amber Rim Contour (Delicate and clean, replacing the harsh dark outline) */}
      <polygon
        points={perimeterPoints}
        fill="none"
        stroke={isLit ? "#92400e" : "rgba(124, 45, 18, 0.5)"}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />

      {/* Gilded Gold Highlight Rim */}
      {isLit && (
        <polygon
          points={perimeterPoints}
          fill="none"
          stroke="#fef08a"
          strokeWidth="0.3"
          strokeLinejoin="round"
          strokeOpacity="0.8"
        />
      )}

      {/* Shiny Specular Gloss Highlights (Gloss streaks & apex glint) */}
      {isLit && (
        <g pointerEvents="none">
          {/* Upper-Left Arm Specular Gloss Capsule */}
          <line
            x1={Number((cx * 0.72 + v8.x * 0.28).toFixed(2))}
            y1={Number((cy * 0.72 + v8.y * 0.28).toFixed(2))}
            x2={Number((cx * 0.22 + v8.x * 0.78).toFixed(2))}
            y2={Number((cy * 0.22 + v8.y * 0.78).toFixed(2))}
            stroke="#ffffff"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeOpacity="0.85"
          />

          {/* Top Arm Specular Gloss Highlight Streak */}
          <line
            x1={Number((cx * 0.65 + v0.x * 0.35).toFixed(2))}
            y1={Number((cy * 0.65 + v0.y * 0.35).toFixed(2))}
            x2={Number((cx * 0.28 + v0.x * 0.72).toFixed(2))}
            y2={Number((cy * 0.28 + v0.y * 0.72).toFixed(2))}
            stroke="#ffffff"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />

          {/* Star Center Apex Specular Glint */}
          <circle cx={cx} cy={cy} r="1.0" fill="#ffffff" opacity="0.95" />
        </g>
      )}
    </g>
  );
}

/**
 * 4-Point Cartoon Twinkle Sparkle Glint.
 */
function TwinkleGlint({
  cx,
  cy,
  size = 2.6,
  className = "",
}: {
  cx: number;
  cy: number;
  size?: number;
  className?: string;
}) {
  return (
    <g transform={`translate(${cx}, ${cy})`} className={`pointer-events-none select-none ${className}`}>
      {/* 4-point diamond glint */}
      <path
        d={`M 0,-${size} Q 0,0 ${size},0 Q 0,0 0,${size} Q 0,0 -${size},0 Q 0,0 0,-${size} Z`}
        fill="#ffffff"
        opacity="0.95"
      />
      {/* Specular center core */}
      <circle r={size * 0.25} fill="#ffffff" />
    </g>
  );
}

/**
 * 3-Star Award Ribbon with prominent large 3D Faceted Cartoon Gold Stars.
 * Features a warm orangey silk ribbon aligned with the stepping stone badge palette,
 * and bold, enlarged championship stars crowning the ribbon banner.
 */
export function RibbonThreeStars({
  score,
  className = "w-16 h-7 sm:w-[72px] sm:h-8",
}: {
  score: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const starCount = getStarCountFromScore(score);

  const leftFill = starCount >= 1 ? "full" : starCount >= 0.5 ? "half" : "empty";
  const centerFill = starCount >= 2 ? "full" : starCount >= 1.5 ? "half" : "empty";
  const rightFill = starCount >= 3 ? "full" : starCount >= 2.5 ? "half" : "empty";

  return (
    <svg
      viewBox="0 -2 76 36"
      className={`${className} select-none overflow-visible drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]`}
      aria-hidden="true"
    >
      <defs>
        {/* Ribbon Front Satin Sheen Gradient - Warm Orangey Sunset Silk */}
        <linearGradient id={`ribbon-front-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="25%" stopColor="#f97316" />
          <stop offset="60%" stopColor="#ea580c" />
          <stop offset="85%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>

        {/* Silky Specular Curved Gloss Sheen on Ribbon */}
        <linearGradient id={`ribbon-gloss-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
        </linearGradient>

        {/* Ribbon Left Tail Gradient */}
        <linearGradient id={`ribbon-tail-l-${id}`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="40%" stopColor="#ea580c" />
          <stop offset="80%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>

        {/* Ribbon Right Tail Gradient */}
        <linearGradient id={`ribbon-tail-r-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="40%" stopColor="#ea580c" />
          <stop offset="80%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>

        {/* Ribbon Underfold Deep Shadow */}
        <linearGradient id={`ribbon-fold-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9a3412" />
          <stop offset="100%" stopColor="#431407" />
        </linearGradient>

        {/* Golden Trim Gradient */}
        <linearGradient id={`ribbon-gold-trim-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>

        {/* Half-Star Vertical Clip Paths */}
        <clipPath id={`clip-l-${id}`}>
          <rect x="0" y="-5" width="22.0" height="42" />
        </clipPath>
        <clipPath id={`clip-c-${id}`}>
          <rect x="0" y="-5" width="38.0" height="42" />
        </clipPath>
        <clipPath id={`clip-r-${id}`}>
          <rect x="0" y="-5" width="54.0" height="42" />
        </clipPath>
      </defs>

      {/* ── Layer 1: Ribbon Tails (Background) ── */}
      {/* Left Tail with swallowtail fork */}
      <path
        d="M 16,21 Q 9,18 2,20 L 7.5,25.5 L 1.5,30.5 Q 9,28 16,26.5 Z"
        fill={`url(#ribbon-tail-l-${id})`}
        stroke="#7c2d12"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      {/* Left Tail subtle sheen */}
      <path
        d="M 15.5,21.5 Q 9,18.8 3,20.5"
        stroke="#ffffff"
        strokeWidth="0.5"
        strokeOpacity="0.4"
        fill="none"
      />

      {/* Right Tail with swallowtail fork */}
      <path
        d="M 60,21 Q 67,18 74,20 L 68.5,25.5 L 74.5,30.5 Q 67,28 60,26.5 Z"
        fill={`url(#ribbon-tail-r-${id})`}
        stroke="#7c2d12"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      {/* Right Tail subtle sheen */}
      <path
        d="M 60.5,21.5 Q 67,18.8 73,20.5"
        stroke="#ffffff"
        strokeWidth="0.5"
        strokeOpacity="0.4"
        fill="none"
      />

      {/* ── Layer 2: Ribbon Underfold Shadows (3D Tucks) ── */}
      {/* Left Underfold */}
      <path d="M 16,21 L 16,27 L 10.5,23.5 Z" fill={`url(#ribbon-fold-${id})`} />

      {/* Right Underfold */}
      <path d="M 60,21 L 60,27 L 65.5,23.5 Z" fill={`url(#ribbon-fold-${id})`} />

      {/* ── Layer 3: Central Arched Ribbon Banner ── */}
      <path
        d="M 16,16 Q 38,10 60,16 L 60,27.5 Q 38,21.5 16,27.5 Z"
        fill={`url(#ribbon-front-${id})`}
        stroke="#7c2d12"
        strokeWidth="0.6"
      />

      {/* Silky Specular Curved Gloss Sheen on Ribbon */}
      <path
        d="M 16.5,16.5 Q 38,10.5 59.5,16.5 L 59.5,21.5 Q 38,15.5 16.5,21.5 Z"
        fill={`url(#ribbon-gloss-${id})`}
        pointerEvents="none"
      />

      {/* Golden Embroidery Top Hem */}
      <path
        d="M 16.5,16.6 Q 38,10.6 59.5,16.6"
        fill="none"
        stroke={`url(#ribbon-gold-trim-${id})`}
        strokeWidth="0.85"
        strokeLinecap="round"
      />

      {/* Soft Peach Silk Highlight sheen beneath top hem */}
      <path
        d="M 17,17.6 Q 38,11.8 59,17.6"
        fill="none"
        stroke="#ffedd5"
        strokeWidth="0.7"
        strokeOpacity="0.9"
      />

      {/* Deep Shadow Bottom Hem */}
      <path
        d="M 16.5,26.9 Q 38,20.9 59.5,26.9"
        fill="none"
        stroke="#431407"
        strokeWidth="0.75"
      />

      {/* ── Layer 4: Prominent Large 3D Faceted Stars in Arc Formation ── */}
      {/* 1. Left Star */}
      {renderFacetedStarGroup(22.0, 16.5, LEFT_VERTICES, false, "star-l-unlit")}
      {leftFill === "full" && renderFacetedStarGroup(22.0, 16.5, LEFT_VERTICES, true, "star-l-full")}
      {leftFill === "half" && (
        <g clipPath={`url(#clip-l-${id})`}>
          {renderFacetedStarGroup(22.0, 16.5, LEFT_VERTICES, true, "star-l-half")}
        </g>
      )}

      {/* 2. Right Star */}
      {renderFacetedStarGroup(54.0, 16.5, RIGHT_VERTICES, false, "star-r-unlit")}
      {rightFill === "full" && renderFacetedStarGroup(54.0, 16.5, RIGHT_VERTICES, true, "star-r-full")}
      {rightFill === "half" && (
        <g clipPath={`url(#clip-r-${id})`}>
          {renderFacetedStarGroup(54.0, 16.5, RIGHT_VERTICES, true, "star-r-half")}
        </g>
      )}

      {/* 3. Center Star (elevated at peak, rendered on top, larger than ribbon) */}
      {renderFacetedStarGroup(38.0, 11.5, CENTER_VERTICES, false, "star-c-unlit")}
      {centerFill === "full" && renderFacetedStarGroup(38.0, 11.5, CENTER_VERTICES, true, "star-c-full")}
      {centerFill === "half" && (
        <g clipPath={`url(#clip-c-${id})`}>
          {renderFacetedStarGroup(38.0, 11.5, CENTER_VERTICES, true, "star-c-half")}
        </g>
      )}

      {/* ── Layer 5: Cartoon Twinkle Sparkles ── */}
      {/* Center Star Shoulder Sparkle */}
      {centerFill === "full" && (
        <TwinkleGlint cx={31.5} cy={4.5} size={2.5} />
      )}
      {/* Right Star Outer Tip Sparkle */}
      {rightFill === "full" && (
        <TwinkleGlint cx={60.0} cy={11.0} size={1.8} />
      )}
    </svg>
  );
}

/**
 * 3-Star Rating badge on the lower part of the level node.
 * Features an orangey award ribbon banner with large 3D faceted gold stars.
 * Centered horizontally across the bottom edge of the stepping stone.
 */
export function NodeStarBadge({
  score,
  className = "",
}: {
  score: number;
  className?: string;
}) {
  const starCount = getStarCountFromScore(score);

  return (
    <div
      className={`absolute -bottom-3 sm:-bottom-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center z-10 pointer-events-none select-none transition-transform group-hover:scale-105 ${className}`}
      title={`Quiz Score: ${score}% (${starCount}/3 Stars)`}
    >
      <RibbonThreeStars score={score} className="w-16 h-7 sm:w-[72px] sm:h-8" />
    </div>
  );
}

/**
 * Individual minimalist star for lists, tooltips, and cards.
 */
export function SingleStar({
  fillType,
  size = "w-3.5 h-3.5",
  isCenter = false,
  color = "#facc15",
  emptyColor = "#e2e8f0",
}: {
  fillType: "full" | "half" | "empty";
  size?: string;
  isCenter?: boolean;
  color?: string;
  emptyColor?: string;
}) {
  const points =
    "12,1.5 15.2,8.5 22.8,9.4 17.1,14.6 18.6,22.2 12,18.3 5.4,22.2 6.9,14.6 1.2,9.4 8.8,8.5";
  const centerClass = isCenter ? "-translate-y-0.5 scale-110" : "";

  if (fillType === "full") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={`${size} ${centerClass} transition-transform select-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]`}
        aria-hidden="true"
      >
        <polygon points={points} fill={color} stroke="#ca8a04" strokeWidth="0.6" strokeLinejoin="round" />
      </svg>
    );
  }

  if (fillType === "half") {
    return (
      <span
        className={`relative inline-flex items-center justify-center ${size} ${centerClass} transition-transform select-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className={`${size} absolute inset-0`}>
          <polygon points={points} fill={emptyColor} stroke="#94a3b8" strokeWidth="0.5" strokeLinejoin="round" />
        </svg>
        <span className="absolute inset-y-0 left-0 overflow-hidden w-1/2 pointer-events-none">
          <svg viewBox="0 0 24 24" className={`${size} max-w-none`}>
            <polygon points={points} fill={color} stroke="#ca8a04" strokeWidth="0.6" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={`${size} ${centerClass} transition-transform select-none`}
      aria-hidden="true"
    >
      <polygon points={points} fill={emptyColor} stroke="#94a3b8" strokeWidth="0.5" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Minimalist star rating row for popover tooltips and quiz completion dialogs.
 */
export function StarRatingRow({
  score,
  size = "w-3.5 h-3.5",
  showLabel = false,
  className = "",
}: {
  score: number;
  size?: string;
  showLabel?: boolean;
  className?: string;
}) {
  const starCount = getStarCountFromScore(score);

  return (
    <div
      className={`inline-flex items-center gap-1 select-none ${className}`}
      title={`${starCount} of 3 Stars (${score}%)`}
    >
      <div className="flex items-center gap-0.5">
        {[0, 1, 2].map((idx) => {
          const fill =
            starCount >= idx + 1
              ? "full"
              : starCount >= idx + 0.5
              ? "half"
              : "empty";

          return (
            <SingleStar
              key={idx}
              fillType={fill}
              size={size}
              isCenter={idx === 1}
              color="#facc15"
              emptyColor="#e2e8f0"
            />
          );
        })}
      </div>

      {showLabel && (
        <span className="text-[10px] font-bold text-amber-900 ml-1">
          {starCount === 3
            ? "3/3 (Perfect!)"
            : `${starCount}/3 Stars`}
        </span>
      )}
    </div>
  );
}
