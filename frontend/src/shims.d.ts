/* eslint-disable @typescript-eslint/no-explicit-any */
// Use the real `src/types.ts` definitions for `@/types`.

declare module '@/services/api' {
  export const api: any;
  export function apiFetch(path: string, options?: any): Promise<any>;
  export function authLogin(email: string, password: string): Promise<any>;
  export function authRegister(payload: any): Promise<any>;
  export function getRequests(...args: any[]): Promise<any>;
  export function getEquipment(...args: any[]): Promise<any>;
  export default api;
}

declare module '@/lib/utils' {
  export function getRoleLanding(role?: string | null): string;
  export function cn(...args: any[]): string;
}

declare module '@/lib/api' {
  export const api: any;
  export const authLogin: any;
  export const authRegister: any;
}

declare module '@/context/AuthContext' {
  import type { ReactNode } from 'react';
  export function AuthProvider({ children }: { children: ReactNode }): any;
  export function useAuth(): any;
}

declare module '@/components/layout/AppLayout' {
  export const AppLayout: any;
}

declare module '@/components/dashboard/StatCard' { export const StatCard: any }
declare module '@/components/dashboard/RecentRequestsCard' { export const RecentRequestsCard: any }
declare module '@/components/dashboard/TechnicianLoadCard' { export const TechnicianLoadCard: any }

declare module '@/components/ui/button' { export const Button: any; export const buttonVariants: any }
declare module '@/components/ui/input' { export const Input: any }
declare module '@/components/ui/label' { export const Label: any }
declare module '@/components/ui/toaster' { export const Toaster: any }
declare module '@/components/ui/sonner' { export const Toaster: any }
declare module '@/components/ui/tooltip' { export const TooltipProvider: any }
declare module '@/components/ui/card' { export const Card: any; export const CardContent: any; export const CardHeader: any; export const CardTitle: any }
declare module '@/components/ui/badge' { export const Badge: any }
declare module '@/components/ui/calendar' { export const Calendar: any }

declare module '@/components/ui/table' { export const Table: any; export const TableBody: any; export const TableCell: any; export const TableHead: any; export const TableHeader: any; export const TableRow: any }
declare module '@/components/ui/dialog' { export const Dialog: any; export const DialogContent: any; export const DialogDescription: any; export const DialogHeader: any; export const DialogTitle: any; export const DialogTrigger: any }

declare module 'next/link' {
  const Link: any;
  export default Link;
}
