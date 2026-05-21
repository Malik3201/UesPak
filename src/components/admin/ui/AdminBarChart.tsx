"use client";

interface AdminBarChartProps {
  data: Array<{ label: string; value: number }>;
  maxHeight?: number;
  emptyLabel?: string;
}

export default function AdminBarChart({
  data,
  maxHeight = 140,
  emptyLabel = "No data yet",
}: AdminBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  if (!data.length || data.every((d) => d.value === 0)) {
    return (
      <div className="flex h-[160px] items-center justify-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="flex h-[180px] items-end justify-between gap-1.5 px-1 pt-4" role="img" aria-label="Bar chart">
      {data.map((point) => {
        const h = Math.max(4, Math.round((point.value / max) * maxHeight));
        return (
          <div
            key={point.label}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
            title={`${point.label}: ${point.value}`}
          >
            <span className="text-[10px] font-semibold tabular-nums text-slate-600">
              {point.value > 0 ? point.value : ""}
            </span>
            <div
              className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-[#075f3f] to-[#0d7a52] transition-all"
              style={{ height: h }}
            />
            <span className="w-full truncate text-center text-[9px] text-slate-500">
              {point.label.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
