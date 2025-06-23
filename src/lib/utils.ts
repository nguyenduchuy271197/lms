import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[đ]/g, "d") // Replace Vietnamese đ
    .replace(/[Đ]/g, "d") // Replace Vietnamese Đ
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
}

export function formatNumber(value: number): string {
  if (isNaN(value) || !isFinite(value)) {
    return "0";
  }
  
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function formatPercent(value: number): string {
  if (isNaN(value) || !isFinite(value)) {
    return "0%";
  }
  
  return new Intl.NumberFormat("vi-VN", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}
