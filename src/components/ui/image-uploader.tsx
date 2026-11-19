"use client";

import { useId, useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaImage } from "@/components/ui/media-image";
import { toast } from "@/store/toast-store";
import {
  ACCEPTED_IMAGE_ACCEPT,
  uploadImage,
  uploadImageFromUrl,
  validateImageFile,
  type UploadedImage,
} from "@/lib/upload-client";
import type { UploadFolderKey } from "@/lib/upload-folders";
import { cn } from "@/lib/utils";

type UploadRatio = "4/5" | "1/1" | "16/9";

interface ImageUploadButtonProps {
  folder: UploadFolderKey;
  onUploaded: (assets: UploadedImage[]) => void;
  /** How many more images the surface accepts. Defaults to unlimited. */
  remaining?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
}

/**
 * Upload control only. Use it when the parent already renders its own
 * previews (for example the product editor's reorderable grid).
 */
export function ImageUploadButton({
  folder,
  onUploaded,
  remaining,
  disabled = false,
  label,
  className,
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const atLimit = remaining !== undefined && remaining <= 0;

  async function handleFiles(files: FileList | null) {
    const all = Array.from(files ?? []);
    if (!all.length) return;

    const selected = remaining === undefined ? all : all.slice(0, Math.max(remaining, 0));
    const skipped = all.length - selected.length;
    const invalid = selected.map((file) => ({ file, message: validateImageFile(file) })).filter((item) => item.message);
    const valid = selected.filter((file) => !validateImageFile(file));

    if (invalid.length) {
      toast.error("Some images were skipped", {
        description: invalid.slice(0, 3).map((item) => `${item.file.name}: ${item.message}`).join(" "),
      });
    }
    if (!valid.length) {
      if (!invalid.length && skipped > 0) toast.error("Image limit reached", { description: "Remove an image before adding another." });
      return;
    }

    setBusy(true);
    const uploaded: UploadedImage[] = [];
    try {
      for (const [index, file] of valid.entries()) {
        setStatus(`Uploading ${index + 1} of ${valid.length}…`);
        uploaded.push(await uploadImage(file, folder));
      }
      onUploaded(uploaded);
      setStatus(uploaded.length === 1 ? "Image uploaded" : `${uploaded.length} images uploaded`);
      if (skipped > 0) toast.error("Image limit reached", { description: "Only the first images were added." });
    } catch (error) {
      if (uploaded.length) onUploaded(uploaded);
      setStatus("");
      toast.error("Upload failed", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_IMAGE_ACCEPT}
        multiple={remaining === undefined || remaining > 1}
        className="sr-only"
        disabled={disabled || busy || atLimit}
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <Button
        size="sm"
        variant="ghost"
        loading={busy}
        disabled={disabled || atLimit}
        leftIcon={<Upload aria-hidden className="size-4" />}
        onClick={() => inputRef.current?.click()}
      >
        {atLimit ? "Image limit reached" : (label ?? "Upload image")}
      </Button>
      <p aria-live="polite" className="caption">
        {status}
      </p>
    </div>
  );
}

interface ImageUrlImporterProps {
  folder: UploadFolderKey;
  onImported: (asset: UploadedImage) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

/**
 * Paste-a-link control for surfaces that manage their own previews. The server
 * downloads the image and stores it in Cloudinary, so the saved value is
 * always a public id that next/image can serve.
 */
export function ImageUrlImporter({
  folder,
  onImported,
  disabled = false,
  label = "Add from URL",
  className,
}: ImageUrlImporterProps) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const next = url.trim();
    if (!next || busy) return;
    setBusy(true);
    try {
      const asset = await uploadImageFromUrl(next.startsWith("//") ? `https:${next}` : next, folder);
      onImported(asset);
      setUrl("");
      toast.success("Image added", { description: "The link was imported to Cloudinary." });
    } catch (error) {
      toast.error("Could not use that link", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row", className)}>
      <input
        aria-label="Image link"
        type="url"
        inputMode="url"
        autoComplete="off"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void submit();
          }
        }}
        placeholder="Paste an image link (https://…)"
        className="min-h-11 flex-1 border border-line bg-ivory px-3 text-sm"
        disabled={disabled || busy}
      />
      <Button
        size="sm"
        variant="ghost"
        loading={busy}
        disabled={disabled || !url.trim()}
        onClick={() => void submit()}
      >
        {label}
      </Button>
    </div>
  );
}

interface ImageUploaderProps {
  value: string[];
  onChange: (value: string[]) => void;
  folder: UploadFolderKey;
  max?: number;
  title?: string;
  hint?: string;
  ratio?: UploadRatio;
  /** Shows a small field for pasting an existing URL or public id. */
  allowUrl?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Preview grid + Cloudinary upload. Used by collections, banners, stories,
 * category art and the merchant brand mark.
 */
export function ImageUploader({
  value,
  onChange,
  folder,
  max = 1,
  title = "Image",
  hint,
  ratio = "4/5",
  allowUrl = false,
  disabled = false,
  className,
}: ImageUploaderProps) {
  const [url, setUrl] = useState("");
  const [urlBusy, setUrlBusy] = useState(false);

  function addUploaded(assets: UploadedImage[]) {
    const next = [...value, ...assets.map((asset) => asset.publicId)];
    // A single-image field replaces its current image instead of ignoring the new one.
    onChange(max === 1 ? next.slice(-1) : next.slice(0, max));
  }

  async function addUrl() {
    const next = url.trim();
    if (!next || urlBusy) return;
    const remote = /^https?:\/\//i.test(next) || next.startsWith("//");

    // Bare public ids and /public paths can be stored as they are.
    if (!remote) {
      const merged = [...value, next];
      onChange(max === 1 ? merged.slice(-1) : merged.slice(0, max));
      setUrl("");
      return;
    }

    setUrlBusy(true);
    try {
      const asset = await uploadImageFromUrl(next.startsWith("//") ? `https:${next}` : next, folder);
      const merged = [...value, asset.publicId];
      onChange(max === 1 ? merged.slice(-1) : merged.slice(0, max));
      setUrl("");
      toast.success("Image added", { description: "The link was imported to Cloudinary." });
    } catch (error) {
      toast.error("Could not use that link", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setUrlBusy(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-indigo">{title}</p>
        <ImageUploadButton
          folder={folder}
          remaining={max === 1 ? 1 : max - value.length}
          disabled={disabled}
          label={value.length ? "Replace image" : "Upload image"}
          onUploaded={addUploaded}
        />
      </div>

      {value.length ? (
        <ul className={cn("grid gap-3", max === 1 ? "max-w-40 grid-cols-1" : "grid-cols-2 sm:grid-cols-3")}>
          {value.map((src, index) => (
            <li key={`${src}-${index}`} className="group relative border border-line p-1">
              <MediaImage
                src={src}
                alt={`${title} ${index + 1}`}
                ratio={ratio}
                sizes={max === 1 ? "160px" : "(min-width: 640px) 20vw, 45vw"}
              />
              <button
                type="button"
                aria-label={`Remove ${title.toLowerCase()} ${index + 1}`}
                disabled={disabled}
                onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
                className="absolute right-2 top-2 bg-ivory/95 p-1.5 text-danger disabled:opacity-50"
              >
                <Trash2 aria-hidden className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-24 items-center justify-center border border-dashed border-line p-4 text-center">
          <p className="caption">No image yet. Upload one to replace the generated placeholder.</p>
        </div>
      )}

      {allowUrl ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            aria-label={`${title} URL or public id`}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void addUrl();
              }
            }}
            placeholder="https://… (imported to Cloudinary) or an existing public id"
            className="min-h-11 flex-1 border border-line bg-ivory px-3 text-sm"
            disabled={disabled || urlBusy}
          />
          <Button
            size="sm"
            variant="ghost"
            loading={urlBusy}
            disabled={disabled || !url.trim()}
            onClick={() => void addUrl()}
          >
            Use URL
          </Button>
        </div>
      ) : null}

      {hint ? <p className="caption">{hint}</p> : null}
    </div>
  );
}
