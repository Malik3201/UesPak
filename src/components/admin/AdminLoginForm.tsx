"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginValidator, type LoginInput } from "@/validators/auth.validator";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";

type LoginApiJson = {
  success?: boolean;
  message?: string;
};

export default function AdminLoginForm() {
  const router = useRouter();
  const [genericError, setGenericError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginValidator),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: LoginInput) {
    setGenericError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const text = await res.text();
      let json: LoginApiJson | null = null;
      if (text) {
        try {
          json = JSON.parse(text) as LoginApiJson;
        } catch {
          json = null;
        }
      }

      if (!res.ok || json?.success !== true) {
        setGenericError(
          typeof json?.message === "string"
            ? json.message
            : "Invalid email or password."
        );
        return;
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setGenericError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-lg px-8 py-10">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="text-2xl font-bold text-primary tracking-tight"
        >
          UESPAK
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">Admin Panel</p>
        <h1 className="mt-4 text-xl font-semibold text-foreground">
          Sign in to your account
        </h1>
      </div>

      <form
        noValidate
        className="space-y-5"
        id="admin-login-form"
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit(onSubmit)(e);
        }}
      >
        {genericError && (
          <p
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {genericError}
          </p>
        )}

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          disabled={isSubmitting}
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          disabled={isSubmitting}
          error={form.formState.errors.password?.message}
          {...form.register("password")}
        />

        <Button
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          id="login-submit-btn"
        >
          Sign In
        </Button>
      </form>
    </div>
  );
}
