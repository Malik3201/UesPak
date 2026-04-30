import mongoose from "mongoose";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// ─── Global cache declaration ──────────────────────────────────────────────────
// Using globalThis keeps the connection alive across hot-reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.__mongoose ?? { conn: null, promise: null };

if (!globalThis.__mongoose) {
  globalThis.__mongoose = cached;
}

// ─── connectDB ─────────────────────────────────────────────────────────────────
export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "[UESPAK] MONGODB_URI is not defined. Please set it in your environment variables."
    );
  }

  // Return cached connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is already in progress, wait for it
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        console.log("[UESPAK] MongoDB connected successfully.");
        return m;
      })
      .catch((err) => {
        cached.promise = null; // Reset so next call can retry
        console.error("[UESPAK] MongoDB connection error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
