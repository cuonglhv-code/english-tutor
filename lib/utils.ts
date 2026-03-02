import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function roundToHalfBand(score: number): number {
  return Math.round(score * 2) / 2;
}

export function bandToColor(band: number): string {
  if (band >= 8) return "text-green-600 dark:text-green-400";
  if (band >= 7) return "text-blue-600 dark:text-blue-400";
  if (band >= 6) return "text-yellow-600 dark:text-yellow-400";
  if (band >= 5) return "text-orange-500";
  return "text-red-600";
}

export function bandToBg(band: number): string {
  if (band >= 8) return "bg-green-50 dark:bg-green-900/20";
  if (band >= 7) return "bg-blue-50 dark:bg-blue-900/20";
  if (band >= 6) return "bg-yellow-50 dark:bg-yellow-900/20";
  if (band >= 5) return "bg-orange-50 dark:bg-orange-900/20";
  return "bg-red-50 dark:bg-red-900/20";
}

export const VN_CITIES = [
  "Hanoi",
  "Ho Chi Minh City",
  "Da Nang",
  "Hai Phong",
  "Can Tho",
  "Bien Hoa",
  "Nam Dinh",
  "Hue",
  "Buon Ma Thuot",
  "Vung Tau",
  "Da Lat",
  "Nha Trang",
  "Quy Nhon",
  "Thai Nguyen",
  "Vinh",
  "Bac Ninh",
  "Rach Gia",
  "Long Xuyen",
  "My Tho",
  "Thu Dau Mot",
  "Phan Thiet",
  "Cam Ranh",
  "Ha Long",
  "Uong Bi",
  "Thanh Hoa",
];

export const HALF_BANDS = [
  "0", "0.5", "1", "1.5", "2", "2.5", "3", "3.5",
  "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5",
  "8", "8.5", "9",
];

export const TARGET_BANDS = [
  "5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0",
];
