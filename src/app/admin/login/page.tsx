import type { Metadata } from "next";
import Link from "next/link";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login | UESPAK",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md">
        <AdminLoginForm />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}{" "}
          <Link href="/" className="underline-offset-4 hover:underline">
            UESPAK
          </Link>
          . All rights reserved.
        </p>
      </div>
    </div>
  );
}
