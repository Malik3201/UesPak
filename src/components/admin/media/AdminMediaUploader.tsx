"use client";

import { useRef, useState } from "react";
import type { MediaObject } from "@/types/media";
import { Button } from "@/components/shared/Button";
import { cn } from "@/lib/utils";

export interface AdminMediaUploaderProps {
  label: string;
  value?: MediaObject | null;
  onChange: (asset: MediaObject | null) => void;
  folder?: string;
  usage?: string;
  accept?: string;
  maxSizeMB?: number;
  mediaType?: "image" | "pdf" | "video" | "any";
  helperText?: string;
  showPreview?: boolean;
  className?: string;
}

interface UploadedAssetPayload {
  id: string;
  url: string;
  secureUrl?: string;
  publicId: string;
  fileId?: string;
  type: string;
  filename?: string;
  originalFilename?: string;
  altText?: string;
  folder: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
  mimeType?: string;
  usage?: string;
}

export default function AdminMediaUploader({
  label,
  value,
  onChange,
  folder = "/uespak/general",
  usage,
  accept,
  maxSizeMB,
  mediaType = "image",
  helperText,
  showPreview = true,
  className,
}: AdminMediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [localAsset, setLocalAsset] = useState<MediaObject | null>(null);

  const displayAsset = localAsset ?? value ?? null;

  const defaultAccept =
    mediaType === "pdf"
      ? "application/pdf"
      : mediaType === "video"
        ? "video/mp4,video/webm,video/quicktime"
        : mediaType === "any"
          ? "image/jpeg,image/png,image/webp,image/svg+xml,application/pdf,video/mp4,video/webm,video/quicktime"
          : "image/jpeg,image/png,image/webp,image/svg+xml";

  const resolvedAccept = accept ?? defaultAccept;
  const defaultMaxMB =
    mediaType === "pdf" ? 20 : mediaType === "video" ? 50 : 5;
  const maxBytes = (maxSizeMB ?? defaultMaxMB) * 1024 * 1024;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setError(null);
    setSuccessMsg(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (file.size > maxBytes) {
      const mb = Math.round(file.size / 1024 / 1024 * 10) / 10;
      const maxMB = maxSizeMB ?? defaultMaxMB;
      setError(`File is too large (${mb}MB). Maximum is ${maxMB}MB.`);
      setSelectedFile(null);
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", folder);
      if (usage) formData.append("usage", usage);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        setError(
          typeof json?.message === "string"
            ? json.message
            : "Upload failed. Please try again."
        );
        return;
      }

      const payload = json?.data?.asset as UploadedAssetPayload | undefined;
      if (!payload?.publicId && !payload?.fileId) {
        setError("Upload response is missing asset data.");
        return;
      }

      const mediaObj: MediaObject = {
        url: payload.secureUrl || payload.url,
        publicId: payload.publicId ?? payload.fileId ?? "",
        fileId: payload.fileId,
        altText: payload.altText,
        width: payload.width,
        height: payload.height,
        format: payload.format,
        size: payload.size,
      };

      setLocalAsset(mediaObj);
      setSuccessMsg(`Uploaded: ${payload.originalFilename ?? payload.filename ?? "file"}`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onChange(mediaObj);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleClear() {
    setLocalAsset(null);
    setSelectedFile(null);
    setError(null);
    setSuccessMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onChange(null);
  }

  const url = displayAsset?.url ?? "";
  const isVideoUrl = /\.(mp4|webm|mov)(\?|$)/i.test(url);
  const isVideo = mediaType === "video" || (mediaType === "any" && isVideoUrl);
  const isImage =
    !isVideo &&
    (mediaType === "image" ||
      (mediaType === "any" && Boolean(url) && !url.endsWith(".pdf")));

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium text-foreground">{label}</span>

      {helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}

      {/* File picker row */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={resolvedAccept}
          className="hidden"
          onChange={handleFileChange}
          aria-label={`Choose file for ${label}`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          Choose file
        </Button>

        {selectedFile ? (
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            {selectedFile.name}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">No file chosen</span>
        )}

        {selectedFile ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={uploading}
            disabled={uploading}
            onClick={handleUpload}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        ) : null}
      </div>

      {/* Status messages */}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {successMsg ? (
        <p className="text-xs text-primary" role="status">
          {successMsg}
        </p>
      ) : null}

      {/* Preview */}
      {showPreview && displayAsset?.url ? (
        <div className="mt-1 flex items-start gap-3">
          {isVideo ? (
            <video
              src={displayAsset.url}
              controls
              preload="metadata"
              className="h-24 w-auto max-w-[220px] rounded-md border border-border bg-black"
            >
              Your browser does not support embedded video.
            </video>
          ) : isImage ? (
            <div className="relative overflow-hidden rounded-md border border-border bg-muted/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayAsset.url}
                alt={displayAsset.altText ?? label}
                className="h-20 w-auto max-w-[160px] object-contain"
              />
            </div>
          ) : (
            <a
              href={displayAsset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-xs text-foreground hover:bg-accent"
            >
              Open file
            </a>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-xs text-muted-foreground"
          >
            Clear
          </Button>
        </div>
      ) : null}
    </div>
  );
}
