import { connectDB } from "@/lib/db";
import { normalizeRedirectPath } from "@/lib/redirect-path";
import { Redirect, type IRedirect } from "@/models/Redirect";
import type { RedirectDto, RedirectLookupResult, RedirectStatusCode } from "@/types/redirect";

export { normalizeRedirectPath } from "@/lib/redirect-path";

let activeMap: Map<string, RedirectLookupResult> | null = null;
let mapLoadedAt = 0;
const MAP_CACHE_MS = 30_000;

export function clearRedirectCache(): void {
  activeMap = null;
  mapLoadedAt = 0;
}

export function validateRedirectTarget(toPath: string): boolean {
  const t = toPath.trim();
  if (!t) return false;
  if (t.startsWith("/")) return true;
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function serializeRedirect(doc: IRedirect & { _id: unknown }): RedirectDto {
  return {
    id: String(doc._id),
    fromPath: doc.fromPath,
    toPath: doc.toPath,
    statusCode: doc.statusCode as RedirectStatusCode,
    isActive: doc.isActive,
    notes: doc.notes,
    hitCount: doc.hitCount ?? 0,
    lastHitAt: doc.lastHitAt ? new Date(doc.lastHitAt).toISOString() : undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
  };
}

export async function loadActiveRedirectsMap(): Promise<
  Map<string, RedirectLookupResult>
> {
  if (activeMap && Date.now() - mapLoadedAt < MAP_CACHE_MS) {
    return activeMap;
  }

  const map = new Map<string, RedirectLookupResult>();
  try {
    await connectDB();
    const docs = await Redirect.find({ isActive: true })
      .select("fromPath toPath statusCode")
      .lean();

    for (const doc of docs) {
      const from = normalizeRedirectPath(doc.fromPath);
      map.set(from, {
        id: String(doc._id),
        toPath: doc.toPath,
        statusCode: doc.statusCode as RedirectStatusCode,
      });
    }
    activeMap = map;
    mapLoadedAt = Date.now();
  } catch {
    return map;
  }

  return map;
}

export async function getActiveRedirectByPath(
  path: string
): Promise<RedirectLookupResult | null> {
  const normalized = normalizeRedirectPath(path);
  const map = await loadActiveRedirectsMap();
  return map.get(normalized) ?? null;
}

/** Detect simple A→B→A loops when saving. */
export async function wouldCreateRedirectLoop(
  fromPath: string,
  toPath: string,
  excludeId?: string
): Promise<boolean> {
  const from = normalizeRedirectPath(fromPath);
  let target = toPath.trim();

  if (/^https?:\/\//i.test(target)) return false;

  target = normalizeRedirectPath(target);
  if (target === from) return true;

  try {
    await connectDB();
    const visited = new Set<string>([from]);
    let current = target;
    let depth = 0;

    while (depth < 10) {
      if (visited.has(current)) return true;
      visited.add(current);

      const filter: Record<string, unknown> = {
        fromPath: current,
        isActive: true,
      };
      if (excludeId) filter._id = { $ne: excludeId };

      const next = await Redirect.findOne(filter).select("toPath").lean();
      if (!next?.toPath) return false;

      const nextTarget = next.toPath.trim();
      if (/^https?:\/\//i.test(nextTarget)) return false;
      current = normalizeRedirectPath(nextTarget);
      if (current === from) return true;
      depth++;
    }
    return false;
  } catch {
    return false;
  }
}

export interface AdminRedirectsFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export async function getAdminRedirects(filters: AdminRedirectsFilters = {}): Promise<{
  redirects: RedirectDto[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));

  await connectDB();

  const query: Record<string, unknown> = {};
  if (typeof filters.isActive === "boolean") query.isActive = filters.isActive;
  if (filters.search?.trim()) {
    const s = filters.search.trim();
    query.$or = [
      { fromPath: { $regex: s, $options: "i" } },
      { toPath: { $regex: s, $options: "i" } },
      { notes: { $regex: s, $options: "i" } },
    ];
  }

  const [docs, total] = await Promise.all([
    Redirect.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Redirect.countDocuments(query),
  ]);

  return {
    redirects: docs.map((d) => serializeRedirect(d as IRedirect & { _id: unknown })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getRedirectById(id: string): Promise<RedirectDto | null> {
  try {
    await connectDB();
    const doc = await Redirect.findById(id).lean();
    if (!doc) return null;
    return serializeRedirect(doc as IRedirect & { _id: unknown });
  } catch {
    return null;
  }
}

export async function incrementRedirectHit(id: string): Promise<void> {
  try {
    await connectDB();
    await Redirect.findByIdAndUpdate(id, {
      $inc: { hitCount: 1 },
      $set: { lastHitAt: new Date() },
    });
  } catch {
    // Non-blocking analytics
  }
}

export { serializeRedirect };
