const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw data || { error: res.statusText };
  return data;
}

export async function authLogin(email: string, password: string) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function authRegister(payload: { name: string; email: string; password: string; role?: string }) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export default {
  apiFetch,
  authLogin,
  authRegister,
};
// Real API helpers for backend endpoints
export async function getEquipment(page = 1, perPage = 25) {
  return apiFetch(`/api/equipment?page=${page}&perPage=${perPage}`);
}

export async function getEquipmentById(id: string) {
  return apiFetch(`/api/equipment/${id}`);
}

export async function getEquipmentRequests(id: string) {
  return apiFetch(`/api/equipment/${id}/requests`);
}

export async function createEquipment(payload: Record<string, unknown>) {
  return apiFetch(`/api/equipment`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function getRequests(page = 1, perPage = 25, filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ page: String(page), perPage: String(perPage), ...filters });
  return apiFetch(`/api/requests?${params.toString()}`);
}

export async function createRequest(payload: Record<string, unknown>) {
  return apiFetch(`/api/requests`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateRequestStatus(id: string, status: string) {
  return apiFetch(`/api/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function assignRequest(id: string, technicianId: string) {
  return apiFetch(`/api/requests/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ technicianId }) });
}

export async function getTeams() {
  return apiFetch('/api/teams');
}

export async function getTeamMembers(teamId: string) {
  return apiFetch(`/api/teams/${teamId}/members`);
}

export async function getTechnicians() {
  return apiFetch('/api/users?role=TECHNICIAN');
}

export const api = {
  apiFetch,
  authLogin,
  authRegister,
  getEquipment,
  getEquipmentById,
  getEquipmentRequests,
  createEquipment,
  getRequests,
  createRequest,
  updateRequestStatus,
  assignRequest,
  getTeams,
  getTeamMembers,
  getTechnicians,
};
