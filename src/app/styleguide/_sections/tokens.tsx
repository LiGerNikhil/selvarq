import { Section, Specimen } from "./section";

const colours = [
  { name: "ivory", hex: "#FAF7F2", use: "Page background", cls: "bg-ivory" },
  { name: "pearl", hex: "#F3EEE6", use: "Cards, sections", cls: "bg-pearl" },
  { name: "indigo", hex: "#1F2A6B", use: "Primary, text accents, links", cls: "bg-indigo" },
  { name: "indigo-deep", hex: "#141C4A", use: "Hover, footer", cls: "bg-indigo-deep" },
  { name: "gold", hex: "#B8923A", use: "Hairlines, icons, focus", cls: "bg-gold" },
  { name: "gold-soft", hex: "#E9DDBF", use: "Subtle fills, badges", cls: "bg-gold-soft" },
  { name: "gold-ink", hex: "#8A6A1F", use: "Gold as text (derived, passes AA)", cls: "bg-gold-ink" },
  { name: "burgundy", hex: "#6B1F3A", use: "Sale tags only", cls: "bg-burgundy" },
  { name: "ink", hex: "#1A1A2E", use: "Body text", cls: "bg-ink" },
  { name: "muted", hex: "#6B6B80", use: "Secondary text", cls: "bg-muted" },
  { name: "line", hex: "#E6DFD2", use: "Borders", cls: "bg-line" },
  { name: "success", hex: "#2F6B4F", use: "Positive states", cls: "bg-success" },
  { name: "danger", hex: "#A3262B", use: "Errors", cls: "bg-danger" },
];

export function TokensSection() {
  return (
    <Section id="tokens" eyebrow="Foundations" title="Colour and type">
      <Specimen label="Palette" note="Light royal theme. Tokens are CSS variables mapped into Tailwind.">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {colours.map((c) => (
            <li key={c.name} className="flex flex-col overflow-hidden rounded-ui border border-line">
              <div className={`h-16 ${c.cls}`} />
              <div className="bg-ivory p-3">
                <p className="text-sm font-medium text-ink">{c.name}</p>
                <p className="caption">{c.hex}</p>
                <p className="caption">{c.use}</p>
              </div>
            </li>
          ))}
        </ul>
      </Specimen>

      <Specimen label="Typography" note="Cormorant Garamond for display, Jost for body and UI.">
        <div className="flex flex-col gap-6">
          <div>
            <p className="caption">display-xl</p>
            <p className="display-xl text-indigo">Cut with intent</p>
          </div>
          <div>
            <p className="caption">display-lg</p>
            <p className="display-lg text-indigo">Finished to last</p>
          </div>
          <div>
            <p className="caption">display-md</p>
            <p className="display-md text-indigo">Made by makers</p>
          </div>
          <div>
            <p className="caption">eyebrow</p>
            <p className="eyebrow">Festive edit</p>
          </div>
          <div>
            <p className="caption">body</p>
            <p className="body max-w-prose">
              Woven in 100% cotton poplin, 120 GSM. Regular fit, true to size. Machine wash cold,
              dry in shade.
            </p>
          </div>
          <div>
            <p className="caption">caption</p>
            <p className="caption">Inclusive of all taxes. Free delivery above Rs 1,999.</p>
          </div>
        </div>
      </Specimen>
    </Section>
  );
}
