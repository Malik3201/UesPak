"use client";

import {
  cloneElement,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import { Send } from "lucide-react";

interface ContactFormProps {
  serviceOptions: string[];
  submitButtonText?: string;
  successMessage?: string;
}

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  subject: "",
  serviceInterest: "",
  message: "",
  consent: false,
  website: "",
};

export default function ContactForm({
  serviceOptions,
  submitButtonText = "Send Message",
  successMessage = "Thank you for your message. Our team will get back to you shortly.",
}: ContactFormProps) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to send message.");
      }
      setSuccess(successMessage);
      setForm(initialForm);
    } catch (errObj) {
      setError(errObj instanceof Error ? errObj.message : "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form id="contact-form" onSubmit={handleSubmit} className="space-y-5">
      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {success}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <div className="hidden">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" required>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} required minLength={2} />
        </Field>
        <Field label="Email" required>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
        </Field>
        <Field label="Phone">
          <input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </Field>
        <Field label="Company">
          <input value={form.company} onChange={(e) => update("company", e.target.value)} />
        </Field>
      </div>

      <Field label="Subject" required>
        <input value={form.subject} onChange={(e) => update("subject", e.target.value)} required minLength={3} />
      </Field>

      {serviceOptions.length ? (
        <Field label="Service interest">
          <select
            value={form.serviceInterest}
            onChange={(e) => update("serviceInterest", e.target.value)}
          >
            <option value="">Select a service</option>
            {serviceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <Field label="Message" required>
        <textarea
          rows={6}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          required
          minLength={10}
        />
      </Field>

      <label className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => update("consent", e.target.checked)}
          className="mt-1"
        />
        I agree that UESPAK may contact me regarding this enquiry.
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#075f3f] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(7,95,63,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#03452e] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
      >
        {submitting ? "Sending..." : submitButtonText}
        <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactElement;
}) {
  const child = children as ReactElement<{
    className?: string;
    placeholder?: string;
  }>;
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-foreground">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      {cloneElement(child, {
        placeholder: child.props.placeholder || label,
        className:
          "w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-[#075f3f] focus:ring-4 focus:ring-emerald-700/10 " +
          (child.props.className || ""),
      })}
    </label>
  );
}
