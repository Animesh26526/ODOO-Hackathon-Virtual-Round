/* eslint-disable @typescript-eslint/no-explicit-any */
export type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'USER';

export interface User {
  id: string | number;
  name?: string;
  email: string;
  role: UserRole;
  [key: string]: any;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token?: string | null;
}

export interface DashboardStats {
  totalRequests?: number;
  openRequests?: number;
  inProgress?: number;
  completed?: number;
  // additional UI fields used in dashboard
  criticalEquipment?: number;
  inProgressRequests?: number;
  completedThisMonth?: number;
  technicianLoad?: any[];
}

export interface MaintenanceRequest {
  id: string | number;
  subject?: string;
  title?: string;
  description?: string;
  status?: string;
  type?: string;
  scheduledDate?: string | null;
  equipmentId?: string | number | null;
  teamId?: string | number | null;
  technicianId?: string | number | null;
  [key: string]: any;
}

export type Req = MaintenanceRequest;

export interface Equipment {
  id: string | number;
  name: string;
  serialNumber?: string;
  department?: string;
  location?: string;
  warrantyEnd?: string;
  maintenanceCount?: number;
  employeeName?: string;
  category?: { id?: string | number; name?: string } | null;
  team?: { id?: string | number; teamName?: string } | null;
  [key: string]: any;
}
