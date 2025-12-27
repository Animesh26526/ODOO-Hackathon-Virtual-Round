export function getRoleLanding(role?: string | null) {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'MANAGER':
      return '/manager-dashboard';
    case 'TECHNICIAN':
      return '/dashboard';
    case 'USER':
    default:
      return '/dashboard';
  }
}

export function cn(...args: unknown[]) {
  return args.filter(Boolean).join(' ');
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function c1n(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
