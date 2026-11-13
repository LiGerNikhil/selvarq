"use client";

import { useState } from "react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { RatingInput } from "@/components/ui/rating-input";
import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Section, Specimen } from "./section";

const badges: BadgeVariant[] = ["neutral", "gold", "indigo", "sale", "success", "danger", "outline"];

export function FeedbackSection() {
  const [rating, setRating] = useState(0);

  return (
    <Section id="feedback" eyebrow="Status" title="Badges, ratings, loading, toasts">
      <Specimen label="Badges" note="Burgundy (sale) is reserved for sale tags and small highlights.">
        <div className="flex flex-wrap gap-2">
          {badges.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant === "sale" ? "20% off" : variant}
            </Badge>
          ))}
        </div>
      </Specimen>

      <Specimen label="Rating" note="Partial stars, three sizes, with count and value.">
        <div className="flex flex-col gap-3">
          <Rating value={0} size="sm" />
          <Rating value={3.5} count={42} />
          <Rating value={4.3} count={1284} showValue />
          <Rating value={5} size="lg" count={9} />
        </div>
      </Specimen>

      <Specimen label="Rating input" note={rating ? `Selected: ${rating} of 5.` : "Nothing selected. Use the arrow keys."}>
        <RatingInput value={rating} onChange={setRating} />
      </Specimen>

      <Specimen label="Skeleton" note="Sized to match the content it replaces, so nothing shifts.">
        <div className="grid gap-6 md:grid-cols-3">
          <SkeletonCard />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-2/3" />
            <SkeletonText lines={4} />
          </div>
          <div className="hidden flex-col gap-3 md:flex">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </Specimen>

      <Specimen label="Toast" note="Bottom centre on mobile, above the tab bar. Bottom right on desktop. Hover to pause.">
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" onClick={() => toast.show("Added to your bag")}>
            Neutral
          </Button>
          <Button variant="ghost" onClick={() => toast.success("Order placed", { description: "We will email you the invoice." })}>
            Success
          </Button>
          <Button variant="ghost" onClick={() => toast.info("Free delivery unlocked")}>
            Info
          </Button>
          <Button variant="ghost" onClick={() => toast.error("Payment failed", { description: "Your card was not charged." })}>
            Error
          </Button>
        </div>
      </Specimen>
    </Section>
  );
}
