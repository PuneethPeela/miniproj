const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data as T;
}

export const auth = {
  login: (email: string, password: string) =>
    request<{ token: string; user: import('../types').User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role: string) =>
    request<{ token: string; user: import('../types').User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  getProfile: () => request<import('../types').User>('/auth/profile'),
};

export const menu = {
  getAll: () => request<import('../types').MenuItem[]>('/menu'),
  getById: (id: string) => request<import('../types').MenuItem>(`/menu/${id}`),
  create: (data: Partial<import('../types').MenuItem>) =>
    request<import('../types').MenuItem>('/menu', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<import('../types').MenuItem>) =>
    request<import('../types').MenuItem>(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<{ message: string }>(`/menu/${id}`, { method: 'DELETE' }),
};

export const orders = {
  create: (items: { menuItemId: string; quantity: number }[]) =>
    request<import('../types').Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  getAll: () => request<import('../types').Order[]>('/orders'),

  getById: (id: string) => request<import('../types').Order>(`/orders/${id}`),

  getActive: () => request<import('../types').Order[]>('/orders/active/all'),

  updateStatus: (id: string, status: import('../types').OrderStatus) =>
    request<import('../types').Order>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  pickUp: (id: string) =>
    request<import('../types').Order>(`/orders/${id}/pickup`, {
      method: 'PUT',
    }),

  cancel: (id: string) =>
    request<import('../types').Order>(`/orders/${id}/cancel`, {
      method: 'PUT',
    }),
};

export const queue = {
  getStatus: () => request<import('../types').QueueStatus>('/queue/status'),
};

export interface DashboardStats {
  activeOrders: number;
  avgWaitTime: number;
  queueLength: number;
  kitchenLoad: number;
}

export interface BatchAggregatorItem {
  menuItemId: string;
  name: string;
  totalQuantity: number;
  orderCount: number;
}

export interface BatchAggregatorResponse {
  windowMinutes: number;
  totalUnits: number;
  uniqueDishTypes: number;
  ordersInWindow: number;
  items: BatchAggregatorItem[];
}

export interface StockRequest {
  id: string;
  menuItemId: string;
  menuItem?: import('../types').MenuItem;
  requestedBy: string;
  requester?: import('../types').User;
  quantity: number;
  reason?: string;
  status: string;
  reviewedBy?: string;
  reviewer?: import('../types').User;
  reviewedAt?: string;
  createdAt: string;
}

export const dashboard = {
  getStats: () => request<DashboardStats>('/dashboard/stats'),
  getBatch: (windowMinutes: number = 5) =>
    request<BatchAggregatorResponse>(`/dashboard/batch?window=${windowMinutes}`),
};

export const stockRequests = {
  create: (data: { menuItemId: string; quantity: number; reason?: string }) =>
    request<StockRequest>('/stock-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getPending: () => request<StockRequest[]>('/stock-requests/pending'),
  getMine: () => request<StockRequest[]>('/stock-requests/mine'),
  approve: (id: string) =>
    request<StockRequest>(`/stock-requests/${id}/approve`, { method: 'PUT' }),
  reject: (id: string) =>
    request<StockRequest>(`/stock-requests/${id}/reject`, { method: 'PUT' }),
};
