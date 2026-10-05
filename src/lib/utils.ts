import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCY_SYMBOL, LOCALE, TIMEZONE } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(
  amount: number | null | undefined,
  options?: { fallback?: string },
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return options?.fallback ?? "A cotizar";
  }
  return `${CURRENCY_SYMBOL} ${amount.toLocaleString(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(
  value: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function fullName(
  firstName?: string | null,
  lastName?: string | null,
  fallback = "Usuario",
): string {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || fallback;
}

export function locationLabel(
  department?: string | null,
  city?: string | null,
  district?: string | null,
): string {
  return [district, city, department].filter(Boolean).join(", ") || "Perú";
}

export function mbToBytes(mb: number): number {
  return mb * 1024 * 1024;
}

export function averageRating(ratings: number[]): number | null {
  if (!ratings.length) return null;
  const sum = ratings.reduce((acc, n) => acc + n, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

export function getInitials(name?: string | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function safeRedirectPath(
  path: string | null | undefined,
  fallback = "/",
): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}
