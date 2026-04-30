// ─── Media object ──────────────────────────────────────────────────────────────
export interface MediaObject {
  url: string;
  publicId: string;
  altText?: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
}

// ─── File upload state ─────────────────────────────────────────────────────────
export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  result: MediaObject | null;
}
