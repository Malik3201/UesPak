"use client";

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface AdminStatusChartProps {
  segments: Segment[];
  title?: string;
}

export default function AdminStatusChart({ segments, title }: AdminStatusChartProps) {
  const total = segments.reduce((s, x) => s + x.value, 0);

  if (total === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-500">No content records yet</div>
    );
  }

  const stops = segments
    .filter((s) => s.value > 0)
    .reduce<{ parts: string[]; offset: number }>(
      (acc, s) => {
        const pct = (s.value / total) * 100;
        const start = acc.offset;
        const end = acc.offset + pct;
        acc.parts.push(`${s.color} ${start}% ${end}%`);
        return { parts: acc.parts, offset: end };
      },
      { parts: [], offset: 0 }
    )
    .parts.join(", ");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div
        className="mx-auto h-28 w-28 shrink-0 rounded-full shadow-inner sm:mx-0"
        style={{ background: `conic-gradient(${stops})` }}
        role="img"
        aria-label={title || "Status distribution"}
      />
      <ul className="flex-1 space-y-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-slate-700">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
                aria-hidden
              />
              {s.label}
            </span>
            <span className="font-semibold tabular-nums text-slate-900">
              {s.value}{" "}
              <span className="text-xs font-normal text-slate-500">
                ({Math.round((s.value / total) * 100)}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
