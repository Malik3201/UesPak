import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Login | UESPAK",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-xl border border-border bg-card shadow-lg px-8 py-10">
          <div className="mb-8 text-center">
            <Link href="/" className="text-2xl font-bold text-primary tracking-tight">
              UESPAK
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">Admin Panel</p>
            <h1 className="mt-4 text-xl font-semibold text-foreground">
              Sign in to your account
            </h1>
          </div>

          {/* Form — wired in Phase 2 with React Hook Form + Zod */}
          <form action="/api/auth/login" method="POST" className="space-y-5" id="admin-login-form">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@uespak.com"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} UESPAK. All rights reserved.
        </p>
      </div>
    </div>
  );
}
