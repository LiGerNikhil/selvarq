import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Brand assets are detected in next.config.ts at build/dev start.
 */
const assets = {
  wordmark: {
    src: "/brand/Selvarq-logo.png",
    present: process.env.NEXT_PUBLIC_LOGO_PRESENT === "1",
    width: Number(process.env.NEXT_PUBLIC_LOGO_W ?? 0),
    height: Number(process.env.NEXT_PUBLIC_LOGO_H ?? 0),
  },
  monogram: {
    src: "/brand/monogram.png",
    present: process.env.NEXT_PUBLIC_MONOGRAM_PRESENT === "1",
    width: Number(process.env.NEXT_PUBLIC_MONOGRAM_W ?? 0),
    height: Number(process.env.NEXT_PUBLIC_MONOGRAM_H ?? 0),
  },
} as const;

const imageHeight = { sm: 32, md: 64, lg: 80 } as const;
const wordmarkText = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" } as const;
const monogramBox = { sm: "size-8 text-lg", md: "size-10 text-xl", lg: "size-14 text-3xl" } as const;

export interface LogoProps {
  variant?: "wordmark" | "monogram";
  size?: keyof typeof imageHeight;
  /** "ivory" for the dark footer. Image logos are shown as supplied. */
  tone?: "indigo" | "ivory";
  /** Wraps the logo in a link, e.g. "/". */
  href?: string;
  /** Set on the logo that is the LCP element. */
  priority?: boolean;
  className?: string;
}

function LogoMark({ variant, size, tone, priority }: Required<Pick<LogoProps, "variant" | "size" | "tone">> & { priority?: boolean }) {
  const asset = assets[variant];
  if (asset.present && asset.width > 0 && asset.height > 0) {
    const height = imageHeight[size];
    return (
      <Image
        src={asset.src}
        alt="SELVARQ"
        width={asset.width}
        height={asset.height}
        priority={priority}
        style={{ height, width: "auto", maxWidth: "100%" }}
      />
    );
  }

  const colour = tone === "ivory" ? "text-ivory" : "text-indigo";

  if (variant === "monogram") {
    return (
      <span
        role="img"
        aria-label="SELVARQ"
        className={cn(
          "grid place-items-center border border-gold font-display font-medium leading-none",
          monogramBox[size],
          colour,
        )}
      >
        S
      </span>
    );
  }

  return (
    <span role="img" aria-label="SELVARQ" className="inline-flex flex-col leading-none">
      {/* Negative end margin cancels the trailing letter-space so the gold line ends under the Q. */}
      <span
        aria-hidden
        className={cn(
          "-mr-[0.14em] font-display font-semibold uppercase tracking-brand",
          wordmarkText[size],
          colour,
        )}
      >
        SELVARQ
      </span>
      <span aria-hidden className="mt-1.5 h-px w-full bg-gold" />
    </span>
  );
}

export function Logo({
  variant = "wordmark",
  size = "md",
  tone = "indigo",
  href,
  priority,
  className,
}: LogoProps) {
  const mark = <LogoMark variant={variant} size={size} tone={tone} priority={priority} />;
  if (!href) return <span className={cn("inline-flex", className)}>{mark}</span>;
  return (
    <Link href={href} aria-label="SELVARQ home" className={cn("inline-flex", className)}>
      {mark}
    </Link>
  );
}
