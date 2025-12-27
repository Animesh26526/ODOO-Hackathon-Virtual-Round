// User & Auth Types
export type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

// Equipment Types
export interface EquipmentCategory {
  id: string;
  name: string;
  responsibleUserId: string;
  company: string;
}

export interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
  employeeName: string;
  department: string;
  location: string;
  purchaseDate: string;
  warrantyEnd: string;
  categoryId: string;
  category?: EquipmentCategory;
  teamId: string;
  team?: MaintenanceTeam;
  technicianId?: string;
  technician?: User;
  isScrapped: boolean;
  company: string;
  maintenanceCount?: number;
}

// Team Types
export interface MaintenanceTeam {
  id: string;
  teamName: string;
  company: string;
  members?: TeamMember[];
}

export interface TeamMember {
  teamId: string;
  userId: string;
  user?: User;
}

// Maintenance Request Types
export type RequestStatus = 'NEW' | 'IN_PROGRESS' | 'REPAIRED' | 'SCRAP';
export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type MaintenanceType = 'CORRECTIVE' | 'PREVENTIVE';

export interface MaintenanceRequest {
  id: string;
  subject: string;
  description: string;
  equipmentId: string;
  equipment?: Equipment;
  requesterId: string;
  requester?: User;
  teamId?: string;
  team?: MaintenanceTeam;
  technicianId?: string;
  technician?: User;
  status: RequestStatus;
  priority: RequestPriority;
  type: MaintenanceType;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
}

// Work Center Types
export interface WorkCenter {
  id: string;
  name: string;
  code: string;
  costPerHour: number;
  capacity: number;
  oeeTarget: number;
}

// Dashboard Types
export interface DashboardStats {
  criticalEquipment: number;
  openRequests: number;
  inProgressRequests: number;
  completedThisMonth: number;
  technicianLoad: TechnicianLoad[];
}

export interface TechnicianLoad {
  technician: User;
  assignedCount: number;
  completedCount: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
