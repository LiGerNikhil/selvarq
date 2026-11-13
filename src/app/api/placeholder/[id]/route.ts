const glyphById: [RegExp, string][] = [
  [/saree|wedding|zari|festive/i, "✳"],
  [/shirt|tee|top|dress/i, "◇"],
  [/trouser|pant|bottom/i, "⌁"],
  [/jacket|layer|monsoon/i, "△"],
  [/kurta/i, "✦"],
  [/lounge|essential/i, "○"],
];

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (character) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;",
  })[character] ?? character);
}

function readableName(id: string): string {
  const withoutPrefix = id.replace(/^placeholder[-:]?/, "").replace(/-\d+$/, "");
  const name = withoutPrefix
    .replace(/^(product-)?\d+-/, "")
    .replace(/^(collection|banner|story|merchant)-/, "")
    .replace(/-/g, " ");
  return name.replace(/\b[a-z]/g, (letter) => letter.toUpperCase()).slice(0, 54) || "SELVARQ";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  const label = readableName(id);
  const glyph = glyphById.find(([pattern]) => pattern.test(id))?.[1] ?? "✧";
  const safeLabel = escapeXml(label);
  const safeGlyph = escapeXml(glyph);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100" viewBox="0 0 900 1100" role="img" aria-label="${safeLabel}">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FAF7F2"/>
      <stop offset="0.55" stop-color="#F3EEE6"/>
      <stop offset="1" stop-color="#E9DDBF"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="56%">
      <stop offset="0" stop-color="#fff" stop-opacity=".7"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="900" height="1100" fill="url(#paper)"/>
  <rect width="900" height="1100" fill="url(#glow)"/>
  <rect x="34" y="34" width="832" height="1032" rx="3" fill="none" stroke="#B8923A" stroke-opacity=".38"/>
  <circle cx="450" cy="454" r="151" fill="#FAF7F2" fill-opacity=".72"/>
  <circle cx="450" cy="454" r="132" fill="none" stroke="#B8923A" stroke-opacity=".58"/>
  <text x="450" y="490" text-anchor="middle" fill="#8A6A1F" font-family="Georgia,serif" font-size="94">${safeGlyph}</text>
  <path d="M330 700h240" stroke="#B8923A" stroke-opacity=".6"/>
  <text x="450" y="755" text-anchor="middle" fill="#1A1A2E" font-family="Arial,sans-serif" font-size="27" letter-spacing="3">SELVARQ</text>
  <text x="450" y="812" text-anchor="middle" fill="#6B6B80" font-family="Arial,sans-serif" font-size="25">${safeLabel}</text>
  </svg>`;
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
