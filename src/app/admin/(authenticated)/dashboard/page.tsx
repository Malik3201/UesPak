import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | UESPAK",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome to the UESPAK Admin Panel.
        </p>
      </div>

      {/* Stats grid placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Services", value: "—" },
          { label: "Projects", value: "—" },
          { label: "Team Members", value: "—" },
          { label: "New Enquiries", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Dashboard stats will be populated once content modules are built in
          Phase 2.
        </p>
      </div>
    </div>
  );
}
