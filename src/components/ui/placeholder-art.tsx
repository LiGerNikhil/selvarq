import { PLACEHOLDER_PREFIX } from "@/lib/media";

// Calm, on-palette tones: [background, line/mark].
const tones: ReadonlyArray<readonly [string, string]> = [
  ["var(--pearl)", "var(--gold)"],
  ["var(--gold-soft)", "var(--indigo)"],
  ["color-mix(in oklab, var(--indigo) 9%, var(--ivory))", "var(--indigo)"],
  ["color-mix(in oklab, var(--burgundy) 8%, var(--ivory))", "var(--burgundy)"],
];

function pickTone(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return tones[hash % tones.length] ?? tones[0]!;
}

/**
 * Generated stand-in for product and editorial imagery in mock data.
 * Use ids like "placeholder:poplin-shirt"; the same id always gets the same tone.
 * Also shown if a real image fails to load. Fills its parent.
 */
export function PlaceholderArt({ seed }: { seed: string }) {
  const [background, mark] = pickTone(seed.replace(PLACEHOLDER_PREFIX, ""));
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
    >
      <rect width="400" height="500" fill={background} />
      <rect x="20" y="20" width="360" height="460" fill="none" stroke="var(--gold)" strokeWidth="1" />
      <g stroke={mark} strokeOpacity="0.14" strokeWidth="1">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={-100 + i * 80} y1="500" x2={200 + i * 80} y2="0" />
        ))}
      </g>
      <text
        x="200"
        y="272"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="96"
        fontWeight="500"
        fill={mark}
        fillOpacity="0.55"
      >
        S
      </text>
    </svg>
  );
}
