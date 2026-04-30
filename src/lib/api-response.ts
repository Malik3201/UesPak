import type { NextResponse } from "next/server";

// ─── Response shape ────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
export function successResponse<T>(
  message: string,
  data?: T,
  status = 200
): Response {
  const body: ApiResponse<T> = { success: true, message, ...(data !== undefined && { data }) };
  return Response.json(body, { status });
}

export function errorResponse(message: string, status = 500): Response {
  const body: ApiResponse = { success: false, message };
  return Response.json(body, { status });
}

export function validationErrorResponse(errors: unknown): Response {
  const body: ApiResponse = {
    success: false,
    message: "Validation failed. Please check your input.",
    errors,
  };
  return Response.json(body, { status: 422 });
}

export function unauthorizedResponse(
  message = "Unauthorized. Please log in."
): Response {
  const body: ApiResponse = { success: false, message };
  return Response.json(body, { status: 401 });
}

export function forbiddenResponse(
  message = "Forbidden. You do not have permission to perform this action."
): Response {
  const body: ApiResponse = { success: false, message };
  return Response.json(body, { status: 403 });
}

export function notFoundResponse(message = "Resource not found."): Response {
  const body: ApiResponse = { success: false, message };
  return Response.json(body, { status: 404 });
}

// Re-export NextResponse type for route handlers that need it
export type { NextResponse };
