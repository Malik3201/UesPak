import type { MediaObject } from "@/types/media";

interface PremiumGalleryProps {
  images: MediaObject[];
  title: string;
}

export default function PremiumGallery({ images, title }: PremiumGalleryProps) {
  if (!images.length) return null;

  const [featured, ...rest] = images;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {featured?.url ? (
        <div className="group relative overflow-hidden rounded-2xl md:row-span-2 md:min-h-[320px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={featured.url}
            alt={featured.altText || `${title} gallery`}
            className="h-full min-h-[240px] w-full object-cover transition-transform duration-700 group-hover:scale-105 md:min-h-[320px]"
            loading="lazy"
          />
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 md:col-span-1 md:grid-cols-1">
        {rest.map((img, idx) =>
          img.url ? (
            <div key={`${img.publicId}-${idx}`} className="group relative overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.altText || `${title} image ${idx + 2}`}
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
