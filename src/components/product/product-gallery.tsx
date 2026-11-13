"use client";

import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { useRef, useState } from "react";
import { MediaImage } from "@/components/ui/media-image";
import { useModalDialog } from "@/hooks/use-modal-dialog";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const viewer = useModalDialog(viewerOpen, setViewerOpen);
  const touchStart = useRef<number | null>(null);
  const safeImages = images.length ? images : ["placeholder:selvarq-product"];

  function move(direction: number) {
    setActive((current) => (current + direction + safeImages.length) % safeImages.length);
    setZoomed(false);
  }

  return (
    <section aria-label={`${name} images`} className="min-w-0">
      <div className="flex flex-col gap-3 lg:flex-row-reverse">
        <div
          className="group relative min-w-0 flex-1 overflow-hidden bg-pearl"
          onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => {
            const start = touchStart.current;
            const end = event.changedTouches[0]?.clientX;
            if (start !== null && end !== undefined && Math.abs(start - end) > 45) move(start > end ? 1 : -1);
            touchStart.current = null;
          }}
        >
          <button
            type="button"
            className="block w-full cursor-zoom-in text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo"
            aria-label={`Open full-screen image ${active + 1} of ${safeImages.length}`}
            onClick={() => setViewerOpen(true)}
          >
            <MediaImage
              src={safeImages[active]}
              alt={`${name}, view ${active + 1}`}
              ratio="4/5"
              sizes="(min-width: 1024px) 48vw, 100vw"
              priority={active === 0}
              className="transition-transform duration-500 group-hover:scale-[1.015]"
            />
          </button>
          <span className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1 bg-ivory/90 px-2 py-1 text-xs text-ink lg:inline-flex">
            <ZoomIn aria-hidden className="size-3.5" /> View details
          </span>
          {safeImages.length > 1 ? (
            <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-2 lg:hidden">
              <button type="button" onClick={() => move(-1)} aria-label="Previous image" className="pointer-events-auto grid size-10 place-items-center rounded-full bg-ivory/90 text-indigo shadow">
                <ChevronLeft aria-hidden className="size-5" />
              </button>
              <button type="button" onClick={() => move(1)} aria-label="Next image" className="pointer-events-auto grid size-10 place-items-center rounded-full bg-ivory/90 text-indigo shadow">
                <ChevronRight aria-hidden className="size-5" />
              </button>
            </div>
          ) : null}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 lg:hidden" aria-label={`Image ${active + 1} of ${safeImages.length}`}>
            {safeImages.map((image, index) => (
              <button key={image} type="button" onClick={() => setActive(index)} aria-label={`Show image ${index + 1}`} aria-current={index === active} className={cn("size-2 rounded-full border border-ivory", index === active ? "bg-indigo" : "bg-ivory/70")} />
            ))}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:w-[5.25rem] lg:flex-col lg:overflow-visible">
          {safeImages.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === active}
              className={cn("w-16 shrink-0 border-2 transition-colors lg:w-full", index === active ? "border-gold" : "border-transparent hover:border-line")}
            >
              <MediaImage src={image} alt="" ratio="4/5" sizes="80px" />
            </button>
          ))}
        </div>
      </div>

      <dialog {...viewer} aria-label={`${name} image viewer`} className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-ink/95 p-0 text-ivory backdrop:bg-ink/95">
        <div className="relative flex h-full w-full items-center justify-center">
          <button type="button" onClick={() => setViewerOpen(false)} aria-label="Close image viewer" className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-ivory/10">
            <X aria-hidden className="size-5" />
          </button>
          <button type="button" onClick={() => move(-1)} aria-label="Previous image" className="absolute left-2 z-10 grid size-11 place-items-center rounded-full bg-ivory/10 sm:left-6">
            <ChevronLeft aria-hidden className="size-6" />
          </button>
          <button type="button" className="max-h-full max-w-full overflow-auto" onClick={() => setZoomed((value) => !value)} aria-label={zoomed ? "Zoom out" : "Zoom in"}>
            <MediaImage src={safeImages[active]} alt={`${name}, enlarged view ${active + 1}`} ratio="4/5" sizes="100vw" fit="contain" className={cn("h-[92dvh] w-[min(90vw,72rem)] bg-transparent transition-transform duration-300", zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in")} />
          </button>
          <button type="button" onClick={() => move(1)} aria-label="Next image" className="absolute right-2 z-10 grid size-11 place-items-center rounded-full bg-ivory/10 sm:right-6">
            <ChevronRight aria-hidden className="size-6" />
          </button>
          <p className="absolute bottom-4 text-sm text-ivory/80">{active + 1} / {safeImages.length} · Select image to {zoomed ? "zoom out" : "zoom in"}</p>
        </div>
      </dialog>
    </section>
  );
}
