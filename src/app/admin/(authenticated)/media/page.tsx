import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { MediaAsset } from "@/models/MediaAsset";

export const metadata: Metadata = {
  title: "Media Library | UESPAK Admin",
  robots: { index: false, follow: false },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { type, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const limit = 24;

  await connectDB();

  const filter: Record<string, unknown> = { status: "active" };
  if (type && ["image", "pdf", "document", "other"].includes(type)) {
    filter.type = type;
  }

  const [assets, total] = await Promise.all([
    MediaAsset.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    MediaAsset.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Media Library
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All uploaded assets — images and PDFs managed via Cloudinary.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: "All", value: "" },
          { label: "Images", value: "image" },
          { label: "PDFs", value: "pdf" },
        ].map(({ label, value }) => {
          const active = (type ?? "") === value;
          return (
            <Link
              key={value}
              href={value ? `/admin/media?type=${value}` : "/admin/media"}
              className={[
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground/70 hover:bg-accent",
              ].join(" ")}
            >
              {label}
            </Link>
          );
        })}
        <span className="ml-auto text-xs text-muted-foreground">
          {total} asset{total !== 1 ? "s" : ""}
        </span>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No media assets yet. Upload files via{" "}
            <Link href="/admin/settings" className="text-primary underline underline-offset-4">
              Site Settings
            </Link>{" "}
            to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {assets.map((asset) => (
            <div
              key={String(asset._id)}
              className="group rounded-lg border border-border bg-card overflow-hidden shadow-sm transition-shadow hover:shadow-md"
            >
              {asset.type === "image" ? (
                <div className="aspect-square bg-muted/30 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.secureUrl || asset.url}
                    alt={asset.altText ?? asset.originalFilename ?? "media"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center bg-muted/30">
                  <span className="text-3xl text-muted-foreground">📄</span>
                </div>
              )}
              <div className="p-2">
                <p
                  className="truncate text-xs font-medium text-foreground"
                  title={asset.originalFilename ?? asset.filename ?? asset.publicId}
                >
                  {asset.originalFilename ?? asset.filename ?? asset.publicId}
                </p>
                <p className="text-xs text-muted-foreground">
                  {asset.type.toUpperCase()} &middot; {formatBytes(asset.size)}
                </p>
                {asset.type !== "image" ? (
                  <a
                    href={asset.secureUrl || asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-primary hover:underline"
                  >
                    Open
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2 pt-4">
          {page > 1 ? (
            <Link
              href={`/admin/media?${type ? `type=${type}&` : ""}page=${page - 1}`}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-accent"
            >
              Previous
            </Link>
          ) : null}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/admin/media?${type ? `type=${type}&` : ""}page=${page + 1}`}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-accent"
            >
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
