// ─── Global type augmentations ────────────────────────────────────────────────

// Mongoose global cache (used in src/lib/db.ts)
import type mongoose from "mongoose";

declare global {
  var __mongoose:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

export {};
